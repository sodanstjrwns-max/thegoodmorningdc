import assert from 'node:assert/strict'
import fs from 'node:fs'
import {chromium,webkit} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const base=process.env.TEST_URL||'http://localhost:3000'
const talk='https://talk.naver.com/w4s3ry?frm=mnmb&frm=nmb_detail'
const ids=['EIBOfm2xcOM','MPPSAHAajHc']
const errors=[];let screens=0
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}: {})})
 try{
  const context=await browser.newContext({reducedMotion:'reduce'})
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  for(const prefix of ['','/en'])for(const path of ['/video','/doctors/kang-dowook','/reservation','/directions','/']){
   const response=await page.goto(base+prefix+path,{waitUntil:'networkidle'});assert.equal(response.status(),200)
   assert.match(response.headers()['x-robots-tag']||'',/noindex/)
   const links=page.locator('.clinic-talk');assert.ok(await links.count()>=3)
   for(const a of await links.all()){assert.equal(await a.getAttribute('href'),talk);assert.equal(await a.getAttribute('target'),'_blank');assert.match(await a.getAttribute('rel'),/noopener noreferrer/)}
   const broadcast=['/video','/doctors/kang-dowook'].includes(path)
   assert.equal(await page.locator('#broadcast-appearances').count(),broadcast?1:0)
   if(broadcast){
    const section=page.locator('#broadcast-appearances')
    assert.equal(await section.locator('img,iframe,button[data-video]').count(),0)
    assert.deepEqual(await section.locator('a').evaluateAll(es=>es.map(e=>e.href)),ids.map(id=>'https://www.youtube.com/watch?v='+id))
    for(const a of await section.locator('a').all()){assert.equal(await a.getAttribute('target'),'_blank');assert.match(await a.getAttribute('rel'),/noopener noreferrer/)}
    if(prefix)assert.doesNotMatch(await section.innerText(),/[가-힣]/)
    const axe=await new AxeBuilder({page}).include('#broadcast-appearances').analyze();assert.deepEqual(axe.violations,[],name+' '+prefix+path+' accessibility')
   }
   if(['/reservation','/directions','/'].includes(path))assert.equal(await page.locator('.visit-buttons .clinic-talk').count(),1)
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' '+prefix+path+' overflow '+width)
    for(const a of await page.locator('.visit-buttons .clinic-talk,.broadcast-card a').all()){const box=await a.boundingBox();assert.ok(box&&box.height>=44&&box.width>=44);assert.ok(box.x>=0&&box.x+box.width<=width+1)}
    screens++
   }
   if(path==='/reservation'){
    await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').click();assert.equal(await page.locator('.mobile-menu .clinic-talk').isVisible(),true);await page.locator('.menu-toggle').click()
   }
  }
  // Verify click destination in an isolated browser route: never send a real chat or load broadcaster media.
  await context.route('https://www.youtube.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<title>External destination test</title>'}))
  await context.route('https://talk.naver.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<title>External destination test</title>'}))
  await page.goto(base+'/video');const opened=page.waitForEvent('popup');await page.locator('.broadcast-card a').first().click();const popup=await opened;await popup.waitForLoadState();assert.equal(popup.url(),'https://www.youtube.com/watch?v='+ids[0]);await popup.close()
  await page.goto(base+'/reservation');const chatOpened=page.waitForEvent('popup');await page.locator('.visit-buttons .clinic-talk').click();const chat=await chatOpened;await chat.waitForLoadState();assert.equal(chat.url(),talk);await chat.close()
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/video');await page.locator('#broadcast-appearances').screenshot({path:'test-results/broadcast-talk-'+name+'.png',style:'.site-header,.mobile-bottom,.site-motion-toggle,.quick-contact{visibility:hidden!important}'})
  await context.close()
  const noJs=await browser.newContext({javaScriptEnabled:false});const p=await noJs.newPage();await p.goto(base+'/video');assert.equal(await p.locator('.broadcast-card a').count(),2);await p.goto(base+'/reservation');assert.equal(await p.locator('.visit-buttons .clinic-talk').getAttribute('href'),talk);await noJs.close()
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync('test-results/broadcast-talk'+(base.includes('localhost')?'':'-production')+'.json',JSON.stringify({base,screens,browsers:['chromium','webkit'],externalClicks:'intercepted; no messages sent',noJs:true,errors},null,2))
console.log(`PASS broadcast/Talk: ${screens} KO/EN Chromium/WebKit screens, links/new tabs, scoped axe, no-JS; no real chat submissions.`)
