import assert from 'node:assert/strict'
import fs from 'node:fs'
import {chromium,webkit} from '@playwright/test'
const base=process.env.TEST_URL||'http://localhost:3000'
const indexable=process.env.EXPECT_INDEXABLE==='1'
const sitemap=await(await fetch(base+'/sitemap.xml')).text()
const paths=[...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].flatMap(m=>{const p=new URL(m[1]).pathname;return p.startsWith('/area/')?[p]:[p,p==='/'?'/en':'/en'+p] /* local hubs are Korean-only */}))]
const report={base,publicRoutes:paths.length,footerRoutes:0,viewports:0,checks:[],errors:[]}
for(const path of paths){
 const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();const footer=html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1];assert.ok(footer,path+' footer');assert.match(footer,/id="clinic-business-info"/,path);assert.match(footer,/204-96-61655/,path)
 if(!/^\/en(?:\/|$)/.test(path)){assert.match(footer,/더굿모닝치과의원/);assert.match(footer,/강종승/)}
 else assert.match(footer,/Business registration number/)
 assert.doesNotMatch(html,/광명|gwangmyeong|02-6013|026013|1551337|2006007864/)
 if(indexable){assert.equal(r.headers.get('x-robots-tag'),null,path);assert.match(html,/name="robots" content="index,follow/)}
 report.footerRoutes++
}
const home=await(await fetch(base+'/')).text()
for(const link of ['/treatments/sedation','/treatments/implant-revision','/treatments/implant-front','/treatments/sedation-disabled','/visiting','/admin']){if(link!=='/admin')assert.ok(home.includes(link),'Priority patient journey '+link)}
for(const link of ['https://booking.naver.com/booking/13/bizes/1019716','https://pf.kakao.com/_npxibG','https://talk.naver.com/w4s3ry','https://thegoodmorningdental.com/blog/'])assert.ok(home.includes(link),'Preserved official channel '+link)
const guide=await fetch(base+'/handover');assert.equal(guide.status,200);assert.match(guide.headers.get('x-robots-tag'),/noindex/);const guideText=await guide.text()
for(const term of ['15,000,000원','1085-02-007634','문석준','입금 확인 후 2주 이내 발급','영원한 무상 수정','약 6개월','SSR(Server-Side Rendering)','CAS(버전 비교 후 저장)'])assert.ok(guideText.includes(term),term)
assert.doesNotMatch(guideText,/정식 오픈 보류|현재 noindex|병원 확인 전 제작 미리보기/)
assert.match(fs.readFileSync('handoff/MESSAGE.txt','utf8'),/좋은 아침/)
const privacy=await(await fetch(base+'/privacy')).text();assert.match(privacy,/병원 제공 사업자등록증에서 확인/)
const checker=await(await fetch(base+'/symptom-checker')).text();assert.match(checker,/AI 진단이 아닌 선택형 정보 탐색 도구/)
assert.deepEqual(Buffer.from(await(await fetch(base+'/static/fees-0324.pdf')).arrayBuffer()),fs.readFileSync('public/static/fees-0324.pdf'))
for(const path of ['/api/admin/me','/api/admin/content'])assert.equal((await fetch(base+path)).status,401)
for(const path of ['/.sources/business-registration-original.jpg','/static/business-registration-original.jpg'])assert.equal((await fetch(base+path)).status,404)
if(indexable){const redirect=await fetch('https://www.thegoodmorningdc.kr/doctors',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),base+'/doctors')}
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}: {})})
 try{const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message))
  for(const path of ['/','/en','/doctors','/en/privacy']){
   await page.goto(base+path,{waitUntil:'networkidle'});const info=page.locator('#clinic-business-info');await info.scrollIntoViewIfNeeded();assert.ok((await info.innerText()).includes('204-96-61655'))
   if(/^\/en(?:\/|$)/.test(path))assert.doesNotMatch(await info.innerText(),/[가-힣]/)
   for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+path+width);const overflow=await info.evaluate(el=>el.scrollWidth>el.clientWidth);assert.equal(overflow,false);report.viewports++}
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.locator('#clinic-business-info').screenshot({path:`test-results/business-footer-${name}${indexable?'-production':''}.png`})
  await page.goto(base+'/en');await page.locator('#clinic-business-info').screenshot({path:`test-results/business-footer-en-${name}${indexable?'-production':''}.png`})
 }finally{await browser.close()}
}
assert.deepEqual(report.errors,[])
report.checks=['certificate-verified public business identifiers','single-clinic scope','priority treatments and official contact links','handover payment/support/technology/6-month plan','morning message','privacy source','non-diagnostic symptom tool','identical approved pricing PDF','unauthenticated admin denied','original certificate not served']
fs.writeFileSync(`test-results/request-audit${indexable?'-production':''}.json`,JSON.stringify(report,null,2))
console.log(`PASS request audit: ${report.footerRoutes} KO/EN footers, ${report.viewports} browser/width checks, request terms and preserved links, no certificate exposure.`)
