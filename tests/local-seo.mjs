// Local SEO hubs, measurement slots and crawl hygiene (2026-10-12). In-process, no DB/network writes.
// Optional live check: TEST_URL=https://thegoodmorningdc.kr node tests/local-seo.mjs
import assert from 'node:assert/strict'
import {build} from 'esbuild'
const compiled=await build({entryPoints:['src/index.tsx'],bundle:true,platform:'node',format:'esm',write:false,loader:{'.md':'text'}})
const {default:app}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const prod='https://thegoodmorningdc.kr',env={PUBLIC_SITE_URL:prod}
const live=process.env.TEST_URL&&!/localhost|127\.0\.0\.1/.test(process.env.TEST_URL)?process.env.TEST_URL:''
const get=async(path,host=prod,init={})=>live&&host===prod?fetch(live+path,{redirect:'manual',...init}):app.fetch(new Request(host+path,{redirect:'manual',...init}),env)
const html=async(path,host)=>{const r=await get(path,host);assert.equal(r.status,200,path);return r.text()}
const schemas=t=>JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(t)[1])
const strip=t=>t.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&')
const count=(t,href)=>(t.match(new RegExp('href="'+href+'"','g'))||[]).length
const footerOf=t=>t.slice(t.indexOf('<footer class="site-footer"'))
const mainOf=t=>t.slice(t.indexOf('<main'),t.indexOf('</main>'))

// Home: keyword-first title, H1 and description.
const home=await html('/')
assert.match(/<title>([^<]*)<\/title>/.exec(home)[1],/^청량리 치과 \| 더굿모닝치과/)
assert.match(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(home)[0],/청량리 치과/)
assert.match(/<meta name="description" content="([^"]*)"/.exec(home)[1],/^청량리 치과 더굿모닝치과의원/)
assert.equal(count(mainOf(home),'/area/cheongnyangni'),1);assert.equal(count(mainOf(home),'/area/jegi-dong'),1)
assert.equal(count(footerOf(home),'/area/cheongnyangni'),1,'Footer carries one exact-anchor hub link')
assert.match(home,/id="director-story"/)

// Hubs: exact title/H1, 1,500–2,500 Hangul, FAQ schema = visible FAQ, Dentist reference, KO-only.
for(const [slug,keyword] of [['cheongnyangni','청량리 치과'],['jegi-dong','제기동 치과']]){
 const t=await html('/area/'+slug)
 assert.ok(/<title>([^<]*)<\/title>/.exec(t)[1].startsWith(keyword+' |'),slug+' title')
 assert.equal(strip(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(t)[0]).trim(),keyword)
 const article=/<article class="article-body prose">([\s\S]*?)<\/article>/.exec(t)[1],hangul=(strip(article).match(/[가-힣]/g)||[]).length
 assert.ok(hangul>=1500&&hangul<=2500,slug+' hangul '+hangul)
 const all=schemas(t),faq=all.find(s=>s['@type']==='FAQPage'),visible=[...article.matchAll(/<summary><span class="faq-no">\d+<\/span>([\s\S]*?)<svg/g)].map(m=>strip(m[1]).trim()),answers=[...article.matchAll(/<div class="faq-answer">([\s\S]*?)<\/div>/g)].map(m=>strip(m[1]).trim())
 assert.ok(faq.mainEntity.length>=4&&faq.mainEntity.length<=6)
 assert.deepEqual(faq.mainEntity.map(q=>q.name),visible);assert.deepEqual(faq.mainEntity.map(q=>q.acceptedAnswer.text),answers)
 assert.equal(all.find(s=>s['@type']==='WebPage').about['@id'],prod+'/#cheongnyangni')
 assert.equal(all.find(s=>s['@type']==='BreadcrumbList').itemListElement.at(-1).item,prod+'/area/'+slug)
 assert.equal(all.find(s=>s['@type']==='Dentist').name,'더굿모닝치과의원')
 assert.doesNotMatch(t.split('</head>')[0],/hreflang/,'Korean-only hub has no hreflang alternates')
 const en=await get('/en/area/'+slug);assert.equal(en.status,302);assert.equal(en.headers.get('location'),'/area/'+slug)
}
assert.ok((await html('/area/jegi-dong')).includes('href="/area/cheongnyangni"'))
assert.equal((await get('/area/unknown')).status,404)

