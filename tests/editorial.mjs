import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const base=process.env.TEST_URL||'http://localhost:3000'
assert.equal(base,'http://localhost:3000','Synthetic publishing QA must only run locally')
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']}),admin=await browser.newContext(),anon=await browser.newContext({reducedMotion:'reduce'}),page=await admin.newPage(),reader=await anon.newPage(),errors=[],keys=[]
page.on('pageerror',e=>errors.push(e.message));reader.on('pageerror',e=>errors.push(e.message))
const api=(path,method='GET',data)=>admin.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data?{data}:{})})
const records=async()=>(await(await api('content')).json()).entries
const row=async(kind,key)=>(await records()).find(r=>r.kind===kind&&r.key===key)
const save=async(kind,key,value,action='draft',status=200)=>{const current=await row(kind,key),r=await api(`content/${kind}/${key}`,'POST',{action,value,revision:current?.revision||0});assert.equal(r.status(),status,await r.text());if(r.status()===200&&!keys.some(([k,id])=>k===kind&&id===key))keys.push([kind,key]);return r.status()===200?r.json():null}
try{
 const password=fs.readFileSync('.dev.vars','utf8').match(/ADMIN_PASSWORD="([^"]+)"/)[1];assert.equal((await api('login','POST',{password})).status(),200)
 const templates=(await(await api('content')).json()).templates
 const raw='## 중요한 질문\n\n**굵게** 그리고 *강조*와 [관련 진료](/treatments/sedation).\n\n| 항목 | 안내 |\n| --- | --- |\n| 검사 | 확인 필요 |\n\n> 개인별 평가가 필요합니다.\n\n- 첫 번째\n- 두 번째\n\n<script>alert(123)</script>\n\n[위험](javascript:alert(1))'
 const item={...templates.column,key:'qa-editorial-main',title:'QA LOCAL ONLY 칼럼 테스트',summary:'QA 핵심 안내입니다. 환자나 실제 임상 사례가 아닙니다.',body:raw,category:'prevention',author:'kang-dowook',medicalReviewed:true,reviewedOn:'2026-10-08',seoTitle:'QA 검색 제목',seoDescription:'QA 검색 설명',faq:[['어떤 내용을 확인하나요?','QA 검증을 위한 답변입니다.']],references:[{label:'공식 안내',url:'https://thegoodmorningdental.com/'}],coverImage:'/static/images/space-3.webp',coverAlt:'치과 입구 (QA)',publishedAt:'2000-01-01T00:00:00Z',modifiedAt:'2000-01-01T00:00:00Z'}
 await save('column',item.key,item);assert.equal((await anon.request.get(base+'/column/'+item.key)).status(),404)
 await save('column',item.key,{...item,medicalReviewed:false},'publish',400)
 await save('column',item.key,{...item,coverAlt:''},'publish',400)
 const published=await save('column',item.key,item,'publish');assert.notEqual(published.value.publishedAt,item.publishedAt)
 await save('column',item.key,{...item,title:'PRIVATE DRAFT TITLE'});let html=await(await anon.request.get(base+'/column/'+item.key)).text();assert.doesNotMatch(html,/PRIVATE DRAFT TITLE/);assert.match(html,/QA 검색 제목/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>alert|href="javascript:/)
 await reader.goto(base+'/column/'+item.key);assert.equal(await reader.locator('h1').count(),1);assert.equal(await reader.locator('.editorial-table tbody tr').count(),1);assert.equal(await reader.locator('.editorial-prose strong').innerText(),'굵게');assert.ok(await reader.locator('.article-toc a[href="#section-1"]').count());assert.equal(await reader.locator('.editorial-prose script').count(),0)
 const schemas=await reader.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent)),article=schemas.find(s=>s['@type']==='Article');assert.equal(article.headline,item.title);assert.equal(article.datePublished,published.value.publishedAt);assert.equal(article.dateModified,published.value.modifiedAt);assert.equal(schemas.find(s=>s['@type']==='FAQPage').mainEntity.length,1)
 await reader.locator('[data-reader-size]').click();assert.equal(await reader.locator('[data-reader-size]').getAttribute('aria-pressed'),'true')
 for(const width of [320,390,600,768,1024,1440]){await reader.setViewportSize({width,height:900});assert.ok(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'article '+width)}
 assert.match(await(await anon.request.get(base+'/sitemap.xml')).text(),new RegExp('/column/'+item.key));assert.doesNotMatch(await(await anon.request.get(base+'/sitemap-languages.xml')).text(),new RegExp(item.key))
 assert.equal((await anon.request.get(base+'/en/column/'+item.key,{maxRedirects:0})).status(),302)
 const search=await(await anon.request.get(base+'/api/search?q=QA')).json();assert.ok(search.results.some(r=>r.url==='/column/'+item.key))
 for(let i=0;i<10;i++)await save('column','qa-paging-'+i,{...item,key:'qa-paging-'+i,title:'QA 게시물 '+i,category:i%2?'implant':'prevention',body:'검증용 본문입니다.'},'publish')
 await reader.goto(base+'/column?source=native&page=2');assert.equal(await reader.locator('.editorial-card').count(),2);assert.equal(await reader.locator('link[rel="canonical"]').getAttribute('href'),base+'/column?page=2');assert.equal((await anon.request.get(base+'/column?page=999')).status(),404)
 await reader.goto(base+'/en/column?page=2');assert.equal(await reader.locator('link[rel="canonical"]').getAttribute('href'),base+'/en/column?page=2')
 await reader.goto(base+'/column?category=implant');assert.equal(await reader.locator('.editorial-card').count(),5);assert.match(await reader.locator('meta[name="robots"]').getAttribute('content'),/noindex/)
 for(const width of [320,390,768,1440]){await reader.setViewportSize({width,height:900});assert.ok(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'board '+width)}
 // A real rich-text editor session: Markdown ↔ table, manual draft and server autosave.
 await page.goto(base+'/admin');await page.locator('[data-kind="column"]').click();await page.locator('#studio-new').click();await page.locator('[data-field="key"]').fill('qa-editorial-ui');await page.locator('[data-field="title"]').fill('QA 편집기 검증');await page.locator('[data-field="summary"]').fill('QA 편집기 검증용 요약')
 await page.locator('.rich-toolbar button').filter({hasText:'마크다운 보기'}).click();await page.locator('[data-field="body"]').fill('## 편집기 제목\n\n| 항목 | 설명 |\n| --- | --- |\n| A | B |\n\n본문 작성');await page.locator('.rich-toolbar button').filter({hasText:'마크다운 보기'}).click();assert.equal(await page.locator('.tiptap table').count(),1)
 await page.locator('#studio-editor button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('비공개 초안으로 저장'));keys.push(['column','qa-editorial-ui']);let ui=await row('column','qa-editorial-ui');assert.match(ui.draft.body,/\|/);assert.equal(ui.live,null)
 await page.locator('#studio-autosave').check();await page.locator('[data-field="summary"]').fill('서버 자동 저장 검증');await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('자동 저장 완료'),null,{timeout:15000});ui=await row('column','qa-editorial-ui');assert.equal(ui.draft.summary,'서버 자동 저장 검증');assert.equal(ui.live,null)
 await page.locator('#studio-autosave').uncheck();
 const synthetic=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=2400;c.height=1600;c.getContext('2d').fillRect(0,0,2400,1600);return c.toDataURL('image/png').split(',')[1]});
 await page.locator('.rich-composer>input[type="file"]').setInputFiles({name:'qa-synthetic.png',mimeType:'image/png',buffer:Buffer.from(synthetic,'base64')});await page.locator('.rich-link-dialog[open] [name="label"]').fill('QA 비임상 이미지');await page.locator('.rich-link-dialog[open] button[value="apply"]').click();await page.waitForSelector('.tiptap img');
 assert.equal((await row('column','qa-editorial-ui')).revision,ui.revision,'Image dialog must not accidentally submit the parent editor');const embedded=await page.locator('.tiptap img').getAttribute('src');assert.equal((await anon.request.get(base+embedded)).status(),404);await page.waitForFunction(()=>document.querySelector('.tiptap img')?.naturalWidth===1600)
 await page.locator('#studio-editor button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('비공개 초안으로 저장'));
 await page.route('**/api/admin/content/column/qa-editorial-ui',r=>r.abort());await page.locator('#studio-autosave').check();await page.locator('[data-field="summary"]').fill('네트워크 실패 시 보존할 원고');await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('자동 저장을 중지'),null,{timeout:15000});assert.equal(await page.locator('#studio-autosave').isChecked(),false);assert.equal(await page.locator('[data-field="summary"]').inputValue(),'네트워크 실패 시 보존할 원고');await page.unroute('**/api/admin/content/column/qa-editorial-ui');await page.locator('#studio-editor button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#studio-message').textContent.includes('비공개 초안으로 저장'));
 await page.locator('#studio-preview').click();await page.waitForFunction(()=>!document.querySelector('#studio-preview-panel').hidden)
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'editor '+width)}
 await page.setViewportSize({width:1440,height:1000});await page.locator('.rich-composer').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/editorial-editor-desktop.png'})
 await reader.setViewportSize({width:390,height:844});await reader.goto(base+'/column/'+item.key);await reader.screenshot({path:'test-results/editorial-article-mobile.png',fullPage:true})
 await reader.setViewportSize({width:1440,height:1000});await reader.goto(base+'/column');await reader.screenshot({path:'test-results/editorial-board-desktop.png',fullPage:true})
 // Shared media is public only while an approved editorial reference exists.
 const upload=await admin.request.post(base+'/api/admin/upload',{headers:{Origin:base,'Content-Type':'image/webp'},data:fs.readFileSync('public/static/images/space-3.webp')});assert.equal(upload.status(),200);const media=(await upload.json()).url
 await save('column',item.key,{...item,coverImage:media,body:'## QA\n\n![안내 이미지]('+media+')'},'publish');assert.equal((await anon.request.get(base+media)).status(),200)
 const live=await row('column',item.key);assert.equal((await api('content/column/'+item.key+'/withdraw','POST',{revision:live.revision})).status(),200);assert.equal((await anon.request.get(base+'/column/'+item.key)).status(),404);assert.equal((await anon.request.get(base+media)).status(),404)
 assert.deepEqual(errors,[])
 console.log('PASS editorial: safe SSR Markdown/table/FAQ/schema, immutable publication dates, private drafts, server search/pagination, KO-only new content, R2 withdrawal, Tiptap roundtrip/server autosave/network recovery/image downscale+alt-dialog, preview and 14 reading/board/editor widths. Browser errors0.')
}finally{for(const [kind,key]of keys.reverse()){const r=await row(kind,key);if(r)await api(`content/${kind}/${key}?revision=${r.revision}`,'DELETE')}await api('logout','POST');await browser.close()}
