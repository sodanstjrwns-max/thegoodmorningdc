import {chromium,webkit} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const base=process.env.TEST_URL||'http://localhost:3000',errors=[]
const overlaps=(a,b)=>a&&b&&Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1
let checks=0
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({...(name==='chromium'?{args:['--no-sandbox']}:{} )})
 try{for(const path of ['/','/en']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+path,{waitUntil:'networkidle'});await p.locator('#hero-play-button').click();await p.waitForFunction(()=>document.querySelector('#hero-clinic-film').readyState>=2);await p.locator('.film-chapters').waitFor({state:'visible'})
  for(const width of [320,360,390,600,760,768,1024,1100,1200,1440,1920]){
   await p.setViewportSize({width,height:width===1024?600:1000});await p.evaluate(()=>document.fonts.ready)
   const box=async s=>p.locator(s).boundingBox();const copy=await box('.hero-copy'),bar=await box('.hero-bottom'),paragraph=await box('.hero-copy>p'),actions=await box('.hero-actions'),hero=await box('#hero-section')
   assert.ok(bar.y-(copy.y+copy.height)>=31,`${name} ${path} ${width}: copy/control breathing room`)
   assert.ok(actions.y-(paragraph.y+paragraph.height)>=15,`${name} ${path} ${width}: paragraph/action gap`)
   assert.ok(bar.y+bar.height<=hero.y+hero.height+1,`${name} ${path} ${width}: no clipped controls`)
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name} ${path} ${width}: horizontal overflow`)
   const controls=await p.locator('.hero-actions>a,.film-chapters button,#hero-motion-toggle').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({label:e.textContent,rect:e.getBoundingClientRect().toJSON()})))
   for(const c of controls){assert.ok(c.rect.height>=44,c.label+' touch target');assert.ok(c.rect.x>=-1&&c.rect.right<=width+1,c.label+' within viewport')}
   for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++)assert.ok(!overlaps(controls[i].rect,controls[j].rect),`${name} ${width}: ${controls[i].label} / ${controls[j].label}`)
   checks++
  }
  await p.setViewportSize({width:1440,height:1000});await p.locator('button[data-film-chapter="2"]').click();assert.equal(await p.locator('button[data-film-chapter="2"]').getAttribute('aria-pressed'),'true');await p.locator('#hero-motion-toggle').click();await p.waitForFunction(()=>document.querySelector('#hero-clinic-film').paused)
  if(path==='/'){
   await p.locator('#hero-section').screenshot({path:`test-results/hero-layout-${name}-desktop.png`});await p.setViewportSize({width:390,height:844});await p.addStyleTag({content:'.site-header,.mobile-bottom,.site-motion-toggle{visibility:hidden!important}'});await p.locator('#hero-section').screenshot({path:`test-results/hero-layout-${name}-mobile.png`})
  }
  assert.equal(await p.locator('.film-watch-link').getAttribute('href'),'#opening-films');await p.locator('.film-watch-link').click();assert.equal(new URL(p.url()).hash,'#opening-films');await context.close()
 }
 const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}}),staticPage=await staticContext.newPage();await staticPage.goto(base+'/');assert.equal(await staticPage.locator('.film-chapters').isVisible(),false);assert.equal(await staticPage.locator('.film-watch-link').isVisible(),true);assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await staticContext.close()
 }finally{await browser.close()}
}
assert.deepEqual(errors,[])
fs.writeFileSync('test-results/hero-layout'+(base.includes('localhost')?'':'-production')+'.json',JSON.stringify({base,checks,engines:['Chromium','WebKit'],errors},null,2))
console.log(`PASS hero spacing: ${checks} KO/EN Chromium/WebKit widths, separate copy/control rows, 44px targets, chapter selection/pause/anchor links and no-JS fallback.`)