// Treatment pages: at most two hub links in total (aside + footer).
for(const slug of ['sedation','implant-front','sinus-lift']){const t=await html('/treatments/'+slug);assert.ok(count(t,'/area/cheongnyangni')+count(t,'/area/jegi-dong')<=2,slug)}
const sinus=schemas(await html('/treatments/sinus-lift')).find(s=>s['@type']==='VideoObject');assert.equal(sinus.uploadDate,'2025-10-10T02:15:00-07:00');assert.match(sinus.embedUrl,/youtube-nocookie\.com\/embed\/59WYhK9pWe0/)
const doctor=schemas(await html('/doctors/kang-dowook')).find(s=>Array.isArray(s['@type'])&&s['@type'].includes('Physician'));assert.deepEqual(doctor.hasCredential.map(c=>c.name),['치주과 전문의','통합치의학과 전문의'])

// Measurement: GA4 + Clarity through the external loader on production only; CSP allows it.
const r=await get('/');const csp=r.headers.get('content-security-policy')
for(const host of ['https://www.googletagmanager.com','https://www.clarity.ms','https://*.google-analytics.com','https://c.bing.com'])assert.ok(csp.includes(host),'CSP '+host)
assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'/)
assert.match(home,/<script src="\/static\/analytics\.js\?v=1" data-ga="G-CNEEQ5VCH0" data-clarity="ywkymprujk" defer><\/script>/)
assert.doesNotMatch(home,/amplitude/i)
if(!live){
 assert.doesNotMatch(await(await app.fetch(new Request('https://abc123.webapp-2-9y5.pages.dev/'),env)).text(),/analytics\.js/,'No analytics on previews')
 assert.doesNotMatch(await(await app.fetch(new Request(prod+'/admin'),env)).text(),/analytics\.js/,'No analytics on admin')
 assert.doesNotMatch(await(await app.fetch(new Request(prod+'/handover'),env)).text(),/analytics\.js/,'No analytics on handover')
 const naver=await(await app.fetch(new Request(prod+'/'),{...env,NAVER_SITE_VERIFICATION:'abc123def'})).text();assert.match(naver,/<meta name="naver-site-verification" content="abc123def">/)
 // Production Pages host redirects; hashed previews stay noindex.
 const pd=await app.fetch(new Request('https://webapp-2-9y5.pages.dev/directions?x=1'),env);assert.equal(pd.status,301);assert.equal(pd.headers.get('location'),prod+'/directions?x=1')
 const hashed=await app.fetch(new Request('https://abc123.webapp-2-9y5.pages.dev/directions'),env);assert.equal(hashed.status,200);assert.match(hashed.headers.get('x-robots-tag'),/noindex/)
 assert.equal((await app.fetch(new Request(prod+'/admin/stats'),env)).status,404,'Stats hidden without admin session')
}
const key=await get('/98fd1c7b41dc3340ee91b700aef8397d.txt');assert.equal(key.status,200);assert.match(key.headers.get('content-type'),/^text\/plain/);assert.equal(await key.text(),'98fd1c7b41dc3340ee91b700aef8397d')

// Crawl hygiene: AI crawlers, llms-full, real lastmod, empty /cases noindex and out of sitemap.
const robots=await(await get('/robots.txt')).text()
for(const bot of ['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-User','Claude-SearchBot','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended','Bingbot','Yeti','Daumoa'])assert.match(robots,new RegExp('User-agent: '+bot+'\\nAllow: /\\nDisallow: /admin'))
assert.match(robots,/Sitemap: https:\/\/thegoodmorningdc\.kr\/sitemap\.xml/)
const full=await(await get('/llms-full.txt')).text();assert.ok(full.length>20000);assert.match(full,/청량리 치과/);assert.match(full,/02-969-3776/)
const sitemap=await(await get('/sitemap.xml')).text(),entries=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>(?:<image:image><image:loc>[^<]+<\/image:loc><\/image:image>)?<\/url>/g)]
assert.equal(entries.length,(sitemap.match(/<url>/g)||[]).length,'Every URL has lastmod');for(const [,,d] of entries)assert.ok(Number.isFinite(Date.parse(d)))
assert.ok(sitemap.includes(prod+'/area/cheongnyangni</loc><lastmod>2026-10-14'));assert.ok(sitemap.includes(prod+'/area/jegi-dong</loc>'))

