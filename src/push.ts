import {Hono} from 'hono'
import {buildPushPayload} from '@block65/webcrypto-web-push'
import {getActor,audit} from './staff'

// Free Web Push for new-request alerts (dodamdc pattern). VAPID keys live only in Pages secrets
// (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT). Reservation alerts show name + treatment
// (never phone/contact); payloads are end-to-end encrypted to the registered staff devices.
export type PushPayload={title:string;body:string;url:string;tag:string}
export type PushRow={id:number;endpoint:string;p256dh:string;auth:string;fail_count:number}
export type PushResult={sent:number;failed:number;removed:number;skipped?:string}
type PushEnv={VAPID_PUBLIC_KEY?:string;VAPID_PRIVATE_KEY?:string;VAPID_SUBJECT?:string}
const MAX_FAILS=5
export const pushConfigured=(env:PushEnv)=>!!(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY&&env.VAPID_SUBJECT)

// Each delivery settles independently; bookkeeping errors are swallowed so push can never affect the caller.
export async function sendPushTo(env:PushEnv,db:any,rows:PushRow[],payload:PushPayload):Promise<PushResult>{
 const result:PushResult={sent:0,failed:0,removed:0}
 if(!pushConfigured(env))return {...result,skipped:'vapid-not-configured'}
 if(!rows.length)return {...result,skipped:'no-devices'}
 const vapid={subject:env.VAPID_SUBJECT!,publicKey:env.VAPID_PUBLIC_KEY!,privateKey:env.VAPID_PRIVATE_KEY!}
 const outcomes=await Promise.allSettled(rows.map(async row=>{
  const built=await buildPushPayload({data:payload,options:{ttl:3600,urgency:'high'}},{endpoint:row.endpoint,expirationTime:null,keys:{p256dh:row.p256dh,auth:row.auth}},vapid)
  const res=await fetch(row.endpoint,{method:'POST',headers:built.headers as any,body:built.body as any,signal:AbortSignal.timeout(10000)})
  return res.status
 }))
 const statements:any[]=[]
 outcomes.forEach((o,i)=>{
  const row=rows[i],status=o.status==='fulfilled'?o.value:0
  if(status>=200&&status<300){result.sent++;statements.push(db.prepare('UPDATE push_subscriptions SET last_ok_at=CURRENT_TIMESTAMP,fail_count=0 WHERE id=?').bind(row.id))}
  else if(status===404||status===410){result.removed++;statements.push(db.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(row.id))}
  else{
   result.failed++
   if(row.fail_count+1>=MAX_FAILS){result.removed++;statements.push(db.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(row.id))}
   else statements.push(db.prepare('UPDATE push_subscriptions SET fail_count=fail_count+1 WHERE id=?').bind(row.id))
   console.warn(JSON.stringify({event:'push_failed',device:row.id,status,reason:o.status==='rejected'?String((o.reason as any)?.message||o.reason).slice(0,120):''}))
  }
 })
 try{if(statements.length)await db.batch(statements)}catch(e:any){console.warn(JSON.stringify({event:'push_bookkeeping_failed',message:String(e?.message||e).slice(0,120)}))}
 return result
}
export async function loadPushRows(db:any,endpoint?:string|null):Promise<PushRow[]>{
 const q=endpoint?db.prepare('SELECT id,endpoint,p256dh,auth,fail_count FROM push_subscriptions WHERE endpoint=?').bind(endpoint):db.prepare('SELECT id,endpoint,p256dh,auth,fail_count FROM push_subscriptions ORDER BY id')
 return (await q.all()).results||[]
}
// Called via waitUntil after a request is stored. Must never reject.
export async function notifyNewRequest(env:any,payload:PushPayload):Promise<PushResult>{
 try{
  if(!pushConfigured(env))return {sent:0,failed:0,removed:0,skipped:'vapid-not-configured'}
  const result=await sendPushTo(env,env.DB,await loadPushRows(env.DB),payload)
  console.log(JSON.stringify({event:'push_new_request',tag:payload.tag.replace(/[^a-z-]/g,''),...result}))
  return result
 }catch(e:any){console.warn(JSON.stringify({event:'push_new_request_error',message:String(e?.message||e).slice(0,120)}));return {sent:0,failed:0,removed:0,skipped:'error'}}
}

