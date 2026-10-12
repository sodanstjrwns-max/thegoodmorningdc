import {Hono} from 'hono'
import {esc} from './ui'
import {audit} from './staff'

// 공지 팝업 (esoldc pattern, CSP-safe): up to POPUP_MAX popups managed in admin. Public pages render
// active ones into a fixed, initially hidden overlay (no layout shift); /static/popups.js shows them as
// a cascading card deck on PC (≥768px) and one card at a time on mobile, with close, Esc and
// "오늘 하루 보지 않기" (localStorage, KST date). No inline scripts.
export const POPUP_MAX=10
export type Popup={id:string;title:string;body:string;image:string;image_alt:string;link_url:string;start_date:string;end_date:string;enabled:number;sort_order:number;revision:number;created_at:string;updated_at:string}
export const kstToday=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10)
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s
export const safeLink=(v:string)=>{if(!v)return true;if(/^\/(?!\/)[^\s<>"']*$/.test(v))return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}}
export function isActive(p:Pick<Popup,'enabled'|'start_date'|'end_date'>,today=kstToday()){return !!p.enabled&&(!p.start_date||p.start_date<=today)&&(!p.end_date||p.end_date>=today)}

// Failure-isolated: popups are auxiliary, a DB error must never break a public page.
export async function activePopups(db:any):Promise<Popup[]>{
 if(!db)return []
 try{const today=kstToday();return ((await db.prepare("SELECT * FROM site_popups WHERE enabled=1 AND (start_date='' OR start_date<=?) AND (end_date='' OR end_date>=?) ORDER BY sort_order,created_at LIMIT ?").bind(today,today,POPUP_MAX).all()).results||[]) as Popup[]}catch{return []}
}
export async function popupImageInUse(db:any,path:string){try{return !!await db.prepare('SELECT id FROM site_popups WHERE enabled=1 AND image=? LIMIT 1').bind(path).first()}catch{return false}}

const paragraphs=(text:string)=>text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('')
function card(p:Popup,i:number){
 const external=/^https:/i.test(p.link_url),id=esc(p.id),titleId='gm-popup-title-'+i
 const inner=`${p.image?`<div class="gm-popup-img"><img src="${esc(p.image)}" alt="${esc(p.image_alt||p.title)}" loading="lazy" decoding="async"></div>`:''}<div class="gm-popup-body"><span class="gm-popup-tag">NOTICE</span><h2 class="gm-popup-title" id="${titleId}">${esc(p.title)}</h2>${p.body?`<div class="gm-popup-text">${paragraphs(p.body)}</div>`:''}${p.link_url?`<span class="gm-popup-more">자세히 보기 →</span>`:''}</div>`
 return `<article class="gm-popup-card" data-popup-id="${id}" aria-labelledby="${titleId}"><button type="button" class="gm-popup-peek" data-popup-act="front" tabindex="-1" aria-hidden="true"><span class="gm-popup-peek-n">${String(i+1).padStart(2,'0')}</span><span class="gm-popup-peek-t">${esc(p.title)}</span></button><button type="button" class="gm-popup-x" data-popup-act="close" aria-label="${esc(p.title)} 닫기">×</button>${p.link_url?`<a class="gm-popup-link" href="${esc(p.link_url)}"${external?' target="_blank" rel="noopener noreferrer"':''}>${inner}</a>`:`<div class="gm-popup-link">${inner}</div>`}<div class="gm-popup-foot"><button type="button" class="gm-popup-hide" data-popup-act="hide">오늘 하루 보지 않기</button><button type="button" class="gm-popup-close" data-popup-act="close">닫기</button></div></article>`
}
export function popupMarkup(list:Popup[]){
 const items=list.slice(0,POPUP_MAX);if(!items.length)return ''
 return `<div class="gm-popup-overlay" id="gm-popups" role="dialog" aria-modal="true" aria-label="병원 공지" hidden><div class="gm-popup-bar"><span class="gm-popup-bar-t">병원 공지 <b class="gm-popup-count">${items.length}</b></span><button type="button" class="gm-popup-all">모두 닫기 ×</button></div><div class="gm-popup-stack">${items.map(card).join('')}</div><div class="gm-popup-nav" hidden><button type="button" class="gm-popup-prev" aria-label="이전 공지">‹</button><span class="gm-popup-dots" aria-hidden="true"></span><span class="gm-popup-ind" aria-live="polite"></span><button type="button" class="gm-popup-next" aria-label="다음 공지">›</button></div></div><link rel="stylesheet" href="/static/popups.css?v=1"><script src="/static/popups.js?v=1" defer></script>`
}

function clean(input:any){
 const s=(v:any,max:number)=>typeof v==='string'&&v.length<=max&&!/[\u0000-\u0008]/.test(v)?v.trim():null
 const v={title:s(input?.title,80),body:s(input?.body??'',1000),image:s(input?.image??'',120),image_alt:s(input?.image_alt??'',150),link_url:s(input?.link_url??'',500),start_date:s(input?.start_date??'',10),end_date:s(input?.end_date??'',10),enabled:typeof input?.enabled==='boolean'?input.enabled:null}
 if(Object.values(v).some(x=>x===null))throw Error('제목(80자)·내용(1000자)·링크·날짜·공개 여부를 확인하세요.')
 if(!v.title)throw Error('팝업 제목을 입력하세요.')
 if(!v.body&&!v.image)throw Error('이미지 또는 내용 중 하나는 필요합니다.')
 if(v.image&&!/^\/media\/[a-f0-9-]+\.(?:png|jpg|webp)$/.test(v.image as string))throw Error('이미지는 관리자에서 업로드한 파일만 사용할 수 있습니다.')
 if(v.image&&!(v.image_alt as string))throw Error('이미지 설명(대체 텍스트)을 입력하세요. 이미지에 적힌 핵심 문구를 적어 주세요.')
 if(!safeLink(v.link_url as string))throw Error('링크는 /notice 처럼 사이트 내부 경로 또는 https:// 주소만 가능합니다.')
 for(const d of [v.start_date,v.end_date] as string[])if(d&&!validDate(d))throw Error('날짜는 YYYY-MM-DD 형식입니다.')
 if(v.start_date&&v.end_date&&(v.start_date as string)>(v.end_date as string))throw Error('종료일이 시작일보다 빠릅니다.')
 return v as {title:string;body:string;image:string;image_alt:string;link_url:string;start_date:string;end_date:string;enabled:boolean}
}
const list=async(db:any)=>((await db.prepare('SELECT * FROM site_popups ORDER BY sort_order,created_at').all()).results||[]) as Popup[]
// Mounted under /api/admin (admin role only via can()).
export const popupRoutes=new Hono<any>()
popupRoutes.get('/popups',async c=>{const all=await list(c.env.DB),today=kstToday();return c.json({max:POPUP_MAX,today,popups:all.map(p=>({...p,enabled:!!p.enabled,active:isActive(p,today)}))})})
popupRoutes.post('/popups',async c=>{
 const p=await c.req.json().catch(()=>null);let v;try{v=clean(p)}catch(e){return c.json({error:(e as Error).message},400)}
 if(v.image&&!await c.env.R2?.head(v.image.slice(7)))return c.json({error:'이미지 파일을 먼저 업로드하세요.'},400)
 const now=new Date().toISOString()
 if(!p.id){
  const id=crypto.randomUUID(),r=await c.env.DB.prepare('INSERT INTO site_popups(id,title,body,image,image_alt,link_url,start_date,end_date,enabled,sort_order,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,COALESCE((SELECT MAX(sort_order)+1 FROM site_popups),0),?,? WHERE (SELECT COUNT(*) FROM site_popups)<?').bind(id,v.title,v.body,v.image,v.image_alt,v.link_url,v.start_date,v.end_date,v.enabled?1:0,now,now,POPUP_MAX).run()
  if(!r.meta.changes)return c.json({error:`팝업은 최대 ${POPUP_MAX}개입니다. 지난 팝업을 삭제한 뒤 추가하세요.`},400)
  await audit(c,'popup.create',id);return c.json({ok:true,id},201)
 }
 if(typeof p.id!=='string'||!Number.isInteger(p.revision))return c.json({error:'팝업 버전을 확인하세요.'},400)
 const r=await c.env.DB.prepare('UPDATE site_popups SET title=?,body=?,image=?,image_alt=?,link_url=?,start_date=?,end_date=?,enabled=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(v.title,v.body,v.image,v.image_alt,v.link_url,v.start_date,v.end_date,v.enabled?1:0,now,p.id,p.revision).run()
 if(!r.meta.changes)return c.json({error:'다른 창에서 변경되었거나 삭제된 팝업입니다. 새로고침하세요.'},409)
 await audit(c,'popup.update',p.id);return c.json({ok:true,id:p.id})
})
popupRoutes.post('/popups/order',async c=>{
 const p=await c.req.json().catch(()=>null),all=await list(c.env.DB)
 if(!Array.isArray(p?.ids)||p.ids.length!==all.length||new Set(p.ids).size!==all.length||p.ids.some((id:any)=>!all.some(x=>x.id===id)))return c.json({error:'순서 목록이 현재 팝업과 다릅니다. 새로고침하세요.'},409)
 await c.env.DB.batch(p.ids.map((id:string,i:number)=>c.env.DB.prepare('UPDATE site_popups SET sort_order=?,revision=revision+1 WHERE id=?').bind(i,id)))
 await audit(c,'popup.order',String(all.length));return c.json({ok:true})
})
popupRoutes.delete('/popups/:id',async c=>{
 const r=await c.env.DB.prepare('DELETE FROM site_popups WHERE id=? AND revision=?').bind(c.req.param('id'),Number(c.req.query('revision'))).run()
 if(!r.meta.changes)return c.json({error:'다른 창에서 변경된 팝업입니다. 새로고침하세요.'},409)
 await audit(c,'popup.delete',c.req.param('id'));return c.json({ok:true})
})
