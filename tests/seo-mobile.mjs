import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const base=process.env.TEST_URL||'http://localhost:3000'
const compiled=await build({stdin:{contents:"export * from './src/seo';export * from './src/content';export {default as app} from './src/index'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false,loader:{'.md':'text'}})
const lib=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
assert.equal(lib.productionOrigin('https://clinic.example/'),'https://clinic.example')
for(const bad of ['http://clinic.example','https://user:pass@clinic.example','https://clinic.example/path','javascript:alert(1)'])assert.equal(lib.productionOrigin(bad),'')
const env={PUBLIC_SITE_URL:'https://clinic.example/'}
for(const [url,indexable,status] of [['https://clinic.example/',true,200],['https://preview.example/',false,200],['https://clinic.example/no-page',false,404],['https://clinic.example/admin',false,200],['https://clinic.example/api/health',false,200]]){
 const r=await lib.app.request(url,{},env);assert.equal(r.status,status)
 assert.equal(r.headers.get('x-robots-tag')?.includes('noindex')||false,!indexable,url)
 if(!url.includes('/api/'))assert.match(await r.text(),indexable?/name="robots" content="index,follow/:/name="robots" content="noindex,nofollow/)
}
assert.match(await (await lib.app.request('https://preview.example/robots.txt',{},env)).text(),/Disallow: \/\n/)
const robots=await (await lib.app.request('https://clinic.example/robots.txt',{},env)).text();assert.match(robots,/Sitemap: https:\/\/clinic.example\/sitemap.xml/);assert.doesNotMatch(robots,/example\/\//)
const data=lib.assemble(),schemas=lib.clinicSchemas(data,'https://clinic.example');assert.equal(schemas.filter(s=>s['@type']==='Dentist').length,1)
assert.equal(data.channels.find(c=>c.key==='instagram-cheongnyangni').url,'https://www.instagram.com/_thegoodmorning/')
for(const [id,place] of [['cheongnyangni','19524548']])assert.equal(schemas.find(s=>s['@id']==='https://clinic.example/#'+id).hasMap,'https://map.naver.com/p/entry/place/'+place)
for(const branch of data.branches){const s=schemas.find(s=>s['@id']==='https://clinic.example/#'+branch.id);assert.equal(s.telephone,branch.phone);assert.equal(s.address.streetAddress,branch.address);assert.equal(s.openingHoursSpecification.length,branch.schedule.flatMap(s=>s.split(',').filter(Boolean)).length)}
const edited=structuredClone(data);edited.branches[0].phone='02-0000-0000';edited.branches[0].exceptions=[{date:'2026-12-25',hours:'',note:'휴진'}];const changed=lib.clinicSchemas(edited,'https://clinic.example').find(s=>s['@id']==='https://clinic.example/#cheongnyangni');assert.equal(changed.telephone,'02-0000-0000');assert.equal(changed.specialOpeningHoursSpecification[0].opens,'00:00')
assert.ok(fs.statSync('public/static/fonts/GoodMorningSans.woff2').size<500000)
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[]
page.on('pageerror',e=>errors.push(e.message))
try{
 await page.goto(base+'/treatments/sedation',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready)
 const fontResources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('.woff2')).map(e=>({url:e.name,bytes:e.encodedBodySize})))
 assert.ok(fontResources.some(f=>f.url.includes('GoodMorningSans')&&f.bytes===fs.statSync('public/static/fonts/GoodMorningSans.woff2').size))
 assert.ok(!fontResources.some(f=>f.url.includes('PretendardVariable')),'Static treatment uses only the lightweight font')
 await page.evaluate(async()=>{const span=document.createElement('span');span.textContent='\uac02';document.body.append(span);await document.fonts.load("16px 'Pretendard Variable'",span.textContent);await document.fonts.ready})
 assert.ok(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('PretendardVariable'))),'Uncommon CMS character can load the original fallback')
 console.log('PASS font: lightweight subset on static treatment; uncommon Hangul original fallback available.')
 const sitemap=await (await context.request.get(base+'/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);const descriptions=new Set()
 for(const url of urls){
  await page.goto(url,{waitUntil:'domcontentloaded'});const path=new URL(url).pathname
  const description=await page.locator('meta[name="description"]').getAttribute('content');assert.ok(description.length>30);assert.ok(!descriptions.has(description),'unique description '+path);descriptions.add(description)
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),url)
  assert.equal(await page.locator('meta[property="og:description"]').getAttribute('content'),description)
  const all=await page.locator('script[type="application/ld+json"]').evaluate(el=>JSON.parse(el.textContent));assert.equal(all.filter(s=>s['@type']==='Dentist').length,1)
  const crumbs=all.find(s=>s['@type']==='BreadcrumbList').itemListElement;assert.equal(crumbs.at(-1).item,url)
  if(path!=='/'){const visible=await page.locator('.page-breadcrumbs li').allTextContents();assert.deepEqual(visible,crumbs.map(c=>c.name))}
  if(path.startsWith('/treatments/')){assert.equal(await page.locator('#care-summary').count(),1);assert.equal(crumbs.length,3);assert.ok(all.some(s=>s['@type']==='MedicalWebPage'))}
  for(const width of [320,390,600,768,1024,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' overflow '+width)}
  // No duplicated fragment IDs: answer links and section links remain unambiguous.
  assert.deepEqual(await page.locator('[id]').evaluateAll(nodes=>{const seen=new Set();return nodes.map(n=>n.id).filter(id=>seen.has(id)||!seen.add(id))}),[],path+' duplicate IDs')
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/video');await page.locator('[data-video-category="수면치료"]').click();assert.equal(await page.locator('#video-list .video-card:visible').count(),1);await page.locator('[data-video-category="all"]').click();assert.equal(await page.locator('#video-list .video-card:visible').count(),6)
 await page.goto(base+'/treatments/sedation#faq-sedation-q1');assert.equal(await page.locator('#faq-sedation-q1').getAttribute('open'),'')
 await page.goto(base+'/');assert.equal(await page.locator('.latest-journal li').count(),6);assert.ok(await page.locator('.footer-fees li').count()>0);await page.locator('.footer-hours summary').last().click();assert.ok(await page.locator('.footer-hours[open] dd').count()===7)
 const llms=await (await context.request.get(base+'/llms.txt')).text();assert.match(llms,new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/pricing'));assert.doesNotMatch(llms,/@gmail\.com|copy-review-|ADMIN_PASSWORD/)
 assert.deepEqual(errors,[])
 // Mobile menu links, single-clinic contacts and search work in touch emulation.
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),tp=await touch.newPage();tp.on('pageerror',e=>errors.push(e.message))
 await tp.goto(base+'/');await tp.locator('.menu-toggle').tap();await tp.locator('#mobile-search-open').tap();await tp.locator('#site-search').fill('수가');await tp.waitForSelector('.search-result');assert.ok(await tp.locator('.search-result[href="/pricing"]').count()>0);await tp.locator('#search-dialog .dialog-close').tap();await tp.locator('.menu-toggle').tap();assert.equal(await tp.locator('#header-branch-select').count(),0);assert.match(await tp.locator('.mobile-bottom .branch-phone').getAttribute('href'),/029693776/)
 await tp.goto(base+'/pricing');await tp.screenshot({path:'test-results/audit-pricing-mobile.png',fullPage:true});await touch.close();assert.deepEqual(errors,[])
 console.log(`PASS SEO/AEO: ${urls.length} URLs, unique descriptions, canonical/OG, one clinic entity, breadcrumb parity, 31 visible care summaries, production/preview/private/error indexing rules, absolute llms index.`)
 console.log(`PASS mobile: ${urls.length*6} route-width combinations, stable question anchors, video topic filters, six latest posts, public fee footer, touch menu/search/clinic contacts. Browser errors: 0.`)
}finally{await browser.close()}
