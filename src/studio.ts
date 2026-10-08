import {Hono} from 'hono'
import {assemble,baseline,defaults,keyOf,kinds,shapes,templates,validate,validateReferences,type Kind} from './content'
import {channelListing,refreshChannel} from './channels'
import {showcaseCard,careersView} from './services'
import {createUI} from './ui'
import {createPages} from './pages'
export const studio=new Hono<any>()
const rows=async(db:any)=>(await db.prepare('SELECT * FROM content_entries').all()).results||[]
studio.get('/content',async c=>{
 const saved=await rows(c.env.DB)
 const entries=kinds.flatMap(kind=>{
  const list=(defaults[kind] as any[]).map(value=>({kind,key:keyOf(kind,value),draft:value,live:value,revision:0,baseline:true}))
  for(const r of saved.filter((r:any)=>r.kind===kind)){const i=list.findIndex(x=>x.key===r.key);const v={kind,key:r.key,draft:JSON.parse(r.draft_json),live:r.live_json?JSON.parse(r.live_json):baseline(kind,r.key)||null,revision:r.revision,baseline:!!baseline(kind,r.key)};if(i<0)list.push(v);else list[i]=v}
  return list
 })
 return c.json({entries,shapes,templates})
})
studio.post('/content/:kind/:key',async c=>{
 const kind=c.req.param('kind') as Kind,key=c.req.param('key'),p=await c.req.json().catch(()=>null)
 if(!p||!['draft','publish'].includes(p.action)||!Number.isInteger(p.revision)||p.revision<0)return c.json({error:'저장 상태와 버전을 확인하세요.'},400)
 try{
  validate(kind,key,p.value,p.action==='publish');
  if(p.action==='publish'&&kind==='showcase'&&p.value.category==='case')for(const path of [p.value.beforeImage,p.value.afterImage])if(!await c.env.R2?.head(path.slice('/media/'.length)))throw Error('전후 이미지 파일을 업로드한 뒤 공개해 주세요.')
  const all=await rows(c.env.DB)
  if(!baseline(kind,key)&&!all.some((r:any)=>r.kind===kind&&r.key===key)&&all.length>=500)return c.json({error:'관리 항목은 최대 500개입니다.'},400)
  if(p.action==='publish'){const candidate=all.filter((r:any)=>!(r.kind===kind&&r.key===key));candidate.push({kind,key,live_json:JSON.stringify(p.value)});validateReferences(assemble(candidate))}
  const body=JSON.stringify(p.value),now=new Date().toISOString()
  // Compare-and-swap prevents editors from silently overwriting a newer revision.
  const statement=p.revision===0?
   c.env.DB.prepare('INSERT OR IGNORE INTO content_entries(kind,key,draft_json,live_json,revision,updated_at) VALUES(?,?,?,?,1,?)').bind(kind,key,body,p.action==='publish'?body:null,now):
   c.env.DB.prepare('UPDATE content_entries SET draft_json=?,live_json=CASE WHEN ?=1 THEN ? ELSE live_json END,revision=revision+1,updated_at=? WHERE kind=? AND key=? AND revision=?').bind(body,p.action==='publish'?1:0,body,now,kind,key,p.revision)
  const result=await c.env.DB.batch([statement,c.env.DB.prepare('INSERT INTO content_history(kind,key,action,snapshot,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(kind,key,p.action,body,now)])
  if(!result[0].meta.changes)return c.json({error:'다른 창에서 변경되었습니다. 목록을 새로고침하고 다시 편집하세요.'},409)
  return c.json({ok:true,revision:p.revision+1})
 }catch(e){return c.json({error:e instanceof Error?e.message:'입력 내용을 확인하세요.'},400)}
})
studio.post('/content/:kind/:key/withdraw',async c=>{
 const kind=c.req.param('kind') as Kind,key=c.req.param('key'),p=await c.req.json().catch(()=>null)
 if(!['showcase','vacancy'].includes(kind)||!Number.isInteger(p?.revision))return c.json({error:'공개 내림 대상과 버전을 확인하세요.'},400)
 const row=await c.env.DB.prepare('SELECT draft_json FROM content_entries WHERE kind=? AND key=? AND revision=?').bind(kind,key,p.revision).first();if(!row)return c.json({error:'변경 충돌입니다.'},409)
 const result=await c.env.DB.batch([c.env.DB.prepare('UPDATE content_entries SET live_json=NULL,revision=revision+1,updated_at=? WHERE kind=? AND key=? AND revision=?').bind(new Date().toISOString(),kind,key,p.revision),c.env.DB.prepare('INSERT INTO content_history(kind,key,action,snapshot,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(kind,key,'withdraw',row.draft_json,new Date().toISOString())])
 return result[0].meta.changes?c.json({ok:true}):c.json({error:'변경 충돌입니다.'},409)
})
studio.delete('/content/:kind/:key',async c=>{
 const kind=c.req.param('kind') as Kind,key=c.req.param('key');if(!kinds.includes(kind))return c.json({error:'분류를 확인하세요.'},400)
 const revision=Number(c.req.query('revision')),all=await rows(c.env.DB),row=all.find((r:any)=>r.kind===kind&&r.key===key)
 if(!row||row.revision!==revision)return c.json({error:'다른 창에서 변경되었습니다. 목록을 새로고침하세요.'},409)
 try{validateReferences(assemble(all.filter((r:any)=>!(r.kind===kind&&r.key===key))))}catch(e){return c.json({error:'연결된 콘텐츠가 있습니다. 관련 진료·의료진 연결을 먼저 수정하세요.'},409)}
 const result=await c.env.DB.batch([c.env.DB.prepare('DELETE FROM content_entries WHERE kind=? AND key=? AND revision=?').bind(kind,key,revision),c.env.DB.prepare('INSERT INTO content_history(kind,key,action,snapshot,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(kind,key,baseline(kind,key)?'restore':'delete',row.draft_json,new Date().toISOString())])
 return result[0].meta.changes?c.json({ok:true}):c.json({error:'변경 충돌입니다. 새로고침하세요.'},409)
})
studio.get('/history/:kind/:key',async c=>c.json({history:(await c.env.DB.prepare('SELECT id,action,snapshot,created_at FROM content_history WHERE kind=? AND key=? ORDER BY id DESC LIMIT 20').bind(c.req.param('kind'),c.req.param('key')).all()).results}))
studio.post('/content-preview/:kind/:key',async c=>{
 const kind=c.req.param('kind') as Kind,key=c.req.param('key'),p=await c.req.json().catch(()=>null)
 try{
  validate(kind,key,p?.value);const all=(await rows(c.env.DB)).filter((r:any)=>!(r.kind===kind&&r.key===key));all.push({kind,key,live_json:JSON.stringify(p.value)})
  const content=assemble(all);validateReferences(content);const ui=createUI(content),page=createPages(content)
  const html=kind==='showcase'?showcaseCard(p.value,content):kind==='vacancy'?careersView(content):kind==='treatment'?page.treatmentPage(content.treatments.find(t=>t.slug===key)!):kind==='doctor'?page.doctorPage(content.doctors.find(d=>d.slug===key)!):kind==='faq'?page.faqPage():kind==='video'?page.videoPage():kind==='branch'?page.directionsPage():kind==='site'?page.missionPage():kind==='section'?ui.home():page.renderText(p.value.body||p.value.title||'내용을 확인하세요.')
  return c.json({html})
 }catch(e){return c.json({error:e instanceof Error?e.message:'미리보기를 생성하지 못했습니다.'},400)}
})
studio.get('/channels',async c=>c.json({channels:await channelListing(c.env.DB,assemble(await rows(c.env.DB)))}))
studio.post('/channels/refresh',async c=>{
 const content=assemble(await rows(c.env.DB));await Promise.all(content.channels.map(ch=>refreshChannel(c.env.DB,ch,true)))
 return c.json({channels:await channelListing(c.env.DB,content)})
})
