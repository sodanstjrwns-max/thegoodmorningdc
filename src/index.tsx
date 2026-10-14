import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { secureHeaders } from 'hono/secure-headers'
import { bodyLimit } from 'hono/body-limit'
import {assemble,loadContent,type Content} from './content'
import {createUI,heading,esc,icon} from './ui'
import {createPages} from './pages'
import { glossary } from './glossary'
import {studio} from './studio'
import {channelListing} from './channels'
import {locales,localizeHTML,translate,localPath,type Locale} from './locales'
import {publicRequests,adminRequests} from './requests'
import {casesView,careersView,requestForm,requestAdminPanel,approvedShowcase} from './services'
import {siteOrigin,launchIndexable,privatePath,pageDescription,pageSchemas,llmIndex,listingQuery,listingPath,productionOrigin,physicianSchema,contentDate,plain} from './seo'
import {hubs,findHub,hubPage,hubSchemas,hubPath,topicPage,topicSchemas} from './area'
import {topics,findTopic,topicPath,OG_SIZE,topicItemList} from './area-topics'
import {videoSchema,frontTreatments} from './director'
import {measurement,analyticsCsp,INDEXNOW_KEY} from './site-config'
import {fetchSiteStats,statsView} from './stats'
import {board,articleView,articleSchemas,editorialPath,publishedEntries,boardSchema} from './editorial'
import {bodyMedia,markdown} from './markdown'
import {getActor,verifyStaff,can,staffRoutes} from './staff'
import {reviewRoutes} from './workflow'
import {operationRoutes,mutationLock} from './operations'
import {notificationRoutes} from './notifications'
import {metricsPublic,metricsAdmin} from './metrics'
import {handoverPage} from './handover'
import {readWithRetry as readQuery,failureCode} from './reliability'
import {reservationForm} from './reservations'
import {pushRoutes,notificationsPage,adminManifest,pushConfigured} from './push'
import {feeRoutes} from './fees'
import {popupRoutes,activePopups,popupMarkup,popupImageInUse,type Popup} from './popups'
import {queueIndexNow,postPaths,indexNowLog} from './indexnow'

