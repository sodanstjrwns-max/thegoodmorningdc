import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const base=process.env.TEST_URL||'http://localhost:3000'
assert.doesNotMatch(fs.readFileSync('public/static/style.css','utf8'),/@view-transition\s*\{|::view-transition-/,'Do not reintroduce the aborted cross-document snapshot path')
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const errors=[];let navigations=0
try{
 for(const mode of ['animated','reduced','saved-off','save-data']){
  const context=await browser.newContext({viewport:{width:mode==='animated'?1440:390,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference'})
  await context.addInitScript(mode=>{
   window.startedAnimations=[];document.addEventListener('animationstart',e=>window.startedAnimations.push(e.animationName));
   if(mode==='saved-off')sessionStorage.setItem('gm_motion','off');
   if(mode==='save-data')Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,addEventListener(){}}});
  },mode)
  const p=await context.newPage();p.on('pageerror',e=>errors.push({mode,url:p.url(),message:e.message}))
  await p.goto(base+'/mission',{waitUntil:'domcontentloaded'});navigations++
  await p.waitForFunction(()=>document.documentElement.classList.contains('motion-enabled')||document.documentElement.classList.contains('motion-off'))
  if(mode==='animated'){
   await p.waitForFunction(()=>window.startedAnimations.includes('route-arrive'))
   await p.waitForFunction(()=>!document.querySelector('.route-enter'))
   assert.equal(await p.locator('.page-heading').evaluate(el=>getComputedStyle(el).opacity),'1')
  }else{
   assert.equal(await p.locator('.route-enter').count(),0,mode+' entrance is disabled')
   assert.equal(await p.locator('.page-heading').evaluate(el=>el.getAnimations().length),0)
  }
  // Actual links: documents arrive without waiting for another document's animation.
  await p.locator('.site-header .brand').click();await p.waitForURL(base+'/');navigations++
  await p.locator('.priority-card').first().click();await p.waitForURL(base+'/treatments/sedation');navigations++
  await p.locator('.detail-nav a[href="#questions"]').click();assert.equal(new URL(p.url()).hash,'#questions')
  assert.equal(await p.locator('#questions').isVisible(),true)
  await p.goBack({waitUntil:'domcontentloaded'});await p.goBack({waitUntil:'domcontentloaded'});navigations+=2
  assert.equal(new URL(p.url()).pathname,'/')
  await p.goForward({waitUntil:'domcontentloaded'});navigations++
  assert.equal(new URL(p.url()).pathname,'/treatments/sedation')
  // Repeat navigation with in-flight arrival effects and changing motion preferences.
  for(let round=0;round<3;round++){
   for(const path of ['/faq','/doctors/kang-dowook','/directions','/column','/mission']){
    const r=await p.goto(base+path,{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);navigations++
    assert.equal(await p.locator('h1').count(),1)
    assert.equal(await p.locator('#main').evaluate(el=>el.inert),false)
    if(mode==='animated')await p.emulateMedia({reducedMotion:round%2?'reduce':'no-preference'})
   }
  }
  await p.goto(base+'/treatments/sedation#questions',{waitUntil:'domcontentloaded'});navigations++
  assert.equal(await p.locator('.route-enter').count(),0,'deep links never move a restored reading position')
  // Mobile menu must release focus and scrolling when the layout becomes desktop.
  await p.setViewportSize({width:390,height:844});await p.goto(base+'/mission');navigations++
  await p.locator('.menu-toggle').click();assert.equal(await p.locator('#main').evaluate(el=>el.inert),true)
  await p.setViewportSize({width:1440,height:900});await p.waitForFunction(()=>!document.querySelector('#main').inert)
  assert.equal(await p.locator('#mobile-menu').isVisible(),false);assert.equal(await p.locator('body').evaluate(el=>el.classList.contains('locked')),false)
  // Deterministic persisted pageshow check in addition to real back/forward above.
  await p.setViewportSize({width:390,height:844});await p.locator('.menu-toggle').click()
  await p.evaluate(()=>{sessionStorage.setItem('gm_motion','off');sessionStorage.setItem('gm_branch','gwangmyeong');dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))})
  assert.equal(await p.locator('#main').evaluate(el=>el.inert),false)
  assert.equal(await p.locator('#header-branch-select').inputValue(),'gwangmyeong')
  assert.equal(await p.locator('html').evaluate(el=>el.classList.contains('motion-off')),true)
  assert.equal(await p.locator('.route-enter').count(),0)
  await context.close()
 }
 const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}})
 const p=await staticContext.newPage();await p.goto(base+'/mission');assert.equal(await p.locator('.page-heading').evaluate(el=>getComputedStyle(el).opacity),'1');assert.equal(await p.locator('h1').isVisible(),true)
 await p.locator('.site-header .brand').click();await p.waitForURL(base+'/');await staticContext.close()
 assert.deepEqual(errors,[],'All browser errors stay visible: no suppression or ignore filter')
 console.log(`PASS: ${navigations} navigations, real links/history/anchors, interrupted arrival effects, four motion policies, no-JS, menu resize, persisted-state recovery. Browser errors: 0.`)
}finally{await browser.close()}
