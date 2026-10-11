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
const isolatedHtml=await isolated.text();assert.match(isolatedHtml,/SEO/);assert.match(isolatedHtml,/AEO/);assert.match(isolatedHtml,/최종 납품 승인·정식 오픈은 보류/)
assert.doesNotMatch(isolatedHtml,/ADMIN_PASSWORD|CLOUDFLARE_API_TOKEN|database_id|\.sources\//)
// The owner expressly approved publishing these payment terms; auth secrets remain forbidden.
const paymentTerms=['15,000,000원','VAT 포함','NH 농협','1085-02-007634','문석준','입금 확인 후 2주 이내 발급','영원한 무상 수정']
for(const term of paymentTerms)assert.ok(isolatedHtml.includes(term),'Approved payment term: '+term)
assert.doesNotMatch(isolatedHtml,/별도 견적·계약·결제 안내|500만원|3회 분할/)
assert.deepEqual([...new Set(isolatedHtml.match(/\b\d{4}-\d{2}-\d{6}\b/g))],['1085-02-007634'])
const source=fs.readFileSync('handoff/DELIVERY.md','utf8');assert.ok(source.length<40000,'Markdown renderer must not truncate source');assert.doesNotMatch(source,/\uFFFD/,'Source must not contain replacement characters')
assert.ok(source.includes('초안 저장만으로 환자 화면이 바뀌지는 않습니다.'))
assert.ok(source.includes('네이버 예약이나 톡톡 대화가 홈페이지 관리자에 자동으로 모이는 구조는 아닙니다.'))
const r=await fetch(base+'/handover');assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('content-security-policy'),/script-src 'self'/);assert.equal(r.headers.get('set-cookie'),null)
const liveHtml=await r.text();for(const term of paymentTerms)assert.ok(liveHtml.includes(term),'Live payment term: '+term)
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
  await page.setViewportSize({width:390,height:844});await payment.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:'test-results/handover-payment-'+name+'.png'})
  await context.close();const noJs=await browser.newContext({javaScriptEnabled:false}),plain=await noJs.newPage();await plain.goto(base+'/handover');assert.equal(await plain.locator('.guide-index a').count(),11);assert.equal(await plain.locator('#guide-print').isVisible(),false);assert.ok((await plain.locator('.guide-document').innerText()).includes('문석준 드림'));await noJs.close()
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync('test-results/handover'+(base.includes('localhost')?'':'-production')+'.json',JSON.stringify({base,dbIndependent:true,permanentNoindex:true,public200:true,widths,browsers:['chromium','webkit'],print:true,noJs:true,errors},null,2))
console.log(`PASS public handover: DB-independent HTTP200, permanent noindex, ${widths} Chromium/WebKit widths, axe, 11 TOC targets, print/PDF, copy/fallback and no-JS. Approved payment terms verified; no auth credentials or form submissions.`)
