import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const base=process.env.TEST_URL||'http://localhost:3000'
const bundled=await build({stdin:{contents:"export * from './src/content';export * from './src/channels'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false})
const lib=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const one=lib.assemble(),two=lib.assemble();one.doctors[0].name='changed';assert.equal(two.doctors[0].name,'강도욱','snapshots must be isolated')
assert.throws(()=>lib.parseFeed('<!DOCTYPE root><rss/>','naver'))
assert.throws(()=>lib.parseFeed('<!ENTITY x SYSTEM "file:///etc/passwd">','naver'))
const rss=lib.parseFeed('<rss><channel><item><title><![CDATA[새 글 <script>unsafe</script>]]></title><link>https://blog.naver.com/thegoodmorningdent/123</link><pubDate>2026-10-06</pubDate></item><item><title>bad</title><link>javascript:alert(1)</link></item></channel></rss>','naver')
assert.equal(rss.length,1);assert.doesNotMatch(rss[0].title,/<script>/)
assert.equal(lib.feedUrl({...lib.initialChannels[0],feedId:'../evil?x'}),null)
const atom=lib.parseFeed('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>영상</title><link rel="alternate" href="https://www.youtube.com/watch?v=Ljh4gLCFs6Y"/><published>2026-10-06</published></entry></feed>','youtube');assert.equal(atom.length,1)
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),anon=await browser.newContext({reducedMotion:'reduce'})
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
const request=async(path,method='GET',data)=>context.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data?{data}:{})})
const entries=async()=>{const r=await request('content');assert.equal(r.status(),200);return (await r.json()).entries}
const entry=async(kind,key)=>(await entries()).find(e=>e.kind===kind&&e.key===key)
const pending=new Set()
const save=async(kind,key,value,action='draft',revision=0,status=200)=>{const r=await request(`content/${kind}/${key}`,'POST',{value,action,revision});assert.equal(r.status(),status,await r.text());if(status===200)pending.add(kind+'/'+key);return r.json()}
const remove=async(kind,key)=>{const e=await entry(kind,key);if(e?.revision){const r=await request(`content/${kind}/${key}?revision=${e.revision}`,'DELETE');assert.equal(r.status(),200,await r.text())}pending.delete(kind+'/'+key)}
try{
 assert.equal((await anon.request.get(base+'/api/admin/content')).status(),401)
 assert.equal((await anon.request.get(base+'/api/admin/history/operation/fees-0324-review')).status(),401)
 const password=fs.readFileSync('.dev.vars','utf8').match(/ADMIN_PASSWORD="([^"]+)"/)[1]
 assert.equal((await request('login','POST',{password})).status(),200)
 let all=await entries();assert.ok(all.length>=116)
 const fee=all.find(e=>e.key==='fees-0324-review');assert.equal(fee.live,null);assert.equal(fee.draft.items.length,32)
 await save('operation',fee.key,fee.draft,'publish',fee.revision,400)
 assert.doesNotMatch(await (await anon.request.get(base+'/pricing')).text(),/보증 4년|80만원/)
 const unauthorized=await context.request.post(base+'/api/admin/content/faq/test-origin',{headers:{Origin:'https://evil.example'},data:{}});assert.equal(unauthorized.status(),403)
 const doc=structuredClone(all.find(e=>e.kind==='doctor').draft);doc.slug='studio-test-doctor';doc.name='검증원장 <script>window.pwned=1</script>';doc.role='일반의';doc.doubleBoard=false;doc.bio=['원본 약력 검증'];doc.areas=['sedation']
 await save('doctor',doc.slug,doc)
 assert.equal((await anon.request.get(base+'/doctors/'+doc.slug)).status(),404)
 const uploaded=await context.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/webp'},data:fs.readFileSync('public/static/images/space-3.webp')});assert.equal(uploaded.status(),200);const media=(await uploaded.json()).url;doc.image=media
 await save('doctor',doc.slug,doc,'draft',1)
 assert.equal((await anon.request.get(base+media)).status(),404)
 await save('doctor',doc.slug,doc,'publish',2)
 let html=await (await anon.request.get(base+'/doctors/'+doc.slug)).text();assert.match(html,/검증원장 &lt;script&gt;/);assert.doesNotMatch(html,/<script>window.pwned/)
 assert.equal((await anon.request.get(base+media)).status(),200)
 assert.match(await (await anon.request.get(base+'/sitemap.xml')).text(),/studio-test-doctor/)
 assert.ok((await (await anon.request.get(base+'/api/search?q='+encodeURIComponent('검증원장'))).json()).results.length)
 const draftDoc={...doc,name:'아직 공개하면 안 되는 이름'};await save('doctor',doc.slug,draftDoc,'draft',3)
 assert.doesNotMatch(await (await anon.request.get(base+'/doctors/'+doc.slug)).text(),/아직 공개하면 안 되는 이름/)
 await save('doctor',doc.slug,draftDoc,'draft',3,409)
 const history=await (await request('history/doctor/'+doc.slug)).json();assert.deepEqual(history.history.slice(0,4).map(h=>h.action),['draft','publish','draft','draft'])
 const t=structuredClone(all.find(e=>e.kind==='treatment').draft);t.slug='studio-test-treatment';t.name='검증진료 <img src=x onerror=alert(1)>';t.doctor=doc.slug;t.related=['sedation'];t.faq=[['검증 질문','검증 답변 <script>bad</script>']]
 await save('treatment',t.slug,t,'publish')
 assert.equal((await anon.request.get(base+'/treatments/'+t.slug)).status(),200)
 assert.match(await (await anon.request.get(base+'/sitemap.xml')).text(),/studio-test-treatment/)
 html=await (await anon.request.get(base+'/faq')).text();assert.match(html,/검증 질문/);assert.match(html,/검증 답변 &lt;script&gt;/)
 const deleteReferenced=await request(`content/doctor/${doc.slug}?revision=4`,'DELETE');assert.equal(deleteReferenced.status(),409)
 const badT={...t,slug:'studio-test-invalid',doctor:'not-a-real-doctor'};await save('treatment',badT.slug,badT,'publish',0,400)
 await save('doctor','studio-test-url',{...doc,slug:'studio-test-url',image:'https://evil.example/image'},'publish',0,400)
 await save('channel','studio-test-channel',{...lib.initialChannels[0],key:'studio-test-channel',url:'https://evil.example',feedId:'../../internal'},'publish',0,400)
 // Existing FAQ shrink must never crash the homepage's selected excerpts.
 const revision=await entry('treatment','implant-revision');await save('treatment',revision.key,{...revision.draft,faq:[['한 가지 질문','새 답변']]},'publish',revision.revision)
 assert.equal((await anon.request.get(base+'/')).status(),200);await remove('treatment',revision.key)
 // Draft preview must not mutate public request state, even with overlapping requests.
 const previewDoc={...doc,name:'PREVIEW ONLY'}
 const replies=await Promise.all([request('content-preview/doctor/'+doc.slug,'POST',{value:previewDoc}),anon.request.get(base+'/doctors/'+doc.slug),anon.request.get(base+'/doctors/'+doc.slug)])
 assert.equal(replies[0].status(),200);for(const r of replies.slice(1))assert.doesNotMatch(await r.text(),/PREVIEW ONLY/)
 const section={key:'custom-studio-test',title:'추가 섹션 <script>x</script>',body:'공개 검증 문단',enabled:true,order:1}
 await save('section',section.key,section,'draft');assert.doesNotMatch(await (await anon.request.get(base+'/')).text(),/공개 검증 문단/)
 await save('section',section.key,section,'publish',1);html=await (await anon.request.get(base+'/')).text();assert.match(html,/id="custom-studio-test"/);assert.match(html,/추가 섹션 &lt;script&gt;/)
 const native=await entry('section','care-priorities');await save('section',native.key,{...native.draft,title:'바꾼 핵심 진료 제목',body:'병원 승인 안내 문구'},'publish',native.revision)
 html=await (await anon.request.get(base+'/')).text();assert.match(html,/바꾼 핵심 진료 제목/);assert.match(html,/병원 승인 안내 문구/);await remove('section',native.key)
 const faq={key:'studio-test-faq',question:'검증 일반 FAQ',answer:'검증 일반 답변',order:100};await save('faq',faq.key,faq,'publish');html=await (await anon.request.get(base+'/faq')).text();assert.match(html,/검증 일반 FAQ/)
 const video={key:'studio-test-video',id:'abcdefghijk',title:'추가 영상 검증',category:'안내',image:'space-37',order:100};await save('video',video.key,video,'publish');assert.match(await (await anon.request.get(base+'/video')).text(),/추가 영상 검증/)
 const op={...lib.templates.operation,key:'studio-test-pricing',category:'pricing',title:'검증 수가표',body:'테스트용 · 실제 수가 아님',items:[{name:'검증 항목',amount:'123원',unit:'테스트',note:'실제 아님'}],verified:true,source:'자동 검증 테스트',effectiveDate:'2026-10-06'};await save('operation',op.key,op,'publish');assert.match(await (await anon.request.get(base+'/pricing')).text(),/123원/)
 // Browser tests: branch-linked calls/actions, index+query intersection and form editing.
 await page.goto(base+'/',{waitUntil:'networkidle'});await page.locator('#header-branch-select').selectOption('gwangmyeong');assert.match(await page.locator('.header-phone').getAttribute('href'),/0260132828/);assert.match(await page.locator('.mobile-bottom .branch-kakao').getAttribute('href'),/_XGQYn/);assert.match(await page.locator('.mobile-bottom .branch-booking').getAttribute('href'),/1551337/)
 await page.goto(base+'/encyclopedia');await page.locator('[data-initial="ㅊ"]').click();await page.locator('#glossary-search').fill('차폐막');assert.equal(await page.locator('.term-card:visible').count(),1);await page.locator('[data-initial="ㄱ"]').click();assert.deepEqual(await page.locator('.term-card:visible').evaluateAll(es=>es.map(e=>e.dataset.term)),['골유도재생술'])
 await page.goto(base+'/admin');await page.locator('[data-kind="doctor"]').waitFor();await page.locator('[data-kind="doctor"]').click();await page.locator('[data-studio-edit="kang-dowook"]').click();assert.equal(await page.locator('[data-field^="bio."]').count(),16);await page.locator('[data-field="text"]').fill('브라우저 초안 검증');
 const savePath='**/api/admin/content/doctor/kang-dowook';let releaseSave;const saveGate=new Promise(resolve=>releaseSave=resolve);
 await page.route(savePath,async route=>{await saveGate;await route.continue()});
 await page.locator('#studio-editor button[type="submit"]').click();
 try{
  assert.equal(await page.locator('[data-field="text"]').isDisabled(),true,'saving locks fields instead of discarding newer typing');
  await page.locator('[data-kind="section"]').click();
  assert.equal(await page.locator('[data-kind="doctor"]').getAttribute('aria-pressed'),'true','pending save cannot switch editor');
  assert.match(await page.locator('#studio-message').textContent(),/저장이 끝난 뒤/);
 }finally{releaseSave()}
 await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('초안으로 저장'));await page.unroute(savePath);pending.add('doctor/kang-dowook')
 assert.equal(await page.locator('[data-field="text"]').isDisabled(),false,'editing resumes after save')
 assert.doesNotMatch(await (await anon.request.get(base+'/doctors/kang-dowook')).text(),/브라우저 초안 검증/)
 await page.locator('#studio-preview').click();await page.locator('#studio-preview-panel').waitFor({state:'visible'});await page.frameLocator('#studio-preview-frame').getByText('브라우저 초안 검증',{exact:true}).waitFor();assert.equal(await page.frameLocator('#studio-preview-frame').locator('script').count(),0)
 await page.locator('#studio-close').click();await page.locator('[data-kind="operation"]').click();await page.locator('[data-studio-edit="fees-0324-review"]').click();assert.equal(await page.locator('[data-field$=".amount"]').count(),32)
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'CMS mobile overflow');await page.screenshot({path:'test-results/studio-fees-mobile.png'})
 await page.locator('#studio-close').click();await page.locator('[data-kind="section"]').click();await page.setViewportSize({width:1440,height:900});await page.locator('#content-studio').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/studio-sections-desktop.png'})
 const branch=await entry('branch','gwangmyeong');const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const changed={...branch.draft,phone:'02-6013-2829',exceptions:[{date,hours:'',note:'자동검증 임시휴진'}]};await save('branch',branch.key,changed,'publish',branch.revision)
 await page.goto(base+'/?branch=gwangmyeong');assert.match(await page.locator('#regular-hours-status').textContent(),/변경 일정 · 휴진/);assert.match(await page.locator('meta[name="description"]').getAttribute('content'),/02-6013-2829/);assert.equal(await page.locator('.header-phone').getAttribute('href'),'tel:0260132829');await remove('branch',branch.key)
 const refreshed=await request('channels/refresh','POST');assert.equal(refreshed.status(),200);const channels=(await refreshed.json()).channels;console.log('LIVE FEEDS:',channels.map(c=>({title:c.title,count:c.items.length,stale:c.stale})))
 assert.ok(channels.filter(c=>c.type!=='column').every(c=>c.items.length>0),'actual official feed refresh')
 await page.goto(base+'/column');assert.match(await page.locator('#main a[target="_blank"]').first().getAttribute('href'),/thegoodmorningdental.com\/blog\//)
 for(const width of [320,390,768,1024,1280,1440]){await page.setViewportSize({width,height:900});for(const path of ['/','/visiting','/column','/tour','/directions']){await page.goto(base+path);assert.equal(await page.locator('#header-branch-select').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' overflow '+width)}}
 assert.deepEqual(errors,[])
 console.log('PASS: request isolation, parser/SSRF guards, 44 private review drafts, 32 unpublished fees, full bios, CMS drafts/publish/CAS/history/preview, reference safety, XSS, R2 privacy, new routes/search/schema, sections, mobile editor, branch exceptions, official feeds and source column.')
}finally{
 // Delete dependants before their physician. Restore baseline overrides, keep review drafts.
 const order=[...pending].sort((a,b)=>(a.startsWith('treatment/')?-1:0)-(b.startsWith('treatment/')?-1:0))
 for(const path of order){try{const [kind,key]=path.split('/');await remove(kind,key)}catch(e){console.error('CLEANUP REQUIRED:',path,e.message)}}
 await browser.close()
}
