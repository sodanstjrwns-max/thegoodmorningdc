import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
import {chromium,webkit} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const base=process.env.TEST_URL||'http://localhost:3000'
const compiled=await build({entryPoints:['src/index.tsx'],bundle:true,platform:'node',format:'esm',write:false,loader:{'.md':'text'}})
const {default:app}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
let dbCalls=0
const env={PUBLIC_SITE_URL:'https://thegoodmorningdc.kr',DB:{prepare(){dbCalls++;throw Error('Guide must not read DB')}}}
const isolated=await app.fetch(new Request('https://thegoodmorningdc.kr/handover'),env)
assert.equal(isolated.status,200);assert.match(isolated.headers.get('x-robots-tag'),/noindex/);assert.equal(dbCalls,0)
const isolatedHtml=await isolated.text();assert.match(isolatedHtml,/SEO/);assert.match(isolatedHtml,/AEO/);assert.match(isolatedHtml,/검색 공개는 승인에 따라 진행/);assert.match(isolatedHtml,/과거500의 단일 원인은 미확정/)
assert.doesNotMatch(isolatedHtml,/ADMIN_PASSWORD|CLOUDFLARE_API_TOKEN|database_id|\.sources\//)
// The owner expressly approved publishing these payment terms; auth secrets remain forbidden.
const paymentTerms=['15,000,000원','VAT 포함','NH 농협','1085-02-007634','문석준','입금 확인 후 2주 이내 발급','영원한 무상 수정']
for(const term of paymentTerms)assert.ok(isolatedHtml.includes(term),'Approved payment term: '+term)
assert.doesNotMatch(isolatedHtml,/별도 견적·계약·결제 안내|500만원|3회 분할/)
// Agency policy: the admin login block shows the real ADMIN_PASSWORD only on the production origin.
const secret='qa-'+crypto.randomUUID()
const prod=await(await app.fetch(new Request('https://thegoodmorningdc.kr/handover'),{...env,ADMIN_PASSWORD:secret})).text()
assert.match(prod,/id="delivery-admin-access"/);assert.ok(prod.includes('https://thegoodmorningdc.kr/admin'));assert.ok(prod.includes(secret),'Production origin renders the owner password')
for(const host of ['https://abc123.webapp-2-9y5.pages.dev/handover','https://preview.example/handover']){const r=await app.fetch(new Request(host),{...env,ADMIN_PASSWORD:secret});const t=await r.text();assert.ok(!t.includes(secret),'Preview host never renders the password: '+host);assert.match(t,/정식 도메인의 안내서/)}
const prodResponse=await app.fetch(new Request('https://thegoodmorningdc.kr/handover'),{...env,ADMIN_PASSWORD:secret});assert.match(prodResponse.headers.get('cache-control'),/no-store/);assert.match(prodResponse.headers.get('x-robots-tag'),/noindex/)
assert.doesNotMatch(prod,/공개 안내서에는 비밀번호|관리자 비밀번호와 환자·직원 개인정보는 이 공개 문서에 넣지 않았습니다/)
assert.ok(!fs.readFileSync('src/handover.ts','utf8').includes(secret)&&!fs.readFileSync('handoff/DELIVERY.md','utf8').includes(secret))
assert.deepEqual([...new Set(isolatedHtml.match(/\b\d{4}-\d{2}-\d{6}\b/g))],['1085-02-007634'])
const source=fs.readFileSync('handoff/DELIVERY.md','utf8');assert.ok(source.length<40000,'Markdown renderer must not truncate source');assert.doesNotMatch(source,/\uFFFD/,'Source must not contain replacement characters')
assert.ok(source.includes('초안 저장만으로 환자 화면이 바뀌지는 않습니다.'))
assert.ok(source.includes('네이버 예약이나 톡톡 대화가 홈페이지 관리자에 자동으로 모이는 구조는 아닙니다.'))
const r=await fetch(base+'/handover');assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('content-security-policy'),/script-src 'self'/);assert.equal(r.headers.get('set-cookie'),null)
const liveHtml=await r.text();for(const term of paymentTerms)assert.ok(liveHtml.includes(term),'Live payment term: '+term)
const technicalTerms=['화면 뒤에 담은 기술력','SSR(Server-Side Rendering)','canonical','hreflang','JSON-LD','llms.txt','D1','R2','CAS(버전 비교 후 저장)','HTTP Range','JavaScript','약 6개월','첫 1~2개월','3~4개월','5~6개월','확정 기한은 아닙니다']
for(const term of technicalTerms){assert.ok(isolatedHtml.includes(term),'Source technical value: '+term);assert.ok(liveHtml.includes(term),'Live technical value: '+term)}
for(const html of [isolatedHtml,liveHtml])assert.doesNotMatch(html,/검색 색인은 기다림만으로 완성되지 않습니다|현재 noindex|정식 오픈 보류|정식 오픈 승인은 별도 단계/)
assert.equal((source.split('## 04.')[1].split('## 05.')[0].match(/### [1-9]\. /g)||[]).length,9,'Nine evidence-based technical strengths')
assert.equal((await fetch(base+'/handover',{method:'HEAD'})).status,200)
assert.equal((await fetch(base+'/handover/',{redirect:'manual'})).status,301)
assert.equal((await fetch(base+'/en/handover',{redirect:'manual'})).headers.get('location'),'/handover')
const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert.doesNotMatch(sitemap,/\/handover/)
const errors=[];let widths=0
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}: {})})
 try{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/handover',{waitUntil:'networkidle'})
  assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.guide-index a').count(),11)
  for(const a of await page.locator('.guide-index a').all()){const href=await a.getAttribute('href');assert.equal(await page.locator(href).count(),1)}
  const payment=page.locator('h2').filter({hasText:'11. 결제 안내'});assert.equal(await payment.count(),1)
  assert.equal(await page.locator('.guide-index a').filter({hasText:'결제 안내'}).count(),1)
  assert.equal(await page.locator('form').count(),0);assert.equal(await page.locator('iframe').count(),0)
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://thegoodmorningdc.kr/handover')
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' '+width+' horizontal overflow');widths++}
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations,[],name+' accessibility')
  await page.evaluate(()=>window.print=()=>{window.__printed=true});await page.locator('#guide-print').click();assert.ok(await page.evaluate(()=>window.__printed))
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copied=value}},configurable:true})});await page.locator('#guide-copy').click();assert.equal(await page.evaluate(()=>window.__copied),'https://thegoodmorningdc.kr/handover');assert.match(await page.locator('#guide-feedback').innerText(),/복사했습니다/)
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('Unavailable')}},configurable:true})});await page.locator('#guide-copy').click();await page.waitForFunction(()=>document.querySelector('#guide-feedback').textContent.includes('주소창'))
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.guide-actions').isVisible(),false);assert.ok(await page.locator('.guide-document').isVisible());if(name==='chromium')await page.pdf({path:'test-results/handover-print.pdf',format:'A4',printBackground:true});await page.emulateMedia({media:'screen'})
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/handover');await page.screenshot({path:'test-results/handover-'+name+'-mobile.png'});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/handover-'+name+'-desktop.png'})
  await page.setViewportSize({width:390,height:844});await page.locator('h2').filter({hasText:'04. 화면 뒤에 담은 기술력'}).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:'test-results/handover-technology-'+name+'.png'});await page.locator('h2').filter({hasText:'06. 검색 성장은 약 6개월'}).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:'test-results/handover-search-'+name+'.png'})
  await page.setViewportSize({width:390,height:844});await payment.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:'test-results/handover-payment-'+name+'.png'})
  await context.close();const noJs=await browser.newContext({javaScriptEnabled:false}),plain=await noJs.newPage();await plain.goto(base+'/handover');assert.equal(await plain.locator('.guide-index a').count(),11);assert.equal(await plain.locator('#guide-print').isVisible(),false);assert.ok((await plain.locator('.guide-document').innerText()).includes('문석준 드림'));await noJs.close()
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync('test-results/handover'+(base.includes('localhost')?'':'-production')+'.json',JSON.stringify({base,dbIndependent:true,permanentNoindex:true,public200:true,widths,browsers:['chromium','webkit'],print:true,noJs:true,errors},null,2))
console.log(`PASS public handover: DB-independent HTTP200, permanent noindex, ${widths} Chromium/WebKit widths, axe, 11 TOC targets, print/PDF, copy/fallback and no-JS. Approved payment terms verified; admin login block shows the password only on the production origin; no form submissions.`)