type Env = { DB:any; R2:any; ASSETS?:{fetch:(request:Request)=>Promise<Response>}; ADMIN_PASSWORD?:string; PUBLIC_SITE_URL?:string; RESEND_API_KEY?:string; STATS_API_TOKEN?:string; NAVER_SITE_VERIFICATION?:string; VAPID_PUBLIC_KEY?:string; VAPID_PRIVATE_KEY?:string; VAPID_SUBJECT?:string; INDEXNOW_DRY_RUN?:string }
const app = new Hono<{Bindings:Env;Variables:{content:Content;popups:Popup[]}}>()
app.use('*', secureHeaders({referrerPolicy:'strict-origin-when-cross-origin',xFrameOptions:'DENY',contentSecurityPolicy:{defaultSrc:["'self'"],scriptSrc:["'self'",...analyticsCsp.script],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:',...analyticsCsp.img],connectSrc:["'self'",...analyticsCsp.connect],frameSrc:["'self'",'https://www.youtube-nocookie.com','https://www.google.com'],objectSrc:["'none'"],baseUri:["'self'"],formAction:["'self'"],frameAncestors:["'none'"]}}))
// Canonicalize the explicitly owned www host and the production Pages host (not hashed previews), preserving path and query.
app.use('*',async(c,next)=>{const u=new URL(c.req.url);if(['GET','HEAD'].includes(c.req.method)&&['www.thegoodmorningdc.kr','webapp-2-9y5.pages.dev'].includes(u.hostname)&&c.env.PUBLIC_SITE_URL==='https://thegoodmorningdc.kr'){u.hostname='thegoodmorningdc.kr';u.protocol='https:';return c.redirect(u.href,301)}await next()})
// Edge HTML cache (production public pages, anonymous only). Keeps pages fast when D1 or the
// network is slow; CMS changes appear within 2 minutes and admin saves purge the main pages.
const EDGE_TTL=120
const edgeCacheable=(c:any)=>{const u=new URL(c.req.url);return ['GET','HEAD'].includes(c.req.method)&&typeof caches!=='undefined'&&launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)&&!/^\/(?:admin|api|media|films|handover|static)(?:\/|$)/.test(u.pathname)&&!getCookie(c,'gm_session')}
app.use('*',async(c,next)=>{
 if(!edgeCacheable(c))return next()
 const cache=(caches as any).default,key=new Request(new URL(c.req.url).toString())
 const hit=await cache.match(key).catch(()=>null)
 if(hit){const r=new Response(c.req.method==='HEAD'?null:hit.body,hit);r.headers.set('X-Edge-Cache','HIT');return r}
 await next()
 if(c.req.method==='GET'&&c.res.status===200&&!c.res.headers.has('Set-Cookie')&&/text\/html|application\/xml|text\/plain/.test(c.res.headers.get('Content-Type')||'')){
  c.res.headers.set('Cache-Control',`public, max-age=0, s-maxage=${EDGE_TTL}, stale-while-revalidate=600`);c.res.headers.set('X-Edge-Cache','MISS')
  c.executionCtx.waitUntil(cache.put(key,c.res.clone()).catch(()=>{}))
 }
})
const purgeEdge=async(origin:string)=>{if(typeof caches==='undefined')return;const d=assemble(),paths=[...basePaths,...hubs.map(hubPath),...topics.map(topicPath),...d.treatments.map(t=>'/treatments/'+t.slug),...d.doctors.map(x=>'/doctors/'+x.slug),'/sitemap.xml','/sitemap-languages.xml','/llms.txt','/llms-full.txt','/feed.xml'];await Promise.all(paths.flatMap(p=>[p,localPath(p,'en')]).map(p=>(caches as any).default.delete(new Request(origin+p)).catch(()=>false)))}
app.use('/static/*',serveStatic({root:'./public'}))
app.use('/api/*',bodyLimit({maxSize:5*1024*1024,onError:c=>c.json({error:'요청 크기가 너무 큽니다. 최대 5MB까지 허용됩니다.'},413)}))
app.use('/api/admin/*',async(c,next)=>{c.header('Cache-Control','no-store');if(!['GET','HEAD'].includes(c.req.method)){const origin=c.req.header('Origin');if(origin!==new URL(c.req.url).origin)return c.json({error:'허용되지 않은 요청입니다.'},403)}await next();if(!['GET','HEAD'].includes(c.req.method)&&c.res.status<400&&launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url))c.executionCtx.waitUntil(purgeEdge(siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)))})
app.use('*',async(c,next)=>{await next();if(!launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)||privatePath(new URL(c.req.url).pathname)||c.res.status>=400)c.header('X-Robots-Tag','noindex, nofollow')})
app.use('*',async(c,next)=>{const u=new URL(c.req.url);if(c.req.method==='GET'&&!/^\/(api|admin)(?:\/|$)/.test(u.pathname)&&u.searchParams.has('branch')){u.searchParams.delete('branch');return c.redirect(u.pathname+u.search+u.hash,301)}await next()})
app.use('*',async(c,next)=>{const p=new URL(c.req.url).pathname;if(p.length>1&&p.endsWith('/'))return c.redirect(p.slice(0,-1)+new URL(c.req.url).search,301);await next()})
// Public operator guide: independent of CMS/DB, permanently search-excluded.
// Keep it outside patient navigation, sitemaps and locale rewriting.
app.get('/handover',c=>{const u=new URL(c.req.url),deliveryOrigin=u.origin===productionOrigin(c.env.PUBLIC_SITE_URL)||['localhost','127.0.0.1'].includes(u.hostname);c.header('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');c.header('Cache-Control','private, no-store, max-age=0');c.header('Referrer-Policy','no-referrer');return c.html(handoverPage({deliveryOrigin,password:c.env.ADMIN_PASSWORD}))})
// IndexNow ownership key (public by design): returns exactly the key as text/plain.
app.get('/'+INDEXNOW_KEY+'.txt',c=>{c.header('Cache-Control','public, max-age=3600');return c.text(INDEXNOW_KEY)})
app.get('/en/handover',c=>c.redirect('/handover',302))
app.use('*',async(c,next)=>{
 const url=new URL(c.req.url),match=/^\/(en|ja|zh)(\/.*)?$/.exec(url.pathname)
 if(!match)return next()
 const locale=match[1] as Locale,path=match[2]||'/'
 if(!locales.includes(locale))return c.notFound()
 // New editorial posts are Korean originals until a real translation is supplied.
 if(/^\/(?:column|cases)\/[^/]+$/.test(path)||/^\/area\//.test(path))return c.redirect(path,302)
 if(/^\/(?:api|admin|static|media|films|en|ja|zh)(?:\/|$)/.test(path)||/\.(?:xml|txt)$/.test(path))return c.notFound()
 const source=new URL(url);source.pathname=path
 const response=await app.fetch(new Request(source,{method:c.req.method,headers:c.req.raw.headers}),c.env,c.executionCtx)
 const headers=new Headers(response.headers),location=headers.get('Location')
 if(location?.startsWith('/'))headers.set('Location',localPath(location,locale))
 if(!(headers.get('Content-Type')||'').includes('text/html'))return new Response(response.body,{status:response.status,headers})
 headers.delete('Content-Length');return new Response(localizeHTML(await response.text(),locale,path,siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)),{status:response.status,headers})
})
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('')
const random=()=>crypto.randomUUID()+crypto.randomUUID()
async function isAdmin(c:any){return !!await getActor(c)}
app.use('*',async(c,next)=>{const p=new URL(c.req.url).pathname;if(!/^\/(?:static|films|media|api\/admin)(?:\/|$)/.test(p)){const [content,popups]=await Promise.all([loadContent(c.env.DB),privatePath(p)||/^\/api\//.test(p)?Promise.resolve([] as Popup[]):activePopups(c.env.DB)]);c.set('content',content);c.set('popups',popups)}await next()})
const model=(c:any):Content=>c.get('content')
const layout=(c:any)=>createUI(model(c))
const views=(c:any)=>createPages(model(c))
const feeds=(c:any)=>channelListing(c.env.DB,model(c),p=>c.executionCtx.waitUntil(p))
const render=(c:any,title:string,content:string,schemas:object[]=[],status=200,summary='',options:{canonicalPath?:string;seoTitle?:string;fullTitle?:string;koOnly?:boolean;languagePath?:string;noindex?:boolean;ogImage?:{path:string;width:number;height:number;alt:string}}={})=>{const path=new URL(c.req.url).pathname,origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),data=model(c)||assemble();const description=pageDescription(path,title,data,summary)+(new URL(options.canonicalPath||path,origin).searchParams.get('page')?' · '+new URL(options.canonicalPath||path,origin).searchParams.get('page')+'페이지':'');const indexable=launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)&&!privatePath(path)&&status===200&&!options.noindex;if(options.noindex)c.header('X-Robots-Tag','noindex, follow');const measure=measurement(launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)&&!privatePath(path),c.env);let html=layout(c).shell(title,content,path,origin,description,status===200&&!privatePath(path)?pageSchemas(data,origin,options.canonicalPath||path,title,description,schemas):[],indexable,{...options,measure});const popups:Popup[]=c.get('popups')||[];if(status===200&&popups.length&&!privatePath(path))html=html.replace('</body>',popupMarkup(popups)+'</body>');if(path.startsWith('/admin'))html=html.replace('</head>','<link rel="manifest" href="/admin/manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="굿모닝 관리자"></head>');return c.html(html,status)}
async function posts(c:any,type:string){if(!c.env.DB)return [];const r=await c.env.DB.prepare('SELECT id,slug,title,type,updated_at FROM posts WHERE status=? AND type=? ORDER BY updated_at DESC').bind('published',type).all();return r.results||[]}
// Home ItemList mirrors the visible '청량리 진료 안내' cards (only when that CMS section is enabled); Korean only.
app.get('/',async c=>render(c,'환자의 불편함을 한 번 더 듣는 치과',layout(c).home(await feeds(c)),model(c).sections.some(s=>s.key==='cheongnyangni-guide'&&s.enabled)?[topicItemList(siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url))]:[],200,'',{fullTitle:'청량리 치과 | 더굿모닝치과 — 제기동역 수면치료·임플란트'}))
// Korean-only local hubs (exact-match keyword pages). No /en mirror, so no hreflang alternates.
app.get('/area/:slug',c=>{const h=findHub(c.req.param('slug'));if(!h)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,h.keyword,hubPage(h,model(c)),hubSchemas(h,siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)),200,h.description,{fullTitle:h.title,koOnly:true,languagePath:'/directions'})})
// "청량리 {진료}" local sub-pages (Korean only). One representative photo: og:image = first body img = schema image = sitemap image.
app.get('/area/cheongnyangni/:topic',c=>{const t=findTopic(c.req.param('topic'));if(!t)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,t.keyword,topicPage(t,model(c)),topicSchemas(t),200,t.description,{fullTitle:t.title,koOnly:true,languagePath:'/directions',ogImage:{path:t.image.og,...OG_SIZE,alt:t.image.alt}})})
app.get('/treatments',c=>render(c,'수면·임플란트·보존·잇몸 진료 안내',views(c).treatmentHub()))
app.get('/treatments/:slug',c=>{const t=model(c).treatments.find(t=>t.slug===c.req.param('slug'));if(!t)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,t.name+' 진료 안내',views(c).treatmentPage(t),[{'@context':'https://schema.org','@type':'MedicalProcedure',name:t.name,description:t.description},{'@context':'https://schema.org','@type':'FAQPage',mainEntity:t.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},...[t.slug.includes('sinus')?'59WYhK9pWe0':frontTreatments.includes(t.slug)?'xW7k824_a_o':t.group===0&&!t.slug.includes('sedation')&&!t.slug.includes('disabled')?'DQdEDnEaN4c':''].map(videoSchema).filter((v):v is NonNullable<typeof v>=>!!v)])})
app.get('/doctors',c=>render(c,'의료진 소개',views(c).doctorsPage()))
app.get('/doctors/:slug',c=>{const d=model(c).doctors.find(d=>d.slug===c.req.param('slug'));if(!d)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,d.name+' 원장 소개',views(c).doctorPage(d),[physicianSchema(d,siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url))])})
app.get('/mission',c=>render(c,'1990년부터 이어온 더굿모닝의 약속',views(c).missionPage()))
app.get('/tour',c=>render(c,'병원 둘러보기',views(c).tourPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('equipment')}</div></section>`))
app.get('/directions',c=>render(c,'더굿모닝치과 오시는 길과 진료시간',views(c).directionsPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('parking')}${views(c).operationPanels('accessibility')}</div></section>`))
app.get('/hours',c=>c.redirect('/directions',301))
app.get('/about',c=>c.redirect('/directions',301))
app.get('/reservation',c=>render(c,'전화 상담·예약 안내',views(c).directionsPage(true)+reservationForm(model(c))+`<section class="content-section"><div class="wrap">${views(c).operationPanels('sedation')}</div></section>`))
app.get('/contents',c=>render(c,'치과 영상·건강정보·백과사전',views(c).contentsPage()))
app.get('/video',async c=>render(c,'원장 설명 영상',views(c).videoPage()+views(c).channelPanel(await feeds(c),'youtube')))
app.get('/faq',c=>render(c,'자주 묻는 질문',views(c).faqPage(),[{'@context':'https://schema.org','@type':'FAQPage',mainEntity:model(c).allFaq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]))
app.get('/symptom-checker',c=>render(c,'증상별 진료 정보 찾기',views(c).checkerPage()))
// Editorial listings use server-side search and real pagination; no JavaScript required.
for(const [base,kind] of [['/column','column'],['/cases','showcase']] as const){
 app.get(base,async c=>{const data=board(model(c),kind,new URL(c.req.url).searchParams,kind==='column'?await feeds(c):[]);if(!data.valid)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,(kind==='column'?'원장 칼럼':'치료사례와 환자 경험')+(data.page>1?' · '+data.page+'페이지':''),data.html,[boardSchema(data.items,kind,siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),data.page)],200,'',{canonicalPath:data.canonical,noindex:data.filtered||(kind==='showcase'&&!publishedEntries(model(c),'showcase').length)})})
 app.get(base+'/:key',c=>{const e=publishedEntries(model(c),kind).find(e=>e.key===c.req.param('key'));if(!e)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,e.title,articleView(e,model(c),kind),articleSchemas(e,model(c),kind,siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)),200,e.seoDescription||e.summary||'',{seoTitle:e.seoTitle||e.title})})
}
app.get('/pricing',c=>!model(c).feePageEnabled?render(c,'비급여 진료비 확인 안내',heading('TREATMENT FEES','비급여 진료비 안내','비급여 진료비는 진단 후 치료 항목을 확인하고 개별 안내드립니다.')+`<section class="content-section"><div class="wrap prose"><p>현재 홈페이지에는 항목별 금액을 게시하지 않고 있습니다. 원내에 게시된 비급여 진료비용 안내를 확인하시거나 <a href="tel:029693776">02-969-3776</a>으로 문의해 주세요.</p><p><a class="text-link" href="/reservation">상담·예약 안내 ${icon('arrow')}</a></p></div></section>`,[],200,'',{noindex:true}):render(c,'비급여 진료비 확인 안내',(model(c).operations.some(o=>o.category==='pricing'&&o.verified)?heading('TREATMENT FEES','비급여 진료비 안내','치료 항목별 금액을 확인하실 수 있습니다. 정확한 치료 계획과 총비용은 진료 후 안내합니다.')+`<section class="content-section"><div class="wrap">${views(c).operationPanels('pricing')}</div></section>`:views(c).pricingPage())))
app.get('/careers',c=>render(c,'채용 문의 안내',careersView(model(c))+`<section class="content-section"><div class="wrap">${views(c).operationPanels('careers')}</div></section>`))
app.get('/privacy',c=>render(c,'개인정보 안내',views(c).legalPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('legal')}</div></section>`))
app.get('/terms',c=>render(c,'홈페이지 이용 안내',views(c).legalPage(false)))
app.get('/visiting',c=>render(c,'해외·타지역 환자 내원 안내',views(c).visitingPage()+requestForm('interpretation',model(c))))
app.get('/encyclopedia',c=>render(c,'치과 백과사전',heading('DENTAL DICTIONARY','치과에서 들은 그 말,<br>무슨 뜻일까요?',`${glossary.length}개 용어를 쉬운 말로 풀었습니다. 정확한 적용은 진료 시 확인해 주세요.`)+`<section class="content-section"><div class="wrap"><nav class="glossary-index" aria-label="가나다 색인">${['전체','ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','기타'].map((v,i)=>`<button type="button" data-initial="${v}" aria-pressed="${i===0}">${v}</button>`).join('')}</nav><div class="filter-bar"><input id="glossary-search" type="search" aria-label="용어 검색" placeholder="용어 또는 설명 검색" style="margin-left:0;width:100%"></div><h2 class="sr-only">치과 용어 목록</h2><div class="content-grid" id="glossary-list">${glossary.map(t=>`<article class="term-card" data-term="${esc(t.term)}" data-search="${esc(t.term+' '+t.description)}"><h3>${t.term}</h3><p>${t.description}</p><a href="/treatments/${t.slug}">관련 진료 보기 ${icon('arrow')}</a></article>`).join('')}</div><p id="glossary-empty" hidden>검색 결과가 없습니다. 다른 용어를 입력해 주세요.</p></div></section>`))
for(const type of ['blog','notice']){
 app.get('/'+type,async c=>{const {q,page,valid}=listingQuery(new URL(c.req.url).searchParams),pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%',where="status='published' AND type=? AND (title LIKE ? ESCAPE '\\' OR body LIKE ? ESCAPE '\\')",count:any=await readQuery(()=>c.env.DB.prepare('SELECT COUNT(*) AS n FROM posts WHERE '+where).bind(type,pattern,pattern).first(),'board_count'),total=Math.max(1,Math.ceil(count.n/9));if(!valid||page>total)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);const items=((await readQuery(()=>c.env.DB.prepare('SELECT id,slug,title,type,updated_at FROM posts WHERE '+where+' ORDER BY updated_at DESC,id DESC LIMIT 9 OFFSET ?').bind(type,pattern,pattern,(page-1)*9).all(),'board_list')) as any).results;return render(c,(type==='notice'?'병원 소식':'치과 건강정보')+(page>1?' · '+page+'페이지':''),views(c).postList(items,type==='notice',{q,page,total,count:count.n})+(type==='blog'&&!q&&page===1?views(c).channelPanel(await feeds(c),'naver'):''),[{'@context':'https://schema.org','@type':'ItemList',itemListElement:items.map((p:any,i:number)=>({'@type':'ListItem',position:(page-1)*9+i+1,name:p.title,url:siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)+'/'+type+'/'+p.slug}))}],200,'',{canonicalPath:listingPath('/'+type,q,page),noindex:!!q})})
 app.get('/'+type+'/:slug',async c=>{const p=await c.env.DB?.prepare('SELECT * FROM posts WHERE slug=? AND type=? AND status=?').bind(c.req.param('slug'),type,'published').first();if(!p)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,p.title,views(c).postPage(p),[{'@context':'https://schema.org','@type':'Article',headline:p.title,datePublished:p.created_at,dateModified:p.updated_at,author:{'@type':'Organization',name:'더굿모닝치과',url:siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)+'/'},mainEntityOfPage:siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url)+'/'+type+'/'+p.slug}],200,p.body)})
}
app.get('/api/search',async c=>{const q=(c.req.query('q')||'').trim().toLowerCase().slice(0,100);const items=[...[...model(c).columns.map(e=>({...e,url:editorialPath('column',e.key)})),...model(c).showcases.filter(approvedShowcase).map(e=>({...e,url:editorialPath('showcase',e.key)}))].map(e=>({title:e.title,category:'칼럼·치료사례',url:e.url,keywords:e.summary||e.body.slice(0,300)})),...model(c).generalFaq.map(([question,answer])=>({title:question,category:'자주 묻는 질문',url:'/faq',keywords:answer})),...model(c).videos.map(v=>({title:v.title,category:'설명 영상',url:'/video',keywords:v.category})),...(await posts(c,'blog')).map((p:any)=>({title:p.title,category:'건강정보',url:'/blog/'+p.slug,keywords:''})),...model(c).treatments.map(t=>({title:t.name,category:'진료 안내',url:'/treatments/'+t.slug,keywords:[t.description,...t.symptoms,...t.sections.map(s=>s.title),...t.faq.map(([q])=>q)].join(' ')})),...model(c).doctors.map(d=>({title:d.name+' 원장',category:'의료진',url:'/doctors/'+d.slug,keywords:d.role})),...glossary.map(t=>({title:t.term,category:'치과 용어 · 관련 진료',url:'/treatments/'+t.slug,keywords:t.description})),{title:'오시는 길 · 진료시간',category:'병원 안내',url:'/directions',keywords:'위치 제기동 청량리 전화 주차 일요일 시간'},{title:'비급여 수가표',category:'진료비 안내',url:'/pricing',keywords:'가격 금액 비용 수가 비급여 보험'},{title:'해외·타지역 내원 준비',category:'내원 안내',url:'/visiting',keywords:'해외 외국 타지역 여행 준비'},{title:'상담 예약',category:'내원 안내',url:'/reservation',keywords:'예약 전화 상담'}];const language=c.req.query('lang') as Locale;const localized=locales.includes(language)?items.map(i=>({...i,title:translate(i.title,language),category:translate(i.category,language),url:localPath(i.url,language),keywords:i.keywords+' '+translate(i.keywords,language)})):items;return c.json({results:q?localized.filter(t=>(t.title+' '+t.keywords).toLowerCase().includes(q)).slice(0,15):[]})})
// The preview asset server ignores Range. Serve the two public films with correct
// byte ranges so Safari/iOS can probe and seek them. No arbitrary file/proxy access.
app.get('/films/:file',async c=>{
 const file=c.req.param('file');
 if(!['clinic-opening.mp4','clinic-opening-mobile.mp4'].includes(file))return c.notFound();
 if(!c.env.ASSETS)return c.text('영상 연결을 사용할 수 없습니다.',503);
 const source=await c.env.ASSETS.fetch(new Request(new URL('/static/video/'+file,c.req.url)));
 if(!source.ok)return c.text('영상을 불러오지 못했습니다.',502);
 const bytes=await source.arrayBuffer(),size=bytes.byteLength;
 const headers=new Headers({'Content-Type':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'public, max-age=0, must-revalidate','Content-Length':String(size)});
 const etag=source.headers.get('ETag');if(etag)headers.set('ETag',etag);
 const range=c.req.header('Range'),ifRange=c.req.header('If-Range');
 if(range&&(!ifRange||ifRange===etag)){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  let start=0,end=size-1;
  if(match&&(match[1]||match[2])){
   if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),size-1)}
   else {const count=Number(match[2]);start=Math.max(0,size-count);if(count===0)start=size}
  }else start=size;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start){headers.set('Content-Range','bytes */'+size);headers.set('Content-Length','0');return new Response(null,{status:416,headers})}
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));
  return new Response(c.req.method==='HEAD'?null:bytes.slice(start,end+1),{status:206,headers});
 }
 return new Response(c.req.method==='HEAD'?null:bytes,{headers});
})
app.route('/api/requests',publicRequests)
app.route('/api',metricsPublic)
app.get('/api/health',c=>c.json({ok:true,service:'the-good-morning'}))
app.get('/admin',async c=>{c.header('Cache-Control','no-store');return render(c,'관리자 콘텐츠 스튜디오',views(c).adminPage(await isAdmin(c),!!c.env.ADMIN_PASSWORD,(await getActor(c))?.role)+(['admin','coordinator'].includes((await getActor(c))?.role||'')?requestAdminPanel():''))})
// Admin-only PWA manifest (no secrets; browsers fetch it without cookies) and the push device page.
// Push-only service worker (no fetch handler). Served from static assets with revalidation so updates apply promptly.
app.get('/sw.js',async c=>{if(!c.env.ASSETS)return c.notFound();const r=await c.env.ASSETS.fetch(new Request(new URL('/sw.js',c.req.url)));if(!r.ok)return c.notFound();return new Response(r.body,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}})})
app.get('/admin/manifest.webmanifest',c=>{c.header('Cache-Control','private, max-age=3600');c.header('Content-Type','application/manifest+json; charset=utf-8');return c.body(JSON.stringify(adminManifest))})
app.get('/admin/notifications',async c=>{c.header('Cache-Control','no-store');const actor=await getActor(c);if(!actor||!['admin','coordinator'].includes(actor.role))return c.redirect('/admin',302);return render(c,'알림 설정',notificationsPage(pushConfigured(c.env),c.env.VAPID_PUBLIC_KEY||'')+'<script src="/static/admin-push.js?v=1" defer></script>')})
// Integrated stats: admin role only; anyone else gets a plain 404 (gosudental pattern).
app.get('/admin/stats',async c=>{c.header('Cache-Control','no-store');if((await getActor(c))?.role!=='admin')return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,'통합 통계',statsView(await fetchSiteStats(c.env.STATS_API_TOKEN)))})
app.post('/api/admin/login',async c=>{
 if(!c.env.ADMIN_PASSWORD||!c.env.DB)return c.json({error:'관리자 설정이 필요합니다.'},503)
 const ip=await hash((c.req.header('cf-connecting-ip')||'local')+c.env.ADMIN_PASSWORD);const now=Date.now()
 await c.env.DB.batch([c.env.DB.prepare('DELETE FROM admin_attempts WHERE attempted_at<?').bind(now-15*60*1000),c.env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now)])
 const attempts=await c.env.DB.prepare('SELECT COUNT(*) AS n FROM admin_attempts WHERE ip_hash=?').bind(ip).first()
 if(attempts.n>=5)return c.json({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429)
 const data=await c.req.json().catch(()=>null);const input=typeof data?.password==='string'?data.password:''
 await c.env.DB.prepare('INSERT INTO admin_attempts(ip_hash,attempted_at) VALUES(?,?)').bind(ip,now).run()
 const username=typeof data?.username==='string'?data.username.trim().toLowerCase():''
 if(input.length>256||username.length>40)return c.json({error:'로그인 정보를 확인하세요.'},401)
 let userId='';if(username){const id=await verifyStaff(c,username,input);if(!id)return c.json({error:'로그인 정보를 확인하세요.'},401);userId=id}else{const x=await hash(input),y=await hash(c.env.ADMIN_PASSWORD);let diff=0;for(let i=0;i<x.length;i++)diff|=x.charCodeAt(i)^y.charCodeAt(i);if(diff)return c.json({error:'비밀번호를 확인해 주세요.'},401)}
 const token=random();await c.env.DB.batch([c.env.DB.prepare('INSERT INTO admin_sessions(token_hash,expires_at,user_id) VALUES(?,?,?)').bind(await hash(token),now+8*3600*1000,userId),c.env.DB.prepare('DELETE FROM admin_attempts WHERE ip_hash=?').bind(ip)])
 setCookie(c,'gm_session',token,{httpOnly:true,secure:new URL(c.req.url).protocol==='https:',sameSite:'Strict',path:'/',maxAge:8*3600});return c.json({ok:true})
})
app.use('/api/admin/*',async(c,next)=>{const actor=await getActor(c);if(!actor)return c.json({error:'관리자 로그인이 필요합니다.'},401);const path=new URL(c.req.url).pathname.slice('/api/admin'.length);if(!can(actor,path,c.req.method))return c.json({error:'이 작업에 필요한 권한이 없습니다.'},403);if(!['GET','HEAD'].includes(c.req.method)&&/^\/(content\/|reviews\/|posts(?:\/|$)|media-library\/)/.test(path))return mutationLock(c,next);await next()})
app.route('/api/admin',staffRoutes)
app.route('/api/admin',reviewRoutes)
app.route('/api/admin',operationRoutes)
app.route('/api/admin',notificationRoutes)
app.route('/api/admin',metricsAdmin)
app.route('/api/admin',studio)
app.route('/api/admin',adminRequests)
app.route('/api/admin',pushRoutes)
app.route('/api/admin',feeRoutes)
app.route('/api/admin',popupRoutes)
app.get('/api/admin/indexnow-log',async c=>c.json({log:await indexNowLog(c.env.DB)}))
app.post('/api/admin/logout',async c=>{const token=getCookie(c,'gm_session');if(token)await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(token)).run();deleteCookie(c,'gm_session',{path:'/'});return c.json({ok:true})})
app.get('/api/admin/posts',async c=>{const r=await c.env.DB.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all();return c.json({posts:r.results})})
app.post('/api/admin/posts',async c=>{
 const p=await c.req.json().catch(()=>null)
 if(!p||!['blog','notice'].includes(p.type)||!['draft','published'].includes(p.status)||typeof p.title!=='string'||!p.title.trim()||p.title.length>120||typeof p.slug!=='string'||p.slug.length>75||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||typeof p.body!=='string'||!p.body.trim()||p.body.length>40000)return c.json({error:'제목, 주소, 본문 및 게시 상태를 확인해 주세요.'},400)
 const now=new Date().toISOString();const id=p.id||crypto.randomUUID()
 const old=p.id?await c.env.DB.prepare('SELECT slug,type,status FROM posts WHERE id=?').bind(p.id).first():null
 if(p.id&&!old)return c.json({error:'게시물이 없습니다.'},404)
 try{await c.env.DB.prepare('INSERT INTO posts(id,slug,title,body,type,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,body=excluded.body,type=excluded.type,status=excluded.status,updated_at=excluded.updated_at').bind(id,p.slug,p.title.trim(),p.body,p.type,p.status,now,now).run();const changed=[...(p.status==='published'?postPaths(p.type,p.slug):[]),...(old?.status==='published'&&(old.slug!==p.slug||old.type!==p.type||p.status!=='published')?postPaths(old.type,old.slug):[])];if(changed.length)queueIndexNow(c,changed,(p.status==='published'?'publish':'unpublish')+':'+p.type);return c.json({ok:true,id})}catch{return c.json({error:'이미 사용 중인 주소입니다. 다른 주소를 입력해 주세요.'},409)}
})
app.delete('/api/admin/posts/:id',async c=>{const old=await c.env.DB.prepare('SELECT slug,type,status FROM posts WHERE id=?').bind(c.req.param('id')).first();await c.env.DB.prepare('DELETE FROM posts WHERE id=?').bind(c.req.param('id')).run();if(old?.status==='published')queueIndexNow(c,postPaths(old.type,old.slug),'delete:'+old.type);return c.json({ok:true})})
app.post('/api/admin/preview',async c=>{const p=await c.req.json();if(typeof p.body!=='string'||p.body.length>40000)return c.json({error:'본문을 확인해 주세요.'},400);return c.json({html:views(c).renderText(p.body)})})
app.post('/api/admin/upload',async c=>{
 if(!c.env.R2)return c.json({error:'이미지 저장소 연결이 필요합니다.'},503)
 const b=await c.req.arrayBuffer();const a=new Uint8Array(b);let ext='',type='';
 if(a[0]===0xff&&a[1]===0xd8&&a[2]===0xff){ext='jpg';type='image/jpeg'}
 else if(a[0]===0x89&&a[1]===0x50&&a[2]===0x4e&&a[3]===0x47&&a[4]===0x0d&&a[5]===0x0a&&a[6]===0x1a&&a[7]===0x0a){ext='png';type='image/png'}
 else if(new TextDecoder().decode(a.slice(0,4))==='RIFF'&&new TextDecoder().decode(a.slice(8,12))==='WEBP'){ext='webp';type='image/webp'}
 if(!ext)return c.json({error:'JPG, PNG, WebP 이미지 파일만 업로드할 수 있습니다.'},400)
 const key=crypto.randomUUID()+'.'+ext;await c.env.R2.put(key,b,{httpMetadata:{contentType:type}});return c.json({url:'/media/'+key})
})
app.get('/media/:key',async c=>{const key=c.req.param('key');if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))return c.notFound();const published=await c.env.DB?.prepare("SELECT id FROM posts WHERE status='published' AND instr(body,?)>0 LIMIT 1").bind('/media/'+key).first();const content=await loadContent(c.env.DB);const path='/media/'+key;const contentRef=content.doctors.some(d=>d.image===path)||content.videos.some(v=>v.image===path)||content.operations.some(o=>o.verified&&['pricing','parking','accessibility','equipment','careers','legal','sedation'].includes(o.category)&&o.body.includes(']('+path+')'));const caseRef=content.showcases.some(s=>approvedShowcase(s)&&s.category==='case'&&(s.beforeImage===path||s.afterImage===path));const editorialRef=[...content.columns,...content.showcases.filter(approvedShowcase)].some(e=>e.coverImage===path||(e.body.includes(path)&&bodyMedia(e.body).includes(path)));if(!published&&!contentRef&&!caseRef&&!editorialRef&&!await popupImageInUse(c.env.DB,path)&&!['admin','editor','reviewer'].includes((await getActor(c))?.role||''))return c.notFound();const obj=await c.env.R2?.get(key);if(!obj)return c.notFound();c.header('Content-Type',obj.httpMetadata?.contentType||'application/octet-stream');c.header('Cache-Control','private, no-store');return c.body(obj.body)})
// /cases is listed only once at least one consented case is public (thin empty page otherwise).
const publicBase=(c:any)=>basePaths.filter(p=>(p!=='/cases'||publishedEntries(model(c),'showcase').length>0)&&(p!=='/pricing'||model(c).feePageEnabled))
const basePaths=['/','/treatments','/doctors','/mission','/tour','/directions','/reservation','/contents','/video','/faq','/symptom-checker','/cases','/pricing','/careers','/privacy','/terms','/blog','/notice','/encyclopedia','/visiting','/column']
app.get('/sitemap.xml',async c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url);const dated=[...model(c).columns.map(e=>({path:editorialPath('column',e.key),date:e.modifiedAt})),...model(c).showcases.filter(approvedShowcase).map(e=>({path:editorialPath('showcase',e.key),date:e.modifiedAt||''})),...(await posts(c,'blog')).map((p:any)=>({path:'/blog/'+p.slug,date:p.updated_at})),...(await posts(c,'notice')).map((p:any)=>({path:'/notice/'+p.slug,date:p.updated_at}))];const dates=new Map(dated.filter(p=>Number.isFinite(Date.parse(p.date))).map(p=>[p.path,new Date(p.date).toISOString()]));const images=new Map(topics.map(t=>[topicPath(t),t.image]));const list=[...new Set([...publicBase(c),...hubs.map(hubPath),...topics.map(topicPath),...model(c).treatments.map(t=>'/treatments/'+t.slug),...model(c).doctors.map(d=>'/doctors/'+d.slug),...dated.map(p=>p.path)])];c.header('Content-Type','application/xml');return c.body('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+list.map(p=>{const im=images.get(p);return '<url><loc>'+esc(origin+p)+'</loc><lastmod>'+(dates.get(p)||contentDate(p))+'</lastmod>'+(im?'<image:image><image:loc>'+esc(origin+im.og)+'</image:loc></image:image>':'')+'</url>'}).join('')+'</urlset>')})
app.get('/sitemap-languages.xml',async c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),paths=[...publicBase(c),...model(c).treatments.map(t=>'/treatments/'+t.slug),...model(c).doctors.map(d=>'/doctors/'+d.slug),...(await posts(c,'blog')).map((p:any)=>'/blog/'+p.slug),...(await posts(c,'notice')).map((p:any)=>'/notice/'+p.slug)];c.header('Content-Type','application/xml');return c.body('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+locales.flatMap(l=>[...new Set(paths)].map(p=>'<url><loc>'+esc(origin+localPath(p,l))+'</loc></url>')).join('')+'</urlset>')})
// Search and AI answer crawlers are explicitly welcome on public pages; admin/API stay closed for all.
const crawlers=['Googlebot','Bingbot','Yeti','Daumoa','Applebot','DuckDuckBot','GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-User','Claude-SearchBot','anthropic-ai','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended','Meta-ExternalAgent','Amazonbot','DuckAssistBot','MistralAI-User','cohere-ai','CCBot']
app.get('/robots.txt',c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),rules='Allow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /handover\n';return c.text(launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)?crawlers.map(bot=>`User-agent: ${bot}\n${rules}`).join('\n')+`\nUser-agent: *\n${rules}\n# LLMs: ${origin}/llms.txt\n# LLMs-full: ${origin}/llms-full.txt\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/sitemap-languages.xml`:'User-agent: *\nDisallow: /\n# Preview: indexing intentionally disabled.')})
app.get('/llms.txt',c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url);return c.text(llmIndex(model(c),origin,!launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url))+'\n## 공개 칼럼·치료사례\n'+[...model(c).columns.map(e=>({title:e.title,path:editorialPath('column',e.key)})),...model(c).showcases.filter(approvedShowcase).map(e=>({title:e.title,path:editorialPath('showcase',e.key)}))].map(e=>`- [${e.title.replace(/[\[\]\n]/g,' ')}](${origin+e.path})`).join('\n'))})
// Full plain-text reference for AI answer engines: clinic facts, every treatment, clinicians, hubs and public fees.
app.get('/llms-full.txt',c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url),m=model(c),b=m.branches[0],days=['일','월','화','수','목','금','토'];const fees=m.operations.filter(o=>o.category==='pricing'&&o.verified).flatMap(o=>o.items);return c.text([llmIndex(m,origin,!launchIndexable(c.env.PUBLIC_SITE_URL,c.req.url)),'# 상세 안내 (llms-full)','','## 병원 정보',`- 상호: 더굿모닝치과의원 (표시명 더굿모닝치과, 네이버 플레이스 "더굿모닝치과의원 청량리")`,`- 주소: ${b.address} · ${b.station}`,`- 전화: ${b.phone}`,`- 진료시간: ${b.schedule.map((s,i)=>days[i]+' '+(s.replaceAll(',',' / ')||'휴진')).join(' · ')}`,`- ${b.note}`,'- 1990년 강종승 원장 개원, 강도욱 원장이 2대째 같은 자리에서 진료','','## 지역 안내',...hubs.map(h=>`- [${h.keyword}](${origin+hubPath(h)}): ${h.description}`),...topics.map(t=>`- [${t.keyword}](${origin+topicPath(t)}): ${t.description}`),'','## 의료진',...m.doctors.map(d=>`### ${d.name} 원장 — ${d.role}\n${origin}/doctors/${d.slug}\n${d.bio.map(x=>'- '+x).join('\n')}`),'','## 진료 안내',...m.treatments.map(t=>`### ${t.name}\n${origin}/treatments/${t.slug}\n${plain(t.description)}\n${t.details.map(plain).join(' ')}\n주의사항: ${plain(t.risk)}\n${t.faq.map(([q,a])=>`Q. ${plain(q)}\nA. ${plain(a)}`).join('\n')}`),'','## 비급여 진료비 (병원 제공 수가표)',...(fees.length?fees.map(f=>`- ${f.name}: ${f.amount}${f.unit?' / '+f.unit:''}${f.note?' ('+f.note+')':''}`):['- 진료 후 안내']),`원본: ${origin}/pricing`,'','의료정보는 일반적인 이해를 돕기 위한 것으로 진단을 대신하지 않습니다. 치료 방법·기간·효과·부작용은 개인에 따라 다릅니다.'].join('\n'))})
app.get('/feed.xml',async c=>{const origin=siteOrigin(c.env.PUBLIC_SITE_URL,c.req.url);const list=await posts(c,'blog');c.header('Content-Type','application/xml');return c.body(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>더굿모닝 치과 건강정보</title><link>${esc(origin+'/blog')}</link><description>진료와 관리 이야기</description>${list.map((p:any)=>`<item><title>${esc(p.title)}</title><link>${esc(origin+'/blog/'+p.slug)}</link><guid>${esc(origin+'/blog/'+p.slug)}</guid><pubDate>${new Date(p.updated_at).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`)})
app.notFound(c=>render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404))
app.onError((err,c)=>{const incident=crypto.randomUUID();c.header('X-Request-ID',incident);c.header('X-Robots-Tag','noindex, nofollow');console.error(JSON.stringify({event:'request_failed',incident,code:failureCode(err),path:new URL(c.req.url).pathname.replace(/\/api\/.*/, '/api/[redacted]'),ray:c.req.header('cf-ray')||'',frames:err.stack?.split('\n').slice(1,5).map(s=>s.trim().replace(/data:[^ )]+/g,'[bundle]').slice(0,220))}));if(new URL(c.req.url).pathname.startsWith('/api/'))return c.json({error:'요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'},500);return c.html('<html lang="ko"><meta charset="utf-8"><h1>잠시 연결이 원활하지 않습니다.</h1><p>다시 시도하시거나 병원으로 전화해 주세요.</p><a href="/">홈으로</a></html>',500)})
export default app
