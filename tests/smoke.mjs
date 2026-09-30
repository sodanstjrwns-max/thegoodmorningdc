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
