import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
const base=process.env.TEST_URL||'http://localhost:3000',browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
const admin=await browser.newContext({reducedMotion:'reduce'}),anon=await browser.newContext({reducedMotion:'reduce',extraHTTPHeaders:{'cf-connecting-ip':'198.51.100.'+(1+Math.floor(Math.random()*250))}}),page=await anon.newPage(),errors=[]
page.on('pageerror',e=>errors.push(e.message));const items=[],requests=[]
const api=(path,method='GET',data)=>admin.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data?{data}:{})})
const getEntries=async()=>(await(await api('content')).json()).entries
const record=async(kind,key)=>(await getEntries()).find(e=>e.kind===kind&&e.key===key)
const save=async(kind,key,value,action='draft',status=200)=>{const e=await record(kind,key),r=await api(`content/${kind}/${key}`,'POST',{action,revision:e?.revision||0,value});assert.equal(r.status(),status,await r.text());if(status===200&&!items.some(x=>x[0]===kind&&x[1]===key))items.push([kind,key])}
const submit=async(kind,extra={},status=201)=>{const r=await anon.request.post(base+'/api/requests/'+kind,{headers:{Origin:base},multipart:{name:'QA TEST ONLY',contact:'qa@example.invalid',branch:'cheongnyangni',role:'TEST',language:'English',visitDate:'2027-01-01',consent:'yes',locale:'ko',...extra}});assert.equal(r.status(),status,await r.text());if(status===201){const d=await r.json();requests.push(d.id);return d.id}}
try{
 const password=fs.readFileSync('.dev.vars','utf8').match(/ADMIN_PASSWORD="([^"]+)"/)[1];assert.equal((await api('login','POST',{password})).status(),200)
 const templates=(await(await api('content')).json()).templates
 assert.equal((await anon.request.get(base+'/api/admin/requests')).status(),401)
 assert.equal((await anon.request.post(base+'/api/requests/career',{headers:{Origin:'https://evil.example'},multipart:{name:'test'}})).status(),403)
 await submit('career',{branch:'gwangmyeong'},400);await submit('career',{consent:''},400);await submit('interpretation',{visitDate:'2026-02-30'},400);await submit('career',{resume:{name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')}},400)
 const caseKey='qa-showcase',v={...templates.showcase,key:caseKey,title:'QA TEST CASE - NOT CLINICAL',body:'SYNTHETIC TEST ONLY <script>alert(1)</script>',beforeDate:'2026-01-01',afterDate:'2026-02-01',caption:'QA room images, not patient pictures',treatment:'sedation'}
 const upload=await api('upload','POST'); // GET-style invalid upload must not create a public object.
 assert.equal(upload.status(),400)
 const image=await admin.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/webp'},data:fs.readFileSync('public/static/images/space-3.webp')});assert.equal(image.status(),200);v.beforeImage=(await image.json()).url;v.afterImage=v.beforeImage
 await save('showcase',caseKey,v);assert.equal((await anon.request.get(base+v.beforeImage)).status(),404);await save('showcase',caseKey,v,'publish',400)
 Object.assign(v,{consentConfirmed:true,consentRef:'QA-PRIVATE-CONSENT-REF',anonymized:true,medicalReviewed:true,reviewer:'QA-PRIVATE-REVIEWER',reviewedOn:'2026-10-08'});await save('showcase',caseKey,v,'publish')
 let html=await(await anon.request.get(base+'/cases')).text();assert.match(html,/QA TEST CASE/);assert.doesNotMatch(html,/QA-PRIVATE|<script>alert/);assert.match(html,/&lt;script&gt;/);assert.equal((await anon.request.get(base+v.beforeImage)).status(),200)
 await page.goto(base+'/cases');assert.equal(await page.locator('.case-comparison img').count(),2);await page.locator('[data-case-filter="review"]').click();assert.equal(await page.locator('.showcase-card:visible').count(),0);await page.locator('[data-case-filter="all"]').click()
 let e=await record('showcase',caseKey);assert.equal((await api(`content/showcase/${caseKey}/withdraw`,'POST',{revision:e.revision})).status(),200);assert.equal((await anon.request.get(base+v.beforeImage)).status(),404);assert.doesNotMatch(await(await anon.request.get(base+'/cases')).text(),/QA TEST CASE/)
 const jobKey='qa-vacancy',job={...templates.vacancy,key:jobKey,title:'QA TEST VACANCY',role:'QA',employmentType:'TEST',schedule:'TEST',salary:'TEST',qualifications:'TEST',body:'SYNTHETIC QA - NOT A REAL VACANCY',verified:true,source:'QA ONLY',accepting:true,deadline:'2027-12-31'};await save('vacancy',jobKey,{...job,salary:''},'publish',400);await save('vacancy',jobKey,job,'publish')
 const id=await submit('career',{vacancy:jobKey,resume:{name:'test.pdf',mimeType:'application/pdf',buffer:fs.readFileSync('public/static/fees-0324.pdf')}})
 const foreign=await submit('interpretation');assert.equal((await anon.request.get(base+`/api/admin/requests/${id}/attachment`)).status(),401)
 let inbox=(await(await api('requests')).json()).requests;let item=inbox.find(i=>i.id===id);assert.ok(item.hasAttachment);assert.equal(item.data.consentVersion,'2026-10-08-v1');assert.ok(item.expiresAt>item.createdAt+89*86400000)
 const attachment=await api(`requests/${id}/attachment`);assert.equal(attachment.status(),200);assert.match(attachment.headers()['content-disposition'],/attachment/);assert.deepEqual(await attachment.body(),fs.readFileSync('public/static/fees-0324.pdf'))
 assert.equal((await api(`requests/${foreign}`,'POST',{status:'confirmed',note:'QA',revision:1})).status(),200);assert.equal((await api(`requests/${foreign}`,'POST',{status:'closed',note:'QA',revision:1})).status(),409)
 await save('vacancy',jobKey,{...job,accepting:false},'publish');await submit('career',{vacancy:jobKey},409)
 const adminPage=await admin.newPage();adminPage.on('pageerror',e=>errors.push(e.message));await adminPage.goto(base+'/admin');await adminPage.locator('[data-request="'+id+'"]').waitFor();await adminPage.locator('[data-kind="showcase"]').click();await adminPage.locator('[data-studio-edit="'+caseKey+'"]').click();assert.equal(await adminPage.locator('#case-image-target').isVisible(),true);await adminPage.close()
 // Real user form, not only direct API requests.
 await page.goto(base+'/visiting');const form=page.locator('[data-request-kind="interpretation"]');await form.locator('[name="name"]').fill('QA BROWSER');await form.locator('[name="contact"]').fill('browser@example.invalid');await form.locator('[name="language"]').fill('Japanese');await form.locator('[name="visitDate"]').fill('2027-01-02');await form.locator('[name="consent"]').check();const response=page.waitForResponse(r=>r.url().endsWith('/api/requests/interpretation')&&r.request().method()==='POST');await form.locator('[type="submit"]').click();const submitted=await response;assert.equal(submitted.status(),201);requests.push((await submitted.json()).id);await page.waitForFunction(()=>document.querySelector('.request-result')?.textContent.includes('접수번호'))
 // Map network stays idle until explicit user interaction; only one clinic map is present.
 await page.goto(base+'/directions');assert.equal(await page.locator('.clinic-map-frame[src]').count(),0);await page.locator('.branch-panel:not([hidden]) .map-load').click();assert.match(await page.locator('.branch-panel:not([hidden]) iframe').getAttribute('src'),/^https:\/\/www.google.com\/maps\?q=/);assert.equal(await page.locator('.branch-panel:not([hidden]) iframe').isVisible(),true);assert.equal(await page.locator('[data-branch]').count(),0);assert.equal(await page.locator('.branch-panel').count(),1)
 const feeds=await api('channels/refresh','POST');assert.equal(feeds.status(),200);const column=(await feeds.json()).channels.find(c=>c.type==='column');assert.ok(column.items.length>0,'Real Inblog feed items');for(const i of column.items){assert.equal(new URL(i.url).hostname,'thegoodmorningdental.com');assert.ok(Number.isFinite(Date.parse(i.date)))}
 await page.goto(base+'/column');assert.ok(await page.locator('.external-column-card time').count()>0)
 for(const path of ['/cases','/careers','/visiting','/directions','/column'])for(const width of [320,390,600,768,1440]){await page.setViewportSize({width,height:844});await page.goto(base+path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width)}
 // Expired records are inaccessible before lazy deletion, then removed with their private PDF.
 if(base==='http://localhost:3000'){
  execFileSync('npx',['wrangler','d1','execute','webapp-production','--local','--command',`UPDATE service_requests SET expires_at=0 WHERE id='${id}'`],{stdio:'pipe'})
  assert.equal((await api(`requests/${id}/attachment`)).status(),404)
  assert.ok(!(await(await api('requests')).json()).requests.some(r=>r.id===id))
 }
 for(let n=0;n<2;n++)await submit('interpretation')
 await submit('interpretation',{},429)
 assert.deepEqual(errors,[]);console.log('PASS services: case consent gate/anonymous media/withdrawal, job conditions/closed-job rejection, private PDF application and interpreter requests, CSRF/validation/CAS, admin UI, map opt-in, real Inblog RSS, 25 mobile route widths; browser errors 0.')
}finally{
 for(const id of requests){const list=(await(await api('requests')).json()).requests,r=list?.find(i=>i.id===id);if(r)await api(`requests/${id}?revision=${r.revision}`,'DELETE')}
 for(const [kind,key]of items.reverse()){const e=await record(kind,key);if(e)await api(`content/${kind}/${key}?revision=${e.revision}`,'DELETE')}
 await browser.close()
}
