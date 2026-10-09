import {Hono} from 'hono'
import {getActor,audit} from './staff'
export const reviewRoutes=new Hono<any>()
reviewRoutes.get('/review-queue',async c=>c.json({reviews:(await c.env.DB.prepare("SELECT r.*,s.name submitter_name,d.name reviewer_name,e.draft_json,e.revision current_revision FROM content_reviews r JOIN content_entries e ON e.kind=r.kind AND e.key=r.key LEFT JOIN staff_users s ON s.id=r.submitted_by LEFT JOIN staff_users d ON d.id=r.decided_by ORDER BY r.updated_at DESC LIMIT 200").all()).results.map((r:any)=>{const {draft_json,...rest}=r;return {...rest,title:JSON.parse(draft_json).title||r.key}})}))
reviewRoutes.post('/reviews/:kind/:key',async c=>{
 const kind=c.req.param('kind'),key=c.req.param('key'),p=await c.req.json().catch(()=>null),actor=(await getActor(c))!
 if(!['column','showcase','vacancy'].includes(kind)||!p||!['submit','approve','changes'].includes(p.action)||!Number.isInteger(p.revision)||typeof(p.note||'')!=='string'||(p.note||'').length>2000)return c.json({error:'검토 요청과 버전을 확인하세요.'},400)
 let result
 if(p.action==='submit'){
  result=await c.env.DB.prepare("INSERT INTO content_reviews(kind,key,content_revision,state,submitted_by,note,updated_at) SELECT kind,key,revision,'pending',?,?,? FROM content_entries WHERE kind=? AND key=? AND revision=? ON CONFLICT(kind,key) DO UPDATE SET content_revision=excluded.content_revision,state='pending',submitted_by=excluded.submitted_by,decided_by='',note=excluded.note,updated_at=excluded.updated_at").bind(actor.id,p.note||'',new Date().toISOString(),kind,key,p.revision).run()
 }else{
  if(!['admin','reviewer'].includes(actor.role))return c.json({error:'검토자 권한이 필요합니다.'},403)
  if(p.action==='changes'&&!p.note?.trim())return c.json({error:'수정 요청 사유를 입력하세요.'},400)
  const current=await c.env.DB.prepare('SELECT submitted_by FROM content_reviews WHERE kind=? AND key=?').bind(kind,key).first()
  if(current?.submitted_by===actor.id)return c.json({error:'본인이 요청한 원고는 다른 검토자가 확인해야 합니다.'},403)
  result=await c.env.DB.prepare("UPDATE content_reviews SET state=?,decided_by=?,note=?,updated_at=? WHERE kind=? AND key=? AND content_revision=? AND state='pending' AND EXISTS(SELECT 1 FROM content_entries e WHERE e.kind=content_reviews.kind AND e.key=content_reviews.key AND e.revision=content_reviews.content_revision)").bind(p.action==='approve'?'approved':'changes',actor.id,p.note||'',new Date().toISOString(),kind,key,p.revision).run()
 }
 if(!result.meta.changes)return c.json({error:'원고가 변경되었거나 검토 상태가 달라졌습니다. 새로고침하세요.'},409)
 await audit(c,'review.'+p.action,kind+'/'+key);return c.json({ok:true})
})
export const comparable=(value:any)=>JSON.stringify(Object.fromEntries(Object.entries(value).filter(([k])=>!['publishedAt','modifiedAt'].includes(k)).sort(([a],[b])=>a.localeCompare(b))))