const deviceRows=async(db:any)=>((await db.prepare('SELECT id,endpoint,label,created_at,last_ok_at,fail_count FROM push_subscriptions ORDER BY created_at DESC').all()).results||[]).map((r:any)=>({id:r.id,endpoint:r.endpoint,label:r.label||'이름 없는 기기',createdAt:r.created_at,lastOkAt:r.last_ok_at,failCount:r.fail_count}))
const validKey=(v:unknown,max:number)=>typeof v==='string'&&v.length>0&&v.length<=max&&/^[A-Za-z0-9_\-=+/]+$/.test(v)
const validEndpoint=(v:unknown)=>{if(typeof v!=='string'||v.length>2048)return false;try{return new URL(v).protocol==='https:'}catch{return false}}
// Mounted under /api/admin (session + Origin checks are applied by the admin middleware).
export const pushRoutes=new Hono<any>()
pushRoutes.get('/push/devices',async c=>c.json({configured:pushConfigured(c.env),publicKey:c.env.VAPID_PUBLIC_KEY||'',devices:await deviceRows(c.env.DB)}))
pushRoutes.post('/push/subscribe',async c=>{
 const body=await c.req.json().catch(()=>null),sub=body?.subscription,endpoint=sub?.endpoint,p256dh=sub?.keys?.p256dh,auth=sub?.keys?.auth
 if(!validEndpoint(endpoint)||!validKey(p256dh,200)||!validKey(auth,64))return c.json({error:'구독 정보가 올바르지 않습니다.'},400)
 if(((await c.env.DB.prepare('SELECT COUNT(*) n FROM push_subscriptions').first())?.n||0)>=30&&!await c.env.DB.prepare('SELECT id FROM push_subscriptions WHERE endpoint=?').bind(endpoint).first())return c.json({error:'알림 기기는 최대 30대입니다. 사용하지 않는 기기를 먼저 해제하세요.'},400)
 const label=String(body?.label||'').replace(/[<>]/g,'').trim().slice(0,80)||null,actor=await getActor(c)
 await c.env.DB.prepare('INSERT INTO push_subscriptions(endpoint,p256dh,auth,label,staff_id) VALUES(?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth,label=COALESCE(excluded.label,label),staff_id=excluded.staff_id,fail_count=0').bind(endpoint,p256dh,auth,label,actor?.id||'').run()
 await audit(c,'push.subscribe',label||'device')
 return c.json({ok:true,devices:await deviceRows(c.env.DB)})
})
pushRoutes.post('/push/unsubscribe',async c=>{
 const body=await c.req.json().catch(()=>null);if(!validEndpoint(body?.endpoint))return c.json({error:'구독 정보가 올바르지 않습니다.'},400)
 await c.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint=?').bind(body.endpoint).run();await audit(c,'push.unsubscribe','device')
 return c.json({ok:true,devices:await deviceRows(c.env.DB)})
})
pushRoutes.post('/push/test',async c=>{
 if(!pushConfigured(c.env))return c.json({error:'서버에 알림 키가 설정되지 않았습니다. 제작 담당자에게 문의하세요.'},503)
 const body=await c.req.json().catch(()=>({})),endpoint=validEndpoint(body?.endpoint)?String(body.endpoint):null,rows=await loadPushRows(c.env.DB,endpoint)
 if(!rows.length)return c.json({error:endpoint?'이 기기는 아직 등록되지 않았습니다.':'등록된 기기가 없습니다.'},404)
 const actor=await getActor(c),result=await sendPushTo(c.env,c.env.DB,rows,{title:'더굿모닝치과 · 테스트 알림',body:`${actor?.name||'관리자'}님이 보낸 테스트입니다. 새 예약 상담 신청이 들어오면 이렇게 알려드립니다.`,url:'/admin/notifications',tag:'push-test-'+Date.now()})
 return c.json({ok:result.sent>0,...result,devices:await deviceRows(c.env.DB)})
})

