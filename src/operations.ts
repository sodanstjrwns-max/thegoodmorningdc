import {Hono} from 'hono'
import {loadContent} from './content'
import {bodyMedia,markdown,textSummary} from './markdown'
import {publicPaths} from './metrics'
import {audit,getActor} from './staff'
export const operationRoutes=new Hono<any>()
export async function mediaUsage(db:any){
 const records=(await db.prepare('SELECT kind,key,draft_json,live_json FROM content_entries').all()).results,posts=(await db.prepare('SELECT id,title,body,status FROM posts').all()).results,history=(await db.prepare('SELECT kind,key,snapshot FROM content_history').all()).results
 const map=new Map<string,any[]>();const add=(text:string,ref:any)=>{for(const path of new Set(text.match(/\/media\/[a-f0-9-]+\.(?:png|jpg|webp)/g)||[])){if(!map.has(path))map.set(path,[]);const list=map.get(path)!;if(!list.some(r=>r.kind===ref.kind&&r.key===ref.key&&r.state===ref.state))list.push(ref)}}
 for(const r of records){add(r.draft_json,{kind:r.kind,key:r.key,state:'draft'});if(r.live_json)add(r.live_json,{kind:r.kind,key:r.key,state:'live'})}
 for(const p of posts)add(p.body,{kind:'post',key:p.id,state:p.status==='published'?'live':'draft'})
 for(const h of history)add(h.snapshot,{kind:h.kind,key:h.key,state:'history'})
 try{for(const p of (await db.prepare('SELECT id,title,image,enabled FROM site_popups').all()).results||[])add(p.image,{kind:'popup',key:p.title,state:p.enabled?'live':'draft'})}catch{}
 return map
}
operationRoutes.get('/media-library',async c=>{
 const usage=await mediaUsage(c.env.DB),cursor=c.req.query('cursor'),listed=await c.env.R2.list({limit:100,...(cursor?{cursor}: {})})
 return c.json({objects:listed.objects.filter((o:any)=>/^[a-f0-9-]+\.(png|jpg|webp)$/.test(o.key)).map((o:any)=>({key:o.key,url:'/media/'+o.key,size:o.size,uploaded:o.uploaded,uses:usage.get('/media/'+o.key)||[]})),cursor:listed.truncated?listed.cursor:null,note:'초안·공개본·변경 이력의 참조를 보수적으로 확인합니다. 지원서 PDF는 표시하지 않습니다.'})
})
operationRoutes.delete('/media-library/:key',async c=>{
 const key=c.req.param('key');if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))return c.notFound();const usages=(await mediaUsage(c.env.DB)).get('/media/'+key)||[];if(usages.length)return c.json({error:'공개본·초안·이력에 연결된 이미지입니다. 사용처를 먼저 확인하세요.',usages},409)
 await c.env.R2.delete(key);await audit(c,'media.delete',key);return c.json({ok:true})
})
operationRoutes.get('/link-options',async c=>{
 const content=await loadContent(c.env.DB);return c.json({links:[...content.treatments.map(t=>({title:t.name,url:'/treatments/'+t.slug,type:'진료',keywords:t.description})),...content.columns.map(e=>({title:e.title,url:'/column/'+e.key,type:'칼럼',keywords:e.summary})),...content.showcases.map(e=>({title:e.title,url:'/cases/'+e.key,type:'사례',keywords:e.summary||''})),{title:'비급여 수가표',url:'/pricing',type:'안내',keywords:''},{title:'예약 안내',url:'/reservation',type:'안내',keywords:''}]})
})
operationRoutes.get('/content-audit',async c=>{
 const content=await loadContent(c.env.DB),paths=await publicPaths(c.env),articles=[...content.columns.map(e=>({...e,path:'/column/'+e.key,kind:'column'})),...content.showcases.map(e=>({...e,path:'/cases/'+e.key,kind:'showcase'}))],issues:any[]=[],descriptions=new Map<string,string[]>(),links=new Set<string>();let probes=0,deferredImages=0
 for(const e of articles){
  const meta=e.seoDescription||e.summary||'';if(meta){const group=descriptions.get(meta)||[];group.push(e.path);descriptions.set(meta,group)}else issues.push({path:e.path,type:'description',message:'검색 설명/요약 누락'})
  if(!e.author)issues.push({path:e.path,type:'author',message:'작성 의료진 미지정'})
  if(!e.reviewedOn||Date.now()-Date.parse(e.reviewedOn)>180*86400000)issues.push({path:e.path,type:'review',message:'검토일 미입력 또는180일 경과'})
  if(!e.treatment)issues.push({path:e.path,type:'topic',message:'관련 진료 미지정'})
  for(const [,href]of e.body.matchAll(/(?<!!)\[[^\]]*\]\(([^\s)]+)\)/g)){
   if(href.startsWith('/')&&!href.startsWith('//')){const p=href.split(/[?#]/)[0];links.add(p);if(!paths.has(p))issues.push({path:e.path,type:'link',message:'내부 링크 경로 확인: '+p})}
  }
  for(const image of markdown(e.body).images){if(!image.alt.trim())issues.push({path:e.path,type:'alt',message:'본문 이미지 대체텍스트 누락'})}
  const refs=[...new Set([e.coverImage,...bodyMedia(e.body),...(e.kind==='showcase'?[(e as any).beforeImage,(e as any).afterImage]:[])].filter(Boolean))] as string[]
  for(const path of refs){if(probes>=20){deferredImages++;continue}probes++;let exists=false;if(path.startsWith('/media/'))exists=!!await c.env.R2.head(path.slice(7));else if(/^\/static\/images\/[\w-]+\.(png|jpg|webp)$/.test(path))exists=(await c.env.ASSETS.fetch(new Request(new URL(path,c.req.url),{method:'HEAD'}))).ok;if(!exists)issues.push({path:e.path,type:'image',message:'이미지 연결 확인: '+path})}
 }
 for(const [description,items]of descriptions)if(items.length>1)issues.push({path:items.join(', '),type:'duplicate',message:'검색 설명 중복'})
 for(const e of articles)if(!links.has(e.path)&&!e.treatment)issues.push({path:e.path,type:'isolation',message:'목록 외 내부 연결이나 관련 진료가 없는 글'})
 return c.json({checked:articles.length,checkedImages:probes,deferredImages,issues,note:'발행된 칼럼·사례의 내부 링크와 최대20개 이미지만 검사합니다. 외부 URL 응답·실제 검색순위·의료정보 정확성 검사는 아닙니다.'})
})
operationRoutes.get('/audit-events',async c=>c.json({events:(await c.env.DB.prepare('SELECT e.*,u.name actor_name FROM audit_events e LEFT JOIN staff_users u ON u.id=e.actor_id ORDER BY e.id DESC LIMIT 200').all()).results}))
export async function mutationLock(c:any,next:()=>Promise<void>){
 const key='content-mutations',token=crypto.randomUUID(),now=Date.now();const r=await c.env.DB.prepare('INSERT INTO mutation_locks(key,token,expires_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at WHERE expires_at<?').bind(key,token,now+300000,now).run();if(!r.meta.changes)return c.json({error:'다른 저장/이미지 작업이 진행 중입니다. 잠시 후 다시 시도하세요.'},409)
 try{await next()}finally{await c.env.DB.prepare('DELETE FROM mutation_locks WHERE key=? AND token=?').bind(key,token).run()}
}
