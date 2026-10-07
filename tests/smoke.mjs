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
 // Video IDs, safe thumbnail mapping and mobile usability must stay in sync.
 const videoIds=['Ljh4gLCFs6Y','xW7k824_a_o','DQdEDnEaN4c','59WYhK9pWe0','f3C458akJog','Q3w-rsppT_g'];
 for(const path of ['/','/video','/contents']){
  await page.goto(base+path);await loadImages();
  const mapping=await page.locator('.opening-film-play,.video-image').evaluateAll(buttons=>buttons.map(b=>({id:b.dataset.video,thumb:b.querySelector('[data-video-thumbnail]')?.dataset.videoThumbnail,src:b.querySelector('img')?.getAttribute('src')})));
  assert.ok(mapping.length>0);
  for(const card of mapping){assert.equal(card.thumb,card.id,path+' thumbnail must match playable video');if(card.src)assert.equal(card.src,'/static/images/video-'+card.id+'.webp')}
 }
 for(const id of videoIds.slice(0,4))assert.equal((await context.request.get(base+'/static/images/video-'+id+'.webp')).status(),404,'patient clinical thumbnail must not be public');
 for(const width of [320,360,390,430,600,601,760,768,844,1024,1440]){
  await page.setViewportSize({width,height:844});await page.goto(base);await loadImages();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile overflow '+width);
  const cards=await page.locator('.opening-film-card').evaluateAll(nodes=>nodes.map(n=>{const image=n.querySelector('.opening-film-play').getBoundingClientRect(),title=n.querySelector('h3 button').getBoundingClientRect(),link=n.querySelector('.opening-youtube-link').getBoundingClientRect();return {imageWidth:image.width,ratio:image.width/image.height,titleHeight:title.height,linkHeight:link.height,stacked:title.top>=image.bottom}}));
  for(const card of cards){assert.ok(Math.abs(card.ratio-16/9)<.04);assert.ok(card.titleHeight>=44);assert.ok(card.linkHeight>=44);if(width<=600){assert.ok(card.imageWidth>=width-45);assert.equal(card.stacked,true)}}
  if(width<=760){const rect=await page.locator('#regular-hours-status').boundingBox();assert.ok(rect.x+rect.width<=width);assert.ok((await page.locator('.menu-toggle').boundingBox()).width>=44)}
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/video');await loadImages();
 assert.equal(await page.locator('.video-card').count(),6);
 for(const id of videoIds){await page.locator(`.video-image[data-video="${id}"]`).click();assert.match(await page.locator('#video-container iframe').getAttribute('src'),new RegExp('/embed/'+id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\?'));await page.locator('#video-dialog .dialog-close').click();await page.locator('#video-container iframe').waitFor({state:'detached'});assert.equal(await page.locator('#video-container iframe').count(),0)}
 await page.locator('.menu-toggle').click();await page.locator('#mobile-search-open').click();await page.locator('#site-search').fill('수면');await page.waitForSelector('.search-result');assert.equal(await page.locator('#site-search').evaluate(e=>getComputedStyle(e).fontSize),'16px');await page.locator('#search-dialog .dialog-close').click();await page.locator('.menu-toggle').click();assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('locked')),false);
 await page.setViewportSize({width:1440,height:1000});
 console.log('PASS: six ID-matched video covers, clinical-photo exclusion, 11 responsive widths, 16:9 uncropped thumbnails, 44px controls, mobile search and all six player mappings.');
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
 for(const path of ['/.sources/proposal.txt','/.sources/clinic-original.mp4','/.dev.vars','/static/images/space-14.webp'])assert.equal((await context.request.get(base+path)).status(),404,'private source must not be public: '+path)
 await page.goto(base);assert.equal(await page.locator('.strength-card').count(),9);assert.equal(await page.locator('.specialty-card').count(),8);assert.equal(await page.locator('.physician-deck-card').count(),5)
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
 // Safari/iOS byte-range probes and seek requests must return real partial bytes.
 for(const filename of ['clinic-opening.mp4','clinic-opening-mobile.mp4']){
  const original=fs.readFileSync('public/static/video/'+filename),url=base+'/films/'+filename;
  for(const [range,start,end] of [['bytes=0-1',0,1],['bytes=100-199',100,199],['bytes=-16',original.length-16,original.length-1],['bytes=100-',100,original.length-1]]){
   const response=await context.request.get(url,{headers:{Range:range}});assert.equal(response.status(),206);assert.equal(response.headers()['accept-ranges'],'bytes');assert.equal(response.headers()['content-range'],`bytes ${start}-${end}/${original.length}`);assert.deepEqual(await response.body(),original.subarray(start,end+1));
  }
  const head=await context.request.head(url);assert.equal(Number(head.headers()['content-length']),original.length);
  const bad=await context.request.get(url,{headers:{Range:'bytes=99999999-'}});assert.equal(bad.status(),416);
  const ifRange=await context.request.get(url,{headers:{Range:'bytes=0-1','If-Range':'"outdated"'}});assert.equal(ifRange.status(),200);
 }
 assert.equal((await context.request.get(base+'/films/clinic-original.mp4')).status(),404);
 console.log('PASS: both films support byte-exact 206 ranges, HEAD, suffix/open ranges, 416 and If-Range.');
 // Original film: actual decoded playback, pause/resume, preference, and static fallbacks.
 const motionContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'})
 const motionPage=await motionContext.newPage();motionPage.on('pageerror',e=>errors.push(e.message))
 await motionPage.goto(base,{waitUntil:'networkidle'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 await motionPage.waitForFunction(()=>document.querySelector('#hero-clinic-film').readyState>=2&&!document.querySelector('#hero-clinic-film').paused)
 const filmTime=()=>motionPage.locator('#hero-clinic-film').evaluate(el=>el.currentTime)
 const before=await filmTime();await motionPage.waitForTimeout(350);assert.notEqual(await filmTime(),before,'actual film must advance')
 assert.equal(await motionPage.locator('#hero-clinic-film').evaluate(el=>el.muted&&el.loop&&el.playsInline),true)
 assert.ok(await motionPage.locator('h1 .kinetic-char').count()>10,'real split-glyph typography')
 const glyphMotion=await motionPage.locator('h1 .kinetic-char').last().evaluate(el=>{const a=el.getAnimations()[0];if(!a)return false;a.pause();a.currentTime=100;const start=getComputedStyle(el).transform;a.currentTime=2000;const end=getComputedStyle(el).transform;a.finish();return start!==end});assert.equal(glyphMotion,true,'glyph animation changes its transform')
 assert.equal(await motionPage.locator('h1').getAttribute('aria-label'),'환자의 불편함을 한 번 더 듣는 치과.')
 await motionPage.locator('#hero-motion-toggle').click()
 assert.equal(await motionPage.locator('#hero-motion-toggle').getAttribute('aria-pressed'),'true')
 await motionPage.waitForTimeout(80);const paused=await filmTime();await motionPage.waitForTimeout(300);assert.equal(await filmTime(),paused,'film freeze')
 assert.equal(await motionPage.locator('video').evaluate(el=>el.paused),true)
 assert.equal(await motionPage.locator('#hero-section').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'all hero motion paused')
 await motionPage.locator('#hero-motion-toggle').click();await motionPage.waitForTimeout(250);assert.notEqual(await filmTime(),paused,'film resume')
 await motionPage.locator('#why-goodmorning').scrollIntoViewIfNeeded()
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='suspended')
 assert.equal(await motionPage.locator('video').evaluate(el=>el.paused),true,'offscreen video paused')
 await motionPage.locator('#site-motion-toggle').click();assert.equal(await motionPage.locator('html').evaluate(el=>el.classList.contains('motion-off')),true)
 assert.equal(await motionPage.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'global off stops all motion')
 await motionPage.locator('#site-motion-toggle').click();assert.equal(await motionPage.locator('html').evaluate(el=>el.classList.contains('motion-enabled')),true)
 await motionPage.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 await motionPage.emulateMedia({reducedMotion:'reduce'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='reduced')
 assert.equal(await motionPage.locator('#hero-motion-toggle').isDisabled(),false,'explicit media playback must stay available')
 assert.equal(await motionPage.locator('#hero-section').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'reduced motion must be static')
 assert.equal(await motionPage.locator('.hero-frame-one').evaluate(el=>getComputedStyle(el).opacity),'1')
 await motionPage.emulateMedia({reducedMotion:'no-preference'})
 await motionPage.waitForFunction(()=>document.querySelector('#hero-section').dataset.motionState==='playing')
 for(const width of [320,390,768,1440]){
  await motionPage.setViewportSize({width,height:844});await motionPage.goto(base,{waitUntil:'networkidle'})
  await motionPage.waitForTimeout(3100)
  assert.equal(await motionPage.locator('video').evaluate(el=>new URL(el.currentSrc).pathname.endsWith(innerWidth<=760?'clinic-opening-mobile.mp4':'clinic-opening.mp4')),true,'responsive film source '+width)
  assert.equal(await motionPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'animated hero overflow '+width)
  const bounds=await motionPage.locator('.hero-title-line>span').evaluateAll(nodes=>nodes.map(n=>({scroll:n.scrollWidth,parent:n.parentElement.clientWidth})))
  assert.ok(bounds.every(x=>x.scroll<=x.parent+1),'headline clipping '+width)
  await motionPage.screenshot({path:`test-results/hero-motion-${width}.png`})
 }
 // Film-first hero: actual doctor footage, four caption-free selected segments and accessible original talks.
 assert.ok(await motionPage.locator('#hero-clinic-film').evaluate(el=>el.duration>=16&&el.duration<17),'four-segment 16-second film');
 assert.equal(await motionPage.locator('.film-chapters button').count(),4);
 await motionPage.locator('[data-film-chapter="3"]').click();
 await motionPage.waitForFunction(()=>document.querySelector('.film-counter').textContent==='04 / 04');
 assert.match(await motionPage.locator('#hero-film-caption').textContent(),/진료에 집중/);
 await motionPage.locator('#hero-motion-toggle').click();
 await motionPage.locator('[data-film-chapter="0"]').focus();await motionPage.keyboard.press('Enter');
 assert.equal(await motionPage.locator('#hero-section').getAttribute('data-film-chapter'),'0');
 assert.equal(await motionPage.locator('#hero-clinic-film').evaluate(el=>el.paused),true,'chapter selection respects pause');
 await motionPage.locator('#hero-motion-toggle').click();
 assert.equal(await motionPage.locator('.hero-clinic-film').evaluate(el=>getComputedStyle(el).filter),'none','footage is not darkened with a video filter');
 assert.ok(await motionPage.locator('h1').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)<=60),'headline no longer dominates film');
 assert.equal(await motionPage.locator('#hero-section').evaluate(el=>el.nextElementSibling.id),'care-priorities','four priority treatments immediately follow opening');
 assert.equal(await motionPage.locator('#opening-films .opening-film-card').count(),4);
 // Mock only the third-party iframe document: test our dialog wiring, not YouTube availability.
 await motionPage.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>External video player test</p>'}));
 await motionPage.locator('#opening-films .opening-film-play').first().click();
 assert.equal(await motionPage.locator('#video-dialog').isVisible(),true);
 assert.match(await motionPage.locator('#video-container iframe').getAttribute('src'),/Ljh4gLCFs6Y/);
 assert.equal(await motionPage.locator('#hero-clinic-film').evaluate(el=>el.paused),true,'background film stops for the selected talk');
 await motionPage.keyboard.press('Escape');await motionPage.locator('#video-dialog').waitFor({state:'hidden'});await motionPage.locator('#video-container iframe').waitFor({state:'detached'});assert.equal(await motionPage.locator('#video-container iframe').count(),0);
 console.log('PASS: video-first composition, 16-second doctor opening, four scene controls, four priority-treatment talks and dialog cleanup.');
 await motionPage.locator('#philosophy').scrollIntoViewIfNeeded();await motionPage.waitForTimeout(1800)
 assert.equal(await motionPage.locator('.philosophy-manifesto').evaluate(el=>el.classList.contains('type-visible')),true)
 await motionPage.screenshot({path:'test-results/editorial-philosophy-final.png'})
 await motionPage.goto(base+'/treatments/implant-front');await motionPage.waitForTimeout(1800)
 assert.ok(await motionPage.locator('h1 .kinetic-char').count()>0,'inner page typography')
 assert.equal(await motionPage.locator('h1').getAttribute('aria-label')!==null,true)
 await motionPage.locator('.site-header .brand').click();await motionPage.waitForURL(base+'/')
 assert.equal(await motionPage.locator('#hero-clinic-film').count(),1,'native navigation remains functional')
 // Four distinct story exhibits: typing, schematic, orbit and visit sequence.
 assert.equal(await motionPage.locator('[data-story-mode]').count(),4)
 const talk=motionPage.locator('#question-story');await talk.scrollIntoViewIfNeeded();await talk.locator('[data-story-replay]').click()
 await motionPage.waitForFunction(()=>document.querySelector('#question-story').dataset.storyState==='playing')
 await motionPage.waitForTimeout(900);const typed=await talk.locator('.is-active .typing-question').textContent();await motionPage.waitForTimeout(450);assert.notEqual(await talk.locator('.is-active .typing-question').textContent(),typed,'question actually types')
 await talk.locator('[data-story-pause]').click();const frozen=await talk.getAttribute('data-story-elapsed');await motionPage.waitForTimeout(250);assert.equal(await talk.getAttribute('data-story-elapsed'),frozen,'local pause freezes story clock')
 await talk.locator('[data-story-pause]').click();await motionPage.waitForTimeout(150);assert.notEqual(await talk.getAttribute('data-story-elapsed'),frozen,'local resume')
 await motionPage.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await motionPage.waitForFunction(()=>document.querySelector('#question-story').dataset.storyState==='suspended');const outside=await talk.getAttribute('data-story-elapsed');await motionPage.waitForTimeout(250);assert.equal(await talk.getAttribute('data-story-elapsed'),outside,'offscreen typing pauses')
 await talk.scrollIntoViewIfNeeded();await talk.locator('[data-story-select="1"]').click();await motionPage.waitForFunction(()=>document.querySelector('#question-story').dataset.storyState==='complete',null,{timeout:15000});assert.match(await talk.locator('.is-active .typing-question').textContent(),/앞니 임플란트/)
 const transcript=await talk.locator('.is-active .typing-answer').textContent();assert.equal(transcript,await talk.locator('.is-active .clinic-response .story-sr-only').textContent(),'visible answer matches accessible complete transcript')
 for(const id of ['revision-story','sedation-sequence','visit-story']){
  const scene=motionPage.locator('#'+id);await scene.scrollIntoViewIfNeeded();await scene.locator('[data-story-replay]').click();await motionPage.waitForFunction(id=>document.getElementById(id).dataset.storyActive==='1',id,{timeout:7000});
  assert.equal(await scene.locator('.story-panel:visible').count(),1,id+' single visible step');await scene.locator('[data-story-select="0"]').click();await motionPage.keyboard.press('End');const last=await scene.locator('[data-story-select]').count()-1;assert.equal(await scene.getAttribute('data-story-active'),String(last),'keyboard selects final step');assert.equal(await scene.getAttribute('data-story-state'),'complete','manual selection stops auto advance');
 }
 await motionPage.locator('#site-motion-toggle').click();assert.equal(await motionPage.locator('[data-story-state="static"]').count(),4,'global off applies to all exhibits');await talk.locator('[data-story-select="3"]').click();assert.ok((await talk.locator('.is-active .typing-answer').textContent()).length>60,'static mode still allows complete Q&A browsing');await motionPage.locator('#site-motion-toggle').click()
 for(const width of [320,390,768,1440]){await motionPage.setViewportSize({width,height:844});for(const id of ['question-story','revision-story','sedation-sequence','visit-story']){const scene=motionPage.locator('#'+id);await scene.scrollIntoViewIfNeeded();await scene.locator('[data-story-select]').last().click();assert.equal(await motionPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,id+' selected-step overflow '+width)}}
 console.log('PASS: four story exhibits, real typing, source transcript parity, pause/resume, offscreen suspension, automatic steps, keyboard/manual selection, global static mode and responsive selected states.')
 // Additional studies: actual scroll assembly, swipable physician deck, glossary wipe.
 await motionPage.setViewportSize({width:1440,height:1000})
 const assembly=motionPage.locator('#preservation-assembly');
 for(const index of [0,3]){await motionPage.locator(`[data-assembly-note="${index}"]`).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.4,behavior:'instant'}));await motionPage.waitForTimeout(120);assert.ok(Math.abs(Number(await assembly.getAttribute('data-assembly-value'))-(index+1))<.03,'scroll assembles layer '+index)}
 await motionPage.locator('#assembly-range').focus();await motionPage.keyboard.press('Home');assert.equal(await assembly.getAttribute('data-assembly-mode'),'manual');assert.equal(await assembly.getAttribute('data-assembly-stage'),'0');await motionPage.keyboard.press('End');assert.equal(await assembly.getAttribute('data-assembly-stage'),'3')
 const deck=motionPage.locator('#physician-deck');await deck.locator('.physician-deck-viewport').scrollIntoViewIfNeeded();await deck.locator('[data-deck-next]').click();assert.equal(await deck.getAttribute('data-deck-active'),'1');assert.equal(await deck.locator('[aria-hidden="true"] a:not([tabindex="-1"])').count(),0,'inactive physician links excluded from tab order')
 await deck.locator('.physician-deck-viewport').focus();await motionPage.keyboard.press('End');assert.equal(await deck.getAttribute('data-deck-active'),'4');await motionPage.keyboard.press('Home');assert.equal(await deck.getAttribute('data-deck-active'),'0')
 await deck.locator('.physician-deck-card.is-active .physician-deck-portrait').scrollIntoViewIfNeeded();const drag=await deck.locator('.physician-deck-card.is-active .physician-deck-portrait').boundingBox();await motionPage.mouse.move(drag.x+drag.width*.75,drag.y+drag.height*.5);await motionPage.mouse.down();await motionPage.mouse.move(drag.x+drag.width*.25,drag.y+drag.height*.5,{steps:10});await motionPage.mouse.up();assert.equal(await deck.getAttribute('data-deck-active'),'1','real drag changes physician')
 await deck.locator('[data-deck-select="4"]').click();await deck.locator('.physician-deck-card.is-active a').click();await motionPage.waitForURL(base+'/doctors/shin-hyunsook');await motionPage.goto(base)
 const language=motionPage.locator('#language-reveal');await language.scrollIntoViewIfNeeded();await language.locator('#language-replay').click();await motionPage.waitForTimeout(180);const revealBefore=Number(await language.getAttribute('data-reveal-value'));await motionPage.waitForTimeout(200);assert.ok(Number(await language.getAttribute('data-reveal-value'))>revealBefore,'wipe animates')
 await language.locator('#language-range').focus();await motionPage.keyboard.press('Home');assert.equal(await language.getAttribute('data-reveal-value'),'0');await motionPage.keyboard.press('End');assert.equal(await language.getAttribute('data-reveal-value'),'100');await language.locator('[data-term-select="3"]').click();assert.equal(await language.getAttribute('data-term-active'),'3');assert.match(await language.locator('[data-term-panel="3"] .language-definition').textContent(),/임플란트 본체와 보철물을 연결하는 부품/)
 await motionPage.locator('#site-motion-toggle').click();await motionPage.waitForFunction(()=>document.querySelector('#preservation-assembly').dataset.assemblyMode==='static');assert.equal(await deck.evaluate(el=>el.classList.contains('deck-enhanced')),false);assert.equal(await deck.locator('.physician-deck-card[aria-hidden="true"]').count(),0,'static grid exposes all doctors');assert.equal(await language.getAttribute('data-reveal-state'),'idle');await motionPage.locator('#site-motion-toggle').click()
 for(const width of [320,390,768,1440]){await motionPage.setViewportSize({width,height:844});await deck.locator('[data-deck-select="3"]').click();await language.locator('[data-term-select="2"]').click();assert.equal(await motionPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'new studies overflow '+width)}
 console.log('PASS: scroll layer assembly, native range keyboard controls, physician drag/keyboard/profile links, language wipe, glossary source text and static fallbacks.')
 await motionContext.close()
 const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}})
 const staticPage=await staticContext.newPage();await staticPage.goto(base)
 assert.equal(await staticPage.locator('.hero-title-line').count(),2);assert.equal(await staticPage.locator('.hero-frame-one').evaluate(el=>getComputedStyle(el).opacity),'1')
 assert.equal(await staticPage.locator('.hero-actions .btn').getAttribute('href'),'#opening-films');assert.equal(await staticPage.locator('.hero-actions a[href="/reservation"]').count(),1);assert.equal(await staticPage.locator('#opening-films a[href^="https://www.youtube.com/watch"]').count(),4)
 assert.equal(await staticPage.locator('#hero-motion-toggle').isVisible(),false)
 assert.equal(await staticPage.locator('[data-story-panel]:visible').count(),15,'no-JS preserves all story content');assert.equal(await staticPage.locator('.story-selectors:visible').count(),0,'no-JS hides inactive controls')
 assert.equal(await staticPage.locator('.physician-deck-card:visible').count(),5);assert.equal(await staticPage.locator('.language-panel:visible').count(),4);assert.equal(await staticPage.locator('.assembly-note:visible').count(),4);assert.equal(await staticPage.locator('.assembly-controls:visible,.language-range-controls:visible,.physician-deck-controls:visible').count(),0)
 await staticContext.close()
 assert.equal(await page.locator('#hero-clinic-film').count(),0) // page currently on a treatment route
 // Regression: preferences must not disable explicit media playback or hide a playing video.
 for(const mode of ['reduced','saved-off','save-data','autoplay-blocked']){
  const recovery=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  if(mode==='saved-off')await recovery.addInitScript(()=>sessionStorage.setItem('gm_motion','off'));
  if(mode==='save-data')await recovery.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,addEventListener(){}}}));
  if(mode==='autoplay-blocked')await recovery.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;window.testPlayCalls=0;HTMLMediaElement.prototype.play=function(){window.testPlayCalls++;return navigator.userActivation.isActive?play.call(this):Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'))}});
  const rp=await recovery.newPage();rp.on('pageerror',e=>errors.push(e.message));await rp.goto(base,{waitUntil:'domcontentloaded'});
  await rp.locator('#hero-play-button').waitFor({state:'visible'});
  if(mode!=='autoplay-blocked')assert.equal(await rp.locator('video').getAttribute('src'),null,mode+' does not auto-download');
  else {await rp.waitForFunction(()=>document.querySelector('#hero-section').dataset.playbackReason==='autoplay');const count=await rp.evaluate(()=>window.testPlayCalls);await rp.waitForTimeout(300);assert.equal(await rp.evaluate(()=>window.testPlayCalls),count,'no autoplay retry loop')}
  const visibleBounds=await rp.locator('#hero-play-button').boundingBox();assert.ok(visibleBounds.y>75&&visibleBounds.y+visibleBounds.height<600,mode+' play button stays in first viewport');
  assert.equal(await rp.locator('#hero-motion-toggle').isDisabled(),false);
  if(mode==='reduced')await rp.screenshot({path:'test-results/film-recovery-mobile.png'});
  await rp.locator('#hero-play-button').tap();
  await rp.waitForFunction(()=>{const v=document.querySelector('video');return !v.paused&&v.currentTime>.2&&getComputedStyle(v).opacity==='1'});
  assert.equal(await rp.locator('#hero-playback-prompt').isVisible(),false,mode+' prompt clears after real playback');
  if(mode!=='autoplay-blocked')assert.equal(await rp.locator('html').evaluate(el=>el.classList.contains('motion-off')),true,'decorative motion remains off');
  const time=await rp.locator('video').evaluate(v=>v.currentTime);await rp.waitForTimeout(250);assert.ok(await rp.locator('video').evaluate(v=>v.currentTime)>time,mode+' frames advance');
  await rp.locator('#hero-motion-toggle').click();await rp.waitForTimeout(80);assert.equal(await rp.locator('video').evaluate(v=>v.paused),true);
  await recovery.close();
 }
 const failed=await browser.newContext();let abortFilm=true;await failed.route('**/films/**',route=>abortFilm?route.abort():route.continue());const fp=await failed.newPage();await fp.goto(base,{waitUntil:'domcontentloaded'});await fp.waitForFunction(()=>document.querySelector('#hero-section').dataset.filmState==='poster');assert.equal(await fp.locator('.hero-frame-one img').evaluate(el=>el.complete&&el.naturalWidth>0),true);assert.equal(await fp.locator('#hero-play-button').isVisible(),true);assert.match(await fp.locator('#hero-playback-status').textContent(),/불러오지 못했습니다/);abortFilm=false;await fp.locator('#hero-play-button').click();await fp.waitForFunction(()=>{const v=document.querySelector('video');return !v.paused&&v.currentTime>.2});await failed.close();
 console.log('PASS: mobile tap playback with reduced-motion, saved OFF, Save-Data, blocked autoplay, visible video opacity and failed-network recovery.');
 console.log('PASS: original MP4 playback, responsive source, frame seeking, pause/resume, global motion toggle, split typography, offscreen suspension, reduced-motion/Save-Data/no-JS/network-failure fallbacks, and navigation.')
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
