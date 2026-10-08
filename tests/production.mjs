// Explicit opt-in: creates only synthetic private requests/drafts; never publishes QA content.
import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const base=process.env.TEST_URL?.replace(/\/$/,'')
assert.equal(base,'https://webapp-2-9y5.pages.dev','Only the dedicated BYOK validation deployment may be tested')
assert.equal(process.env.RUN_PRIVATE_PRODUCTION_QA,'yes')
const password=fs.readFileSync(process.env.TEST_ADMIN_PASSWORD_FILE,'utf8').trim()
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
const admin=await browser.newContext(),anon=await browser.newContext({reducedMotion:'reduce'})
const api=(path,method='GET',data)=>admin.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data?{data}:{})})
const ids=[],key='deployment-qa-'+Date.now(),media=[],errors=[]
let draftCreated=false,loggedIn=false
try {
 assert.equal((await anon.request.get(base+'/api/admin/content')).status(),401)
 const login=await api('login','POST',{password});assert.equal(login.status(),200);loggedIn=true
 const cookies=await admin.cookies();const cookie=cookies.find(c=>c.name==='gm_session');assert.ok(cookie.httpOnly&&cookie.secure&&cookie.sameSite==='Strict')
 const content=await(await api('content')).json(),operations=content.entries.filter(e=>e.kind==='operation')
 assert.equal(operations.length,44);assert.equal(operations.filter(e=>e.live).length,1)
 for(const sitemap of ['/sitemap.xml','/sitemap-languages.xml']){
  const xml=await(await anon.request.get(base+sitemap)).text(),urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,60)
  for(const url of urls){assert.equal(new URL(url).origin,base);const response=await anon.request.get(url);assert.equal(response.status(),200,url);assert.match(response.headers()['x-robots-tag'],/noindex/);assert.doesNotMatch(await response.text(),/QA TEST|SYNTHETIC QA|QA-PRIVATE/)}
 }
 assert.match(await(await anon.request.get(base+'/robots.txt')).text(),/Disallow: \//)
 const pdf=fs.readFileSync('public/static/fees-0324.pdf');assert.deepEqual(await(await anon.request.get(base+'/static/fees-0324.pdf')).body(),pdf)
 for(const file of ['clinic-opening.mp4','clinic-opening-mobile.mp4']){
  const range=await anon.request.get(base+'/films/'+file,{headers:{Range:'bytes=0-1'}});assert.equal(range.status(),206);assert.equal((await range.body()).length,2)
  assert.match(range.headers()['content-range'],/^bytes 0-1\//)
  assert.equal((await anon.request.head(base+'/films/'+file)).status(),200)
  assert.equal((await anon.request.get(base+'/films/'+file,{headers:{Range:'bytes=999999999-'}})).status(),416)
 }
 assert.equal((await anon.request.post(base+'/api/requests/career',{headers:{Origin:'https://invalid.example'},multipart:{name:'QA'}})).status(),403)
 const image=fs.readFileSync('public/static/images/space-3.webp')
 const uploaded=await admin.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/webp'},data:image});assert.equal(uploaded.status(),200)
 const imageUrl=(await uploaded.json()).url;media.push(imageUrl.slice('/media/'.length));fs.writeFileSync('.sources/deployment/qa-media.json',JSON.stringify(media),{mode:0o600})
 assert.equal((await anon.request.get(base+imageUrl)).status(),404);assert.deepEqual(await(await admin.request.get(base+imageUrl)).body(),image)
 const value={...content.templates.showcase,key,title:'PRIVATE DEPLOYMENT QA - NOT A PATIENT',body:'Technical validation only. Never publish.',beforeImage:imageUrl,afterImage:imageUrl}
 assert.equal((await api('content/showcase/'+key,'POST',{action:'draft',revision:0,value})).status(),200);draftCreated=true
 assert.equal((await api('content/showcase/'+key,'POST',{action:'draft',revision:0,value})).status(),409)
 assert.equal((await api('content/showcase/'+key,'POST',{action:'publish',revision:1,value})).status(),400)
 assert.doesNotMatch(await(await anon.request.get(base+'/cases')).text(),/PRIVATE DEPLOYMENT QA/)
 for(const kind of ['career','interpretation']){
  const response=await anon.request.post(base+'/api/requests/'+kind,{headers:{Origin:base},multipart:{name:'DEPLOYMENT QA - DELETE',contact:'qa@example.invalid',branch:'cheongnyangni',role:'Technical test',language:'English',visitDate:'2027-01-01',consent:'yes',locale:'ko',...(kind==='career'?{resume:{name:'qa.pdf',mimeType:'application/pdf',buffer:pdf}}:{})}})
  assert.equal(response.status(),201,await response.text());const id=(await response.json()).id;ids.push(id)
  assert.equal((await anon.request.get(base+'/api/admin/requests/'+id+'/attachment')).status(),401)
  if(kind==='career'){const download=await api('requests/'+id+'/attachment');assert.equal(download.status(),200);assert.match(download.headers()['content-disposition'],/attachment/);assert.match(download.headers()['cache-control'],/no-store/);assert.deepEqual(await download.body(),pdf)}
  assert.equal((await api('requests/'+id,'POST',{revision:1,status:'contacted',note:'Technical QA, not a real request'})).status(),200)
  assert.equal((await api('requests/'+id,'POST',{revision:1,status:'closed',note:'stale'})).status(),409)
 }
 const refreshed=await api('channels/refresh','POST');assert.equal(refreshed.status(),200)
 const channels=(await refreshed.json()).channels;assert.ok(channels.find(c=>c.type==='column').items.length>0)
 const page=await anon.newPage();page.on('pageerror',e=>errors.push(e.message))
 for(const path of ['/','/pricing','/directions','/careers','/visiting','/column']){
  await page.goto(base+path);for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' '+width)}
 }
 await page.goto(base+'/directions');assert.equal(await page.locator('.clinic-map-frame[src]').count(),0);await page.locator('.branch-panel:not([hidden]) .map-load').click();assert.match(await page.locator('.branch-panel:not([hidden]) iframe').getAttribute('src'),/^https:\/\/www.google.com\/maps/)
 await page.goto(base+'/pricing');assert.equal(await page.locator('[data-operation-key="fees-0324-review"] tbody tr').count(),32)
 await page.screenshot({path:'test-results/production-pricing.png',fullPage:true})
 assert.deepEqual(errors,[])
 console.log('PASS production: 120 KO/EN routes, noindex, original fee PDF/32 rows, film Range/HEAD, secure admin cookie, 44 CMS entries/43 private, private R2 image/PDF, consent gate, revision conflicts, two synthetic requests, Inblog RSS, map opt-in and 24 mobile widths.')
} finally {
 if(loggedIn){
  for(const id of ids){const list=await(await api('requests')).json(),r=list.requests?.find(r=>r.id===id);if(r)assert.equal((await api('requests/'+id+'?revision='+r.revision,'DELETE')).status(),200);assert.equal((await api('requests/'+id+'/attachment')).status(),404)}
  if(draftCreated){const list=await(await api('content')).json(),e=list.entries.find(e=>e.kind==='showcase'&&e.key===key);if(e)assert.equal((await api('content/showcase/'+key+'?revision='+e.revision,'DELETE')).status(),200)}
  assert.equal((await api('logout','POST')).status(),200)
 }
 await browser.close()
 console.log('Private QA requests/draft removed and admin session logged out. QA image keys are recorded for explicit R2 cleanup.')
}
