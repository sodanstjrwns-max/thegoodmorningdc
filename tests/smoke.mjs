import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const base=process.env.TEST_URL||'http://localhost:3000'
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
const loadImages=()=>page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';try{await image.decode()}catch{}}))})
try{
 await page.goto(base,{waitUntil:'networkidle'});await loadImages();await page.screenshot({path:'test-results/home-desktop.png',fullPage:false});
 assert.equal(await page.locator('h1').count(),1)
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'desktop overflow')
 assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(x=>x.complete&&!x.naturalWidth).length),0,'broken images')
 await page.locator('.search-open').click();await page.locator('#site-search').fill('수면');await page.waitForSelector('.search-result');assert.ok(await page.locator('.search-result').count()>0);await page.keyboard.press('Escape');await page.locator('#search-dialog').waitFor({state:'hidden'});assert.equal(await page.locator('#search-dialog').isVisible(),false)
 await page.goto(base+'/treatments');await page.locator('[data-filter="1"]').click();assert.equal(await page.locator('#treatment-list .info-card:visible').count(),3);await page.locator('#treatment-search').fill('장애인');assert.equal(await page.locator('#treatment-list .info-card:visible').count(),1);await page.locator('#treatment-search').fill('존재하지않는검색어');assert.equal(await page.locator('#treatment-empty').isVisible(),true)
 await page.goto(base+'/directions');await page.locator('[data-branch="gwangmyeong"]').click();assert.equal(await page.locator('[data-branch-panel="gwangmyeong"]').isVisible(),true);assert.equal(await page.locator('[data-branch-panel="cheongnyangni"]').isVisible(),false)
 await page.goto(base+'/faq');await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'')
 await page.goto(base+'/symptom-checker');for(const n of [2,1,0,3])await page.locator(`[data-answer="${n}"]`).click();assert.match(await page.locator('#checker-result').textContent(),/119/);await page.locator('#checker-restart').click();assert.equal(await page.locator('[data-answer]').count(),6)
 await page.goto(base+'/encyclopedia');await page.locator('#glossary-search').fill('차폐막');assert.ok(await page.locator('.term-card:visible').count()>0)
 // Source-content regression: every public route, exact FAQ/schema parity, and original main structure.
 const sitemap=await (await context.request.get(base+'/sitemap.xml')).text()
 const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1])
 const titles=new Set();let carePages=0;let questionCount=0
 for(const url of urls){
  const response=await context.request.get(url);assert.equal(response.status(),200,url)
  const html=await response.text();assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,url+' H1')
  const title=html.match(/<title>(.*?)<\/title>/s)[1];assert.ok(!titles.has(title),'duplicate title: '+title);titles.add(title)
  assert.doesNotMatch(html,/「○|�|인체에 무해|몇 년 뒤에도 잇몸선이 유지|5인 전문의|35년/,url+' unsafe or unfinished copy')
  if(new URL(url).pathname.startsWith('/treatments/')){
   carePages++;assert.match(html,/id="care-difference"/);assert.match(html,/class="care-explanation"/)
   const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]).find(x=>x['@type']==='FAQPage')
   questionCount+=schema.mainEntity.length
   assert.ok(schema.mainEntity.length>=4,url+' specific FAQ')
  }
 }
 assert.equal(carePages,31);assert.equal(questionCount,285)
 for(const path of ['/.sources/proposal.txt','/.dev.vars','/static/images/space-14.webp'])assert.equal((await context.request.get(base+path)).status(),404,'private source must not be public: '+path)
 await page.goto(base);assert.equal(await page.locator('.strength-card').count(),9);assert.equal(await page.locator('.specialty-card').count(),8);assert.equal(await page.locator('.doctors-home .doctor-card').count(),5)
 assert.match(await page.locator('.hero-copy').textContent(),/믿을 수 있는 설명을/)
 await page.goto(base+'/mission');assert.match(await page.locator('#main').textContent(),/그러니까 저는 이 동네에서/);assert.match(await page.locator('#care-for-everyone').textContent(),/포기하고 돌아가지 않으셨으면 합니다/)
 const careUrls=urls.filter(u=>new URL(u).pathname.startsWith('/treatments/'))
 for(const path of ['/faq',...careUrls.map(u=>new URL(u).pathname)]){
  await page.goto(base+path)
  const visible=await page.locator('details').evaluateAll(nodes=>nodes.map(n=>({q:[...n.querySelector('summary').childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join('').trim(),a:n.querySelector('.faq-answer').textContent})))
  const structured=await page.locator('script[type="application/ld+json"]').evaluate(n=>JSON.parse(n.textContent).find(x=>x['@type']==='FAQPage').mainEntity.map(x=>({q:x.name,a:x.acceptedAnswer.text})))
  assert.deepEqual(visible,structured,path+' FAQ/schema mismatch')
  await page.setViewportSize({width:320,height:844})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' 320px overflow')
  await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'')
 }
 for(const width of [320,360,390,768,1024,1200,1440]){
  await page.setViewportSize({width,height:1000})
  for(const path of ['/','/mission','/treatments/implant-revision','/treatments/sinus-lift']){
   await page.goto(base+path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' overflow '+width)
  }
 }
 await page.setViewportSize({width:1440,height:1000})
 console.log(`PASS: ${urls.length} public routes, 31 source-based treatments, 285 FAQs with exact schema parity, nine differentiators, eight treatment cards, five doctors, 320–1440px layouts.`)
 // Cinematic hero: actual changing frames, pause/resume, visibility, live OS preference, no-JS fallback.
 const motionContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'})
 const motionPage=await motionContext.newPage();motionPage.on('pageerror',e=>errors.push(e.message))
 await motionPage.goto(base,{waitUntil:'networkidle'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 const movingFrame=()=>motionPage.locator('.hero-frame-one img').evaluate(el=>getComputedStyle(el).transform)
 const before=await movingFrame();await motionPage.waitForTimeout(350);assert.notEqual(await movingFrame(),before,'hero must actually move')
 await motionPage.locator('#hero-motion-toggle').click()
 assert.equal(await motionPage.locator('#hero-motion-toggle').getAttribute('aria-pressed'),'true')
 await motionPage.waitForTimeout(80);const paused=await movingFrame();await motionPage.waitForTimeout(300);assert.equal(await movingFrame(),paused,'hero freeze')
 assert.equal(await motionPage.locator('#hero-section').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'all hero motion paused')
 await motionPage.locator('#hero-motion-toggle').click();await motionPage.waitForTimeout(150);assert.notEqual(await movingFrame(),paused,'hero resume')
 await motionPage.locator('#why-goodmorning').scrollIntoViewIfNeeded()
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='suspended')
 await motionPage.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 await motionPage.emulateMedia({reducedMotion:'reduce'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='reduced')
 assert.equal(await motionPage.locator('#hero-motion-toggle').isDisabled(),true)
 assert.equal(await motionPage.locator('#hero-section').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'reduced motion must be static')
 assert.equal(await motionPage.locator('.hero-frame-one').evaluate(el=>getComputedStyle(el).opacity),'1')
 await motionPage.emulateMedia({reducedMotion:'no-preference'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 for(const width of [320,390,768,1440]){
  await motionPage.setViewportSize({width,height:844});await motionPage.goto(base,{waitUntil:'networkidle'})
  await motionPage.waitForTimeout(3100)
  assert.equal(await motionPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'animated hero overflow '+width)
  const bounds=await motionPage.locator('.hero-title-line>span').evaluateAll(nodes=>nodes.map(n=>({scroll:n.scrollWidth,parent:n.parentElement.clientWidth})))
  assert.ok(bounds.every(x=>x.scroll<=x.parent+1),'headline clipping '+width)
  await motionPage.screenshot({path:`test-results/hero-motion-${width}.png`})
 }
 // Seek the CSS timeline deterministically to confirm the second clinic image becomes visible.
 await motionPage.locator('#hero-section').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.animationName==='hero-scene-fade').forEach(a=>{a.pause();a.currentTime=8000}))
 assert.equal(await motionPage.locator('.hero-frame-two').evaluate(el=>getComputedStyle(el).opacity),'1','second real clinic frame appears')
 await motionContext.close()
 const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}})
 const staticPage=await staticContext.newPage();await staticPage.goto(base)
 assert.equal(await staticPage.locator('.hero-title-line').count(),2);assert.equal(await staticPage.locator('.hero-frame-one').evaluate(el=>getComputedStyle(el).opacity),'1')
 assert.equal(await staticPage.locator('.hero-actions .btn').getAttribute('href'),'/reservation')
 assert.equal(await staticPage.locator('#hero-motion-toggle').isVisible(),false)
 await staticContext.close()
 console.log('PASS: real hero animation, three-scene timeline, pause/resume, offscreen suspension, live reduced-motion, no-JS fallback and animated responsive layouts.')
 const api=await context.request.get(base+'/api/admin/posts');assert.equal(api.status(),401)
 const password=fs.readFileSync('.dev.vars','utf8').match(/ADMIN_PASSWORD="([^"]+)"/)[1]
 const bad=await context.request.post(base+'/api/admin/login',{headers:{Origin:'https://not-allowed.example'},data:{password}});assert.equal(bad.status(),403)
 await page.goto(base+'/admin');await page.locator('[name="password"]').fill(password);await page.locator('#admin-login button').click();await page.waitForSelector('#admin-posts');await page.locator('#new-post').click();await page.locator('[name="title"]').fill('자동 검증용 게시물');await page.locator('[name="slug"]').fill('smoke-test-content');await page.locator('[name="body"]').fill('## 테스트 제목\n\n<script>alert(1)</script>');await page.locator('#post-editor button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#editor-message').textContent.includes('저장'));
 const p=await context.request.get(base+'/api/admin/posts');const test=(await p.json()).posts.find(x=>x.slug==='smoke-test-content');assert.ok(test)
 assert.equal((await context.request.get(base+'/blog/smoke-test-content')).status(),404,'draft must be private')
 await page.locator('#preview-post').click();await page.waitForSelector('#editor-preview:not([hidden])');assert.equal(await page.locator('#editor-preview script').count(),0,'stored XSS must be escaped')
 const upload=await context.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/webp'},data:fs.readFileSync('public/static/images/space-3.webp')});assert.equal(upload.status(),200);const media=(await upload.json()).url
 assert.equal((await context.request.get(base+media)).status(),200)
 const anon=await browser.newContext();assert.equal((await anon.request.get(base+media)).status(),404,'unpublished media must be private');await anon.close()
 const save=await context.request.post(base+'/api/admin/posts',{headers:{Origin:base},data:{...test,status:'published',body:'## 公開 test\n\n![clinic]('+media+')'}});assert.equal(save.status(),200)
 assert.equal((await context.request.get(base+'/blog/smoke-test-content')).status(),200)
 const del=await context.request.delete(base+'/api/admin/posts/'+test.id,{headers:{Origin:base}});assert.equal(del.status(),200)
 const invalidUpload=await context.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/png'},data:Buffer.from('<svg onload="alert(1)"></svg>')});assert.equal(invalidUpload.status(),400)
 await context.request.post(base+'/api/admin/logout',{headers:{Origin:base}});assert.equal((await context.request.get(base+'/api/admin/posts')).status(),401)
 for(const width of [390,768,1024]){await page.setViewportSize({width,height:844});await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'overflow at '+width);if(width===390){await loadImages();await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});await page.locator('.menu-toggle').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').isVisible(),false);await page.goto(base+'/directions');await page.locator('[data-branch="gwangmyeong"]').click();assert.equal(await page.locator('.mobile-bottom .branch-phone').getAttribute('href'),'tel:0260132828')}}
 await page.setViewportSize({width:1440,height:1000});await page.goto(base,{waitUntil:'networkidle'});await loadImages();await page.screenshot({path:'test-results/home-full.png',fullPage:true});assert.deepEqual(errors,[])
 console.log('PASS: responsive layouts, search, filters, branch selection, FAQ, symptom flow, glossary, secure admin login, CRUD, draft protection, XSS escaping, R2 upload and media authorization. No browser errors.')
}finally{await browser.close()}
