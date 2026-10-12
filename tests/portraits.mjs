import assert from 'node:assert/strict'
import fs from 'node:fs'
import {chromium,webkit} from '@playwright/test'
const base=process.env.TEST_URL||'http://localhost:3000'
const production=!base.includes('localhost')
const slugs=['kang-dowook','lee-sanghoon','kang-jongseung','lee-kyungyeon','shin-hyunsook']
const paths=['/','/doctors','/mission','/treatments/sedation',...slugs.map(s=>'/doctors/'+s)]
const errors=[];let checks=0
// Hide only fixed site chrome for isolated grid evidence, not for layout/hover checks.
const gridCaptureStyle='.site-header,.quick-contact,.mobile-bottom,.site-motion-toggle,.skip-link,a[href="#main"],.reading-progress{visibility:hidden!important}'
// Every public route using a supplied portrait must use the new source dimensions/version.
const sitemap=await(await fetch(base+'/sitemap.xml')).text()
const routes=[...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].flatMap(m=>{const p=new URL(m[1]).pathname;return [p,p==='/'?'/en':'/en'+p]}))]
let portraitRoutes=0
for(const path of routes){const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();const images=[...html.matchAll(/<img\b[^>]*src="[^\"]*portrait-[0-4][^\"]*"[^>]*>/g)].map(m=>m[0]);if(images.length)portraitRoutes++;for(const image of images){assert.match(image,/clinician-portrait/,path);assert.match(image,/\?v=portrait-27/,path);assert.match(image,/width="1000" height="1250"/,path)}}
for(let i=0;i<5;i++)for(const suffix of ['','-w480','-w800']){const path='/static/images/portrait-'+i+suffix+'.webp';const r=await fetch(base+path+'?v=portrait-27');assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),fs.readFileSync('public'+path),'Deployed image matches '+path)}
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}: {})})
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  for(const path of paths){await page.goto(base+path,{waitUntil:'networkidle'});for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:960});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width)
   const results=await page.locator('img.clinician-portrait').evaluateAll(images=>images.map(img=>{const s=getComputedStyle(img),r=img.getBoundingClientRect(),p=img.parentElement.getBoundingClientRect();return {src:img.src,fit:s.objectFit,position:s.objectPosition,transform:s.transform,blend:s.mixBlendMode,w:r.width,h:r.height,pw:p.width,ph:p.height,framed:img.parentElement.matches('.doctor-image,.physician-deck-portrait')}}))
   assert.ok(results.length,path+' portrait found')
   for(const x of results){assert.equal(x.fit,'contain');assert.equal(x.position,'50% 0%');assert.equal(x.transform,'none');assert.equal(x.blend,'normal');assert.ok(Math.abs(x.w/x.h-.8)<.012,path+' image aspect '+JSON.stringify(x));if(x.framed)assert.ok(Math.abs(x.pw/x.ph-.8)<.012,path+' frame aspect');checks++}
  }
  if(path==='/doctors'){
   for(const image of await page.locator('img.clinician-portrait').all()){await image.scrollIntoViewIfNeeded();await image.hover();assert.equal(await image.evaluate(el=>getComputedStyle(el).transform),'none')}
   await page.locator('.doctor-grid').screenshot({style:gridCaptureStyle,path:`test-results/portraits-${name}${production?'-production':''}-desktop.png`})
   await page.setViewportSize({width:390,height:844});await page.locator('.doctor-grid').screenshot({style:gridCaptureStyle,path:`test-results/portraits-${name}${production?'-production':''}-mobile.png`})
  }
  if(path==='/doctors/shin-hyunsook'){await page.locator('.doctor-detail>img').screenshot({path:`test-results/portrait-shin-${name}${production?'-production':''}.png`})}
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.locator('#physician-deck').scrollIntoViewIfNeeded();
  for(let i=0;i<5;i++){const button=page.locator(`[data-deck-select="${i}"]`);if(await button.isVisible())await button.click();await page.waitForTimeout(120);const img=page.locator(`[data-physician-card="${i}"] img`);await img.scrollIntoViewIfNeeded();await img.screenshot({path:`test-results/portrait-home-${name}-${i}${production?'-production':''}.png`})}
  await page.goto(base+'/en/doctors');assert.equal(await page.locator('img.clinician-portrait').count(),5)
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const plain=await noJs.newPage();await plain.goto(base+'/doctors');assert.equal(await plain.locator('img.clinician-portrait').count(),5);await noJs.close();await context.close()
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync(`test-results/portraits${production?'-production':''}.json`,JSON.stringify({base,routes:routes.length,portraitRoutes,checks,assets:15,browsers:['chromium','webkit'],hoverNoCrop:true,noJs:true,errors},null,2))
console.log(`PASS portraits: ${routes.length} public routes (${portraitRoutes} with portraits), ${checks} full-frame checks, 15 exact assets, Chromium/WebKit, hover/no-JS, all five home cards.`)