// 청량리 진료별 하위 페이지 (2026-10-14): one photo in og:image = first body img = schema image = sitemap image;
// hub/home photo cards mirror ItemList; KO only (no hreflang, /en 302, /en home has no cards or ItemList).
const topicSlugs=['sedation','implant','implant-revision','front-teeth','denture','systemic-care'],ogs=new Set()
for(const slug of topicSlugs){
 const path='/area/cheongnyangni/'+slug,t=await html(path),head=t.split('</head>')[0]
 const og=/<meta property="og:image" content="([^"]+)"/.exec(head)[1];ogs.add(og)
 assert.match(head,/<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">/)
 assert.ok(/<title>([^<]*)<\/title>/.exec(head)[1].startsWith('청량리 '),slug+' title starts with region')
 assert.doesNotMatch(head,/hreflang/)
 const article=/<article class="article-body prose">([\s\S]*?)<\/article>/.exec(t)[1]
 assert.equal(prod+/<img src="([^"]+)"/.exec(article)[1],og,slug+' first body image = og')
 const all=schemas(t),page=all.find(s=>s['@type']==='MedicalWebPage');assert.equal(page.image.url,og)
 assert.equal(all.find(s=>s['@type']==='BreadcrumbList').itemListElement[1].item,prod+'/area/cheongnyangni')
 assert.ok(sitemap.includes('<loc>'+prod+path+'</loc><lastmod>2026-10-14</lastmod><image:image><image:loc>'+og+'</image:loc>'),slug+' sitemap image')
 const body=strip(t.slice(t.indexOf('<section id="topic-1"'),t.indexOf('<section class="area-topics">')));assert.ok((body.match(/[가-힣]/g)||[]).length>=1200,slug+' body length')
 assert.doesNotMatch(strip(t),/최고|유일|1위|잘하는|무통|보장|할인|전후/)
 const en=await get('/en'+path);assert.equal(en.status,302)
}
assert.equal(ogs.size,6,'unique og per sub-page')
for(const p of ['/','/area/cheongnyangni']){const t=await html(p),cards=[...t.matchAll(/<a href="(\/area\/cheongnyangni\/[a-z-]+)" class="area-topic-card"><img src="([^"]+)"/g)];assert.equal(cards.length,6,p+' cards')
 const list=[...t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>[JSON.parse(m[1])].flat()).find(s=>s['@type']==='ItemList')
 assert.deepEqual(list.itemListElement.map(i=>[i.url,i.image]),cards.map(c=>[prod+c[1],prod+c[2]]))}
if(!live){const enRes=await app.fetch(new Request(prod+'/en'),env,{waitUntil(){},passThroughOnException(){}});assert.equal(enRes.status,200);const enHome=await enRes.text();assert.match(enHome,/listens once more/);assert.doesNotMatch(enHome,/area-topic-card|"ItemList"/)}
assert.match(await html('/treatments/sedation'),/href="\/area\/cheongnyangni\/sedation"/)
const langs=await(await get('/sitemap-languages.xml')).text();assert.doesNotMatch(langs,/\/area\//)
const cases=await get('/cases');const casesHtml=await cases.text()
if(!/<a href="\/cases\/[a-z0-9-]+"/.test(casesHtml)){assert.match(cases.headers.get('x-robots-tag')||'',/noindex/);assert.doesNotMatch(sitemap,/\/cases</)}
const favicon=await get('/favicon.ico');if(live)assert.equal(favicon.status,200)

// Privacy policy describes GA4 and Clarity, overseas transfer and opt-out.
const privacy=strip(await html('/privacy'))
for(const term of ['Google Analytics 4','Microsoft Clarity','Google LLC','Microsoft Corporation','국외','Global Privacy Control','시행일: 2026년 10월 13일','홈페이지 예약 상담 신청'])assert.ok(privacy.includes(term),'privacy '+term)
assert.doesNotMatch(privacy,/Amplitude/i)
console.log(`PASS local SEO${live?' (live '+live+')':''}: keyword-first home title/H1, 2 Korean-only hubs (exact title/H1, 1,500–2,500 Hangul, FAQ schema = visible), exact-anchor links, VideoObject/Physician schema, GA4+Clarity loader with CSP, IndexNow key, AI robots, llms-full, lastmod on ${entries.length} URLs, privacy GA4/Clarity.`)
