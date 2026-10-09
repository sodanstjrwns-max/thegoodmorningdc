import {Hono} from 'hono'
import {audit,getActor} from './staff'
export const notificationRoutes=new Hono<any>()
async function settings(db:any){const r=await db.prepare("SELECT value_json,revision FROM operation_settings WHERE key='notifications'").first();return {config:r?JSON.parse(r.value_json):{enabled:false,from:'',to:''},revision:r?.revision||0}}
export async function notifyRequest(env:any,id:string){await env.DB.prepare('INSERT OR IGNORE INTO notification_outbox(id,request_id,created_at) SELECT ?,id,? FROM service_requests WHERE id=? AND expires_at>?').bind(crypto.randomUUID(),Date.now(),id,Date.now()).run();await dispatchNotifications(env)}
export async function dispatchNotifications(env:any){
 const {config}=await settings(env.DB);if(!config.enabled||!env.RESEND_API_KEY||!config.from||!config.to)return
 const now=Date.now();await env.DB.prepare("UPDATE notification_outbox SET state='failed',lease_until=0,last_result='재시도 한도 도달' WHERE state='sending' AND attempts>=5 AND lease_until<?").bind(now).run();const rows=(await env.DB.prepare("SELECT n.id,n.request_id,n.attempts FROM notification_outbox n JOIN service_requests r ON r.id=n.request_id WHERE r.expires_at>? AND n.attempts<5 AND n.next_attempt<=? AND (n.state='pending' OR (n.state='sending' AND n.lease_until<?)) ORDER BY n.created_at LIMIT 3").bind(now,now,now).all()).results||[]
 for(const r of rows){
  const claim=await env.DB.prepare("UPDATE notification_outbox SET state='sending',lease_until=?,attempts=attempts+1 WHERE id=? AND attempts=? AND (state='pending' OR (state='sending' AND lease_until<?))").bind(now+60000,r.id,r.attempts,now).run();if(!claim.meta.changes)continue
  try{
   const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'gm-request-'+r.id},body:JSON.stringify({from:config.from,to:[config.to],subject:'더굿모닝치과 · 새 접수가 있습니다',text:'새 접수가 있습니다. 개인정보 보호를 위해 상세 내용은 관리자 접수함에서 확인해 주세요.\nhttps://webapp-2-9y5.pages.dev/admin\n접수만으로 예약·통역·채용이 확정되는 것은 아닙니다.'}),signal:AbortSignal.timeout(8000)})
   if(!res.ok)throw Error('HTTP '+res.status)
   await env.DB.prepare("UPDATE notification_outbox SET state='sent',sent_at=?,last_result='발송 서비스 접수 완료',lease_until=0 WHERE id=?").bind(Date.now(),r.id).run()
  }catch(e){const attempt=r.attempts+1;await env.DB.prepare("UPDATE notification_outbox SET state=?,next_attempt=?,lease_until=0,last_result=? WHERE id=?").bind(attempt>=5?'failed':'pending',Date.now()+Math.min(3600000,60000*2**attempt),(e instanceof Error&&/^HTTP \d+$/.test(e.message))?e.message:'연결 또는 시간 초과',r.id).run()}
 }
}
notificationRoutes.get('/notifications',async c=>{const {config,revision}=await settings(c.env.DB),actor=await getActor(c);return c.json({configured:!!c.env.RESEND_API_KEY,enabled:config.enabled,config:actor?.role==='admin'?config:undefined,revision,deliveryMeaning:'sent는 발송 서비스 접수이며 실제 수신·열람 확인이 아닙니다.',queue:(await c.env.DB.prepare('SELECT id,request_id,state,attempts,last_result,created_at,sent_at FROM notification_outbox ORDER BY created_at DESC LIMIT 100').all()).results})})
notificationRoutes.post('/notifications/settings',async c=>{
 const p=await c.req.json().catch(()=>null);if(!p||!Number.isInteger(p.revision)||typeof p.enabled!=='boolean'||typeof p.from!=='string'||typeof p.to!=='string'||p.from.length>150||p.to.length>150||[p.from,p.to].some(v=>v&&!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(v))||p.enabled&&(!p.from||!p.to||!c.env.RESEND_API_KEY))return c.json({error:'RESEND_API_KEY·인증된 발신 이메일·수신 이메일을 설정하세요.'},400)
 const value=JSON.stringify({enabled:p.enabled,from:p.from,to:p.to}),r=p.revision===0?await c.env.DB.prepare("INSERT OR IGNORE INTO operation_settings(key,value_json) VALUES('notifications',?)").bind(value).run():await c.env.DB.prepare("UPDATE operation_settings SET value_json=?,revision=revision+1 WHERE key='notifications' AND revision=?").bind(value,p.revision).run();if(!r.meta.changes)return c.json({error:'설정 변경 충돌'},409);await audit(c,'notifications.settings','notifications');return c.json({ok:true})
})
notificationRoutes.post('/notifications/retry',async c=>{await c.env.DB.prepare("UPDATE notification_outbox SET state='pending',attempts=0,next_attempt=0 WHERE state='failed'").run();await dispatchNotifications(c.env);await audit(c,'notifications.retry','queue');return c.json({ok:true})})
