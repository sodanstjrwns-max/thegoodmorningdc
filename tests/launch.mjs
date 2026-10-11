import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const compiled=await build({stdin:{contents:"export {default as app} from './src/index';export {readWithRetry} from './src/reliability'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false,loader:{'.md':'text'}})
const {app,readWithRetry}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const waits=[],ctx={waitUntil:p=>waits.push(p),passThroughOnException(){}}
function database(mode){return {prepare(sql){return {bind(){return this},async all(){if(mode==='authoritative-failure'&&sql.includes('content_entries'))throw Error('D1_ERROR: unavailable');return {results:[]}},async first(){if(sql.includes('COUNT'))return {n:0};if(sql.includes('channel_cache')){if(mode==='cache-failure')throw Error('D1_ERROR: network connection lost');return {items_json:mode==='corrupt'?'bad json':mode==='null'?'null':'[]',next_attempt:Date.now()+3600000,fetched_at:mode==='timestamp'?1e30:0}}return null},async run(){return {meta:{changes:0}}}}}}}
const env={PUBLIC_SITE_URL:'https://thegoodmorningdc.kr',DB:database('normal')}
let calls=0;assert.equal(await readWithRetry(async()=>{calls++;if(calls===1)throw Error('D1_ERROR: database is locked');return 42}),42);assert.equal(calls,2)
calls=0;await assert.rejects(readWithRetry(async()=>{calls++;throw Error('Invalid SQL')}));assert.equal(calls,1)
for(const mode of ['normal','cache-failure','corrupt','null','timestamp'])for(const path of ['/blog','/en/blog','/column','/en/column']){
 const r=await app.fetch(new Request('https://thegoodmorningdc.kr'+path),{...env,DB:database(mode)},ctx);assert.equal(r.status,200,mode+path);const text=await r.text();assert.match(text,/application\/ld\+json/);assert.match(text,/rel="canonical"/)
}
const failed=await app.fetch(new Request('https://thegoodmorningdc.kr/en/blog'),{...env,DB:database('authoritative-failure')},ctx);assert.equal(failed.status,500);assert.ok(failed.headers.get('x-request-id'));assert.match(failed.headers.get('x-robots-tag'),/noindex/)
for(const [url,status,index] of [['https://thegoodmorningdc.kr/',200,true],['https://thegoodmorningdc.kr/en/blog',200,true],['https://snapshot.pages.dev/',200,false],['https://thegoodmorningdc.kr/admin',200,false],['https://thegoodmorningdc.kr/handover',200,false],['https://thegoodmorningdc.kr/no-such-page',404,false]]){
 const r=await app.fetch(new Request(url),env,ctx);assert.equal(r.status,status,url);const text=await r.text();assert.match(text,index?/name="robots" content="index,follow/:/noindex/);assert.equal(r.headers.get('x-robots-tag')?.includes('noindex')||false,!index,url)
}
const redirect=await app.fetch(new Request('https://www.thegoodmorningdc.kr/en/blog?page=2'),env,ctx);assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'https://thegoodmorningdc.kr/en/blog?page=2')
const robots=await(await app.fetch(new Request('https://thegoodmorningdc.kr/robots.txt'),env,ctx)).text();assert.match(robots,/Allow: \/\n/);assert.match(robots,/Sitemap: https:\/\/thegoodmorningdc.kr\/sitemap.xml/)
for(const path of ['/privacy','/terms','/en/privacy','/en/terms']){
 const r=await app.fetch(new Request('https://thegoodmorningdc.kr'+path),env,ctx);assert.equal(r.status,200);const text=await r.text();assert.doesNotMatch(text,/현재 사이트는 제작 미리보기입니다|정식 운영 전 확인/);if(path==='/privacy')for(const token of ['Cloudflare','90일','30일','02-969-3776','204-96-61655','8시간'])assert.ok(text.includes(token))
}
await Promise.allSettled(waits)
console.log('PASS launch unit: injected optional cache failures/corruption isolated, bounded read retry, authoritative failure remains500 with incidentID/noindex, production/preview/private indexing, www301, KO/EN privacy.')
if(process.env.TEST_URL){
 const base=process.env.TEST_URL;const paths=['/','/en','/blog','/en/blog','/column','/en/column','/privacy','/en/privacy','/terms','/en/terms'];const results=[];let i=0
 async function probe(){while(true){const n=i++;if(n>=100)return;const path=paths[n%paths.length];const r=await fetch(base+path,{signal:AbortSignal.timeout(25000)});const text=await r.text();const row={path,status:r.status,ray:r.headers.get('cf-ray'),canonical:text.includes('rel="canonical"'),schema:text.includes('application/ld+json')};results.push(row);assert.equal(r.status,200,path);assert.ok(row.canonical&&row.schema);assert.equal(r.headers.get('x-robots-tag'),null);assert.match(text,/name="robots" content="index,follow/);await new Promise(r=>setTimeout(r,125))}}
 await Promise.all(Array.from({length:3},probe));const r=await fetch('https://www.thegoodmorningdc.kr/en/blog?page=2',{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),base+'/en/blog?page=2');const guide=await fetch(base+'/handover');assert.match(guide.headers.get('x-robots-tag'),/noindex/)
 fs.writeFileSync('test-results/launch25-production.json',JSON.stringify({base,results},null,2));console.log('PASS production launch: 100 public requests, indexable canonical/schema, www301, handover excluded.')
}