// Admin-only PWA manifest so iOS can "Add to Home Screen" the admin and receive pushes.
export const adminManifest={id:'/admin',name:'더굿모닝 관리자',short_name:'굿모닝 관리자',start_url:'/admin/notifications',scope:'/',display:'standalone',background_color:'#ffffff',theme_color:'#242725',icons:[{src:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'},{src:'/static/images/admin-icon-192.png',sizes:'192x192',type:'image/png'},{src:'/static/images/admin-icon-512.png',sizes:'512x512',type:'image/png'}]}

export function notificationsPage(configured:boolean,publicKey:string){
 return `<section class="content-section"><div class="wrap admin-shell feature-admin"><p><a class="text-link" href="/admin">← 관리자 화면으로</a></p><div class="feature-panel"><h1 class="feature-title">알림 설정</h1><h2>예약 알림을 휴대폰으로 받기 (웹 푸시 · 무료)</h2><p>홈페이지에서 <strong>예약 상담 신청</strong>·지원서·방문 통역 요청이 들어오면 등록한 휴대폰·PC로 알림을 보냅니다. 문자 요금이 들지 않으며, 알림을 받을 기기마다 한 번씩 아래 버튼으로 켜 주세요. 예약 신청 알림에는 <strong>“새 예약 신청 – 이름 / 희망 진료”</strong>가 표시되고(연락처 제외), 누르면 예약 접수함으로 이동합니다. 원장님·실장님·데스크 등 여러 대를 등록할 수 있습니다.</p>${configured?'':'<p class="alert">서버에 알림 키(VAPID)가 아직 설정되지 않아 발송되지 않습니다. 제작 담당자에게 문의해 주세요.</p>'}<div id="push-panel" data-public-key="${publicKey.replace(/[^A-Za-z0-9_-]/g,'')}" data-configured="${configured?'1':'0'}"><p id="push-status" role="status">확인 중…</p><p id="push-hint" hidden></p><div class="studio-actions"><button type="button" id="push-enable" class="btn primary" disabled>알림 받기</button><button type="button" id="push-test" class="btn outline" disabled>테스트 알림 보내기</button></div></div></div><div class="feature-panel"><h2>설정 방법</h2><h3>아이폰·아이패드 (iOS 16.4 이상)</h3><ol><li>사파리로 <code>https://thegoodmorningdc.kr/admin</code>에 접속해 로그인합니다.</li><li>하단 <strong>공유</strong> 버튼 → <strong>홈 화면에 추가</strong>를 누릅니다. (아이폰은 이 단계가 있어야 알림이 옵니다.)</li><li>홈 화면에 생긴 <strong>‘굿모닝 관리자’</strong> 아이콘으로 다시 열고 → <strong>알림 설정</strong>(<code>/admin/notifications</code>) → <strong>알림 받기</strong> → ‘허용’을 선택합니다.</li></ol><h3>안드로이드 (크롬·삼성 인터넷)</h3><ol><li>크롬으로 관리자에 로그인한 뒤 <strong>알림 설정</strong>(<code>/admin/notifications</code>)을 엽니다.</li><li><strong>알림 받기</strong>를 누르고 ‘허용’을 선택합니다.</li><li>(선택) 크롬 메뉴 → <strong>홈 화면에 추가</strong>를 하면 앱처럼 바로 열 수 있습니다.</li></ol><p>PC 크롬·엣지에서도 같은 방법으로 켤 수 있습니다. 브라우저 데이터를 지우거나 홈 화면 아이콘을 삭제하면 다시 등록해야 하고, 방해금지·알림 꺼짐 상태에서는 알림이 오지 않습니다. 알림이 오지 않으면 휴대폰 설정 → 알림에서 ‘굿모닝 관리자’(또는 사파리·크롬) 알림 허용을 확인하고, <strong>테스트 알림 보내기</strong>로 확인하세요. 알림은 보조 수단이므로 접수함도 정기적으로 확인해 주세요.</p></div><div class="feature-panel"><h2>알림 받는 기기 <span id="push-count"></span></h2><p>기기를 바꾸거나 알림을 끄려면 ‘해제’를 누르세요. 발송이 5회 연속 실패한 기기는 자동으로 제거됩니다.</p><ul id="push-devices" class="push-devices"><li>불러오는 중…</li></ul></div></div></section>`
}
