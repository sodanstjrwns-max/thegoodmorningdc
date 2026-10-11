import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
import {chromium,webkit} from '@playwright/test'
const base=process.env.TEST_URL||'http://localhost:3000'
const retired=/광명|gwangmyeong|02-6013|026013|1551337|2006007864|_XGQYn|sthegmdent|청량리 본점|Cheongnyangni (?:Main|Branch)|지점별|지점 선택/i
const compiled=await build({stdin:{contents:"export * from './src/content'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false})
const lib=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const oldRows=[{kind:'branch',key:'gwangmyeong',live_json:JSON.stringify({...lib.baseBranches[0],id:'gwangmyeong',name:'광명'})},...['channel','operation','vacancy'].map(kind=>({kind,key:'retired',live_json:JSON.stringify({...lib.templates[kind],key:'retired',branch:'gwangmyeong'})}))]
const model=lib.assemble(oldRows)
assert.equal(model.branches.length,1)
assert.equal(model.branches[0].name,'더굿모닝치과')
assert.doesNotMatch(JSON.stringify(model),retired)
assert.equal(model.doctors.length,5,'provided clinician profiles must not be silently reassigned')
assert.throws(()=>lib.validate('branch','gwangmyeong',{...lib.baseBranches[0],id:'gwangmyeong'},true))
const sitemap=await(await fetch(base+'/sitemap.xml')).text()
const paths=[...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].flatMap(m=>{const p=new URL(m[1]).pathname;return /^\/en(?:\/|$)/.test(p)?[p]:[p,p==='/'?'/en':'/en'+p]}))]
for(const path of [...paths,'/llms.txt','/api/search?q='+encodeURIComponent('광명')]){
 const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();assert.doesNotMatch(html,retired,path)
 if(paths.includes(path)){assert.doesNotMatch(html,/id="header-branch-select"|class="branch-tabs"|<select[^>]*name="branch"/,path);if(process.env.EXPECT_INDEXABLE==='1'){assert.equal(r.headers.get('x-robots-tag'),null,path);assert.match(html,/name="robots" content="index,follow/)}else assert.match(r.headers.get('x-robots-tag')||'',/noindex/,path)}
}
for(const prefix of ['','/en'])for(const query of ['branch=gwangmyeong','branch=cheongnyangni','q=keep&branch=gwangmyeong']){
 const r=await fetch(base+prefix+'/directions?'+query,{redirect:'manual'});assert.equal(r.status,301);assert.equal(new URL(r.headers.get('location'),base).pathname,prefix+'/directions');assert.ok(!new URL(r.headers.get('location'),base).searchParams.has('branch'));if(query.startsWith('q='))assert.equal(new URL(r.headers.get('location'),base).searchParams.get('q'),'keep')
}
assert.deepEqual(Buffer.from(await(await fetch(base+'/static/fees-0324.pdf')).arrayBuffer()),fs.readFileSync('public/static/fees-0324.pdf'))
const errors=[];let widths=0
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}: {})});const context=await browser.newContext({reducedMotion:'reduce'});await context.addInitScript(()=>sessionStorage.setItem('gm_branch','gwangmyeong'));const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message))
 try{for(const path of ['/','/en','/directions','/en/directions','/reservation','/visiting','/careers','/pricing','/notice/check-clinic-hours']){
  await p.goto(base+path,{waitUntil:'networkidle'});assert.doesNotMatch(await p.locator('body').innerText(),retired,path);assert.equal(await p.locator('#header-branch-select,[data-branch],select[name="branch"]').count(),0)
  assert.equal(await p.locator('.header-phone').getAttribute('href'),'tel:029693776');for(const href of await p.locator('.branch-booking').evaluateAll(es=>es.map(e=>e.href)))assert.match(href,/1019716$/);for(const href of await p.locator('.branch-kakao').evaluateAll(es=>es.map(e=>e.href)))assert.match(href,/_npxibG$/);const clinic=await p.locator('#branch-data').evaluate(e=>JSON.parse(e.textContent));assert.equal(clinic.length,1);assert.match(clinic[0].booking,/1019716$/);assert.match(clinic[0].kakao,/_npxibG$/)
  const schemas=await p.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent));const clinics=schemas.filter(s=>s['@type']==='Dentist');assert.equal(clinics.length,1);assert.equal(clinics[0].telephone,'02-969-3776');assert.equal(clinics[0].hasMap,'https://map.naver.com/p/entry/place/19524548');assert.equal(await p.evaluate(()=>sessionStorage.getItem('gm_branch')),null)
  for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' '+path+' overflow '+width);widths++}
  if(path==='/pricing')assert.equal(await p.locator('[data-operation-key="fees-0324-review"] tbody tr').count(),32)
  if(path==='/visiting'||path==='/careers')assert.equal(await p.locator('input[name="branch"][type="hidden"]').inputValue(),'cheongnyangni')
 }
 await p.setViewportSize({width:390,height:844});await p.goto(base+'/directions');await p.screenshot({path:'test-results/single-clinic-'+name+'.png',fullPage:true})
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync('test-results/single-clinic'+(base.includes('localhost')?'':'-production')+'.json',JSON.stringify({base,routes:paths.length,widths,browsers:['chromium','webkit'],fees:32,pdfIdentical:true,retiredLocationAbsent:true,errors},null,2))
console.log(`PASS single clinic: ${paths.length} KO/EN routes, retired CMS rows excluded, old URL redirects, stale storage ignored, ${widths} Chromium/WebKit widths, 32 fees and identical PDF.`)
