import {INDEXNOW_KEY} from './site-config'
import {launchIndexable,siteOrigin} from './seo'
import {localPath} from './locales'

// Automatic IndexNow submission when admins publish, update or unpublish public pages.
// Runs in waitUntil, never blocks or fails the admin action, and only pings from the production
// origin (preview/local requests are logged as dry-run). Results are logged and the last 30
// submissions are kept in operation_settings('indexnow_log') for the admin "색인 제출 기록".
export const INDEXNOW_ENDPOINTS=['https://api.indexnow.org/indexnow','https://searchadvisor.naver.com/indexnow']
// Korean-only paths (editorial posts, local hubs) have no /en mirror; others are submitted in both languages.
const koOnly=(p:string)=>/^\/(?:column|cases|area)(?:\/|$)/.test(p)
export function indexNowUrls(origin:string,paths:string[]){
 const list=paths.filter(p=>p.startsWith('/')&&!p.startsWith('//')).flatMap(p=>koOnly(p)?[p]:[p,localPath(p,'en')])
 return [...new Set(list)].slice(0,100).map(p=>origin+p)
}
export async function submitIndexNow(env:any,origin:string,live:boolean,paths:string[],reason:string,fetcher:typeof fetch=fetch){
 const urls=indexNowUrls(origin,paths),entry:any={at:new Date().toISOString(),reason:reason.slice(0,60),mode:live?'live':'dry-run',urls,results:[] as {endpoint:string;status:number|string}[]}
 if(!urls.length)return entry
 if(live){
  const host=new URL(origin).host,body=JSON.stringify({host,key:INDEXNOW_KEY,keyLocation:origin+'/'+INDEXNOW_KEY+'.txt',urlList:urls})
  entry.results=await Promise.all(INDEXNOW_ENDPOINTS.map(async endpoint=>{try{const r=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body,signal:AbortSignal.timeout(8000)});return {endpoint,status:r.status}}catch(e){return {endpoint,status:e instanceof Error&&e.name==='TimeoutError'?'timeout':'network-error'}}}))
 }
 console.log(JSON.stringify({event:'indexnow',...entry}))
 try{
  const row=await env.DB.prepare("SELECT value_json FROM operation_settings WHERE key='indexnow_log'").first(),log=[entry,...(row?JSON.parse(row.value_json):[])].slice(0,30)
  await env.DB.prepare("INSERT INTO operation_settings(key,value_json) VALUES('indexnow_log',?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,revision=revision+1").bind(JSON.stringify(log)).run()
 }catch(e){console.warn(JSON.stringify({event:'indexnow_log_failed'}))}
 return entry
}
// Fire-and-forget from an admin request handler.
export function queueIndexNow(c:any,paths:string[],reason:string){
 try{
  const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),live=launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)&&c.env.INDEXNOW_DRY_RUN!=='1'
  c.executionCtx.waitUntil(submitIndexNow(c.env,origin,live,paths,reason).catch(()=>{}))
 }catch{/* never block publishing */}
}
// Public URL(s) of a CMS entry plus the listing page that links to it.
export function contentPaths(kind:string,key:string):string[]{
 if(kind==='column')return ['/column/'+key,'/column']
 if(kind==='showcase')return ['/cases/'+key,'/cases']
 if(kind==='treatment')return ['/treatments/'+key,'/treatments']
 if(kind==='doctor')return ['/doctors/'+key,'/doctors']
 return []
}
export const postPaths=(type:string,slug:string)=>['/'+type+'/'+slug,'/'+type]
export async function indexNowLog(db:any){try{const row=await db.prepare("SELECT value_json FROM operation_settings WHERE key='indexnow_log'").first();return row?JSON.parse(row.value_json):[]}catch{return []}}
