import {Hono} from 'hono'
import {loadContent} from './content'
export const publicRequests=new Hono<any>()
export const adminRequests=new Hono<any>()
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('')
const statuses=['new','contacted','confirmed','closed']
async function cleanup(env:any){
 const rows=(await env.DB.prepare('SELECT id,attachment_key FROM service_requests WHERE expires_at<=? LIMIT 25').bind(Date.now()).all()).results||[]
 for(const r of rows){if(r.attachment_key)await env.R2.delete(r.attachment_key);await env.DB.prepare('DELETE FROM service_requests WHERE id=? AND expires_at<=?').bind(r.id,Date.now()).run()}
 await env.DB.prepare('DELETE FROM request_limits WHERE expires_at<=?').bind(Date.now()).run()
}
publicRequests.use('*',async(c,next)=>{c.header('Cache-Control','no-store');if(!c.env.DB||!c.env.ADMIN_PASSWORD)return c.json({error:'접수 설정을 확인 중입니다. 지점으로 전화해 주세요.'},503);if(c.req.header('Origin')!==new URL(c.req.url).origin)return c.json({error:'허용되지 않은 요청입니다.'},403);await next()})
publicRequests.post('/:kind',async c=>{
 const kind=c.req.param('kind');if(!['career','interpretation'].includes(kind))return c.notFound()
 const data=await c.req.formData().catch(()=>null);if(!data)return c.json({error:'입력 내용을 확인하세요.'},400)
 const get=(k:string)=>typeof data.get(k)==='string'?String(data.get(k)).trim():''
 const name=get('name'),contact=get('contact'),branch=get('branch'),message=get('message'),locale=get('locale')||'ko'
 if(get('website'))return c.json({error:'요청을 확인할 수 없습니다.'},400)
 if(!name||name.length>80||contact.length>150||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^\+?[\d ()-]{8,25}$/.test(contact))||!['cheongnyangni','gwangmyeong'].includes(branch)||message.length>2000||!['ko','en','ja','zh'].includes(locale)||get('consent')!=='yes')return c.json({error:'이름·연락처·지점·개인정보 동의를 확인하세요.'},400)
 const payload:any={name,contact,branch,message,locale,consentVersion:'2026-10-08-v1'}
 const now=Date.now(),content=await loadContent(c.env.DB)
 if(kind==='career'){
  const vacancy=get('vacancy'),role=get('role');if(!role||role.length>100)return c.json({error:'희망 직무를 입력하세요.'},400)
  if(vacancy){const job=content.vacancies.find(v=>v.key===vacancy);const today=new Date(now+9*3600000).toISOString().slice(0,10);if(!job||!job.accepting||(job.deadline&&job.deadline<today)||(job.branch!=='all'&&job.branch!==branch))return c.json({error:'현재 지원 가능한 공고와 지점을 확인하세요.'},409)}
  Object.assign(payload,{vacancy,role})
 }else{
  const language=get('language'),visitDate=get('visitDate');if(!language||language.length>80||!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)||!Number.isFinite(Date.parse(visitDate))||new Date(visitDate).toISOString().slice(0,10)!==visitDate||visitDate<new Date(now+9*3600000).toISOString().slice(0,10))return c.json({error:'필요 언어와 희망 방문일을 확인하세요.'},400)
  Object.assign(payload,{language,visitDate})
 }
 const attachment=data.get('resume');let file:File|null=null
 if(attachment instanceof File&&attachment.size){if(kind!=='career'||attachment.size>3*1024*1024||attachment.type!=='application/pdf')return c.json({error:'이력서는 3MB 이하 PDF만 가능합니다.'},400);if(!c.env.R2)return c.json({error:'파일 접수를 사용할 수 없습니다.'},503);if(new TextDecoder().decode(await attachment.slice(0,5).arrayBuffer())!=='%PDF-')return c.json({error:'정상 PDF 파일을 선택하세요.'},400);file=attachment}
 await cleanup(c.env)
 const key=await digest((c.req.header('cf-connecting-ip')||'local')+':'+c.env.ADMIN_PASSWORD+':'+Math.floor(now/3600000))
 const limit=await c.env.DB.prepare('INSERT INTO request_limits(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 WHERE attempts<5').bind(key,now+3600000).run()
 if(!limit.meta.changes)return c.json({error:'접수가 많습니다. 한 시간 후 다시 시도하거나 전화해 주세요.'},429)
 const id=crypto.randomUUID(),attachmentKey=file?'applications/'+id+'.pdf':''
 try{
  if(file)await c.env.R2.put(attachmentKey,await file.arrayBuffer(),{httpMetadata:{contentType:'application/pdf'}})
  await c.env.DB.prepare('INSERT INTO service_requests(id,kind,data_json,attachment_key,created_at,expires_at) VALUES(?,?,?,?,?,?)').bind(id,kind,JSON.stringify(payload),attachmentKey,now,now+(kind==='career'?90:30)*86400000).run()
 }catch(e){if(attachmentKey)await c.env.R2.delete(attachmentKey);throw e}
 return c.json({ok:true,id,message:'접수되었습니다. 담당자 확인 후 연락드립니다. 예약·채용·통역 제공 확정은 아닙니다.'},201)
})
adminRequests.get('/requests',async c=>{await cleanup(c.env);const r=await c.env.DB.prepare('SELECT * FROM service_requests WHERE expires_at>? ORDER BY created_at DESC LIMIT 200').bind(Date.now()).all();return c.json({requests:(r.results||[]).map((r:any)=>({id:r.id,kind:r.kind,data:JSON.parse(r.data_json),hasAttachment:!!r.attachment_key,status:r.status,note:r.note,revision:r.revision,createdAt:r.created_at,expiresAt:r.expires_at}))})})
adminRequests.post('/requests/:id',async c=>{
 const p=await c.req.json().catch(()=>null);if(!p||!statuses.includes(p.status)||typeof p.note!=='string'||p.note.length>2000||!Number.isInteger(p.revision))return c.json({error:'상태·메모·버전을 확인하세요.'},400)
 const r=await c.env.DB.prepare('UPDATE service_requests SET status=?,note=?,revision=revision+1 WHERE id=? AND revision=? AND expires_at>?').bind(p.status,p.note,c.req.param('id'),p.revision,Date.now()).run()
 return r.meta.changes?c.json({ok:true}):c.json({error:'다른 관리자가 수정했거나 접수가 만료되었습니다. 새로고침하세요.'},409)
})
adminRequests.get('/requests/:id/attachment',async c=>{
 const row=await c.env.DB.prepare('SELECT attachment_key FROM service_requests WHERE id=? AND expires_at>?').bind(c.req.param('id'),Date.now()).first();if(!row?.attachment_key)return c.notFound()
 const obj=await c.env.R2.get(row.attachment_key);if(!obj)return c.notFound()
 return new Response(obj.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="application.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}})
})
adminRequests.delete('/requests/:id',async c=>{
 const row=await c.env.DB.prepare('SELECT attachment_key,revision FROM service_requests WHERE id=?').bind(c.req.param('id')).first();if(!row)return c.notFound()
 if(Number(c.req.query('revision'))!==row.revision)return c.json({error:'변경된 접수입니다. 새로고침하세요.'},409)
 // Claim deletion atomically before object cleanup. Expired claims remain inaccessible and retryable.
 const result=await c.env.DB.prepare('UPDATE service_requests SET expires_at=0,revision=revision+1 WHERE id=? AND revision=?').bind(c.req.param('id'),row.revision).run();if(!result.meta.changes)return c.json({error:'변경 충돌'},409)
 await cleanup(c.env);return c.json({ok:true})
})
