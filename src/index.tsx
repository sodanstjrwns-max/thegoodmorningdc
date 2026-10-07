import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { secureHeaders } from 'hono/secure-headers'
import { bodyLimit } from 'hono/body-limit'
import {loadContent,type Content} from './content'
import {createUI,heading,esc,icon} from './ui'
import {createPages} from './pages'
import { glossary } from './glossary'
import {studio} from './studio'
import {channelListing} from './channels'

type Env = { DB:any; R2:any; ASSETS?:{fetch:(request:Request)=>Promise<Response>}; ADMIN_PASSWORD?:string; PUBLIC_SITE_URL?:string }
const app = new Hono<{Bindings:Env;Variables:{content:Content}}>()
app.use('*', secureHeaders({referrerPolicy:'strict-origin-when-cross-origin',xFrameOptions:'DENY',contentSecurityPolicy:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:'],connectSrc:["'self'"],frameSrc:["'self'",'https://www.youtube-nocookie.com'],objectSrc:["'none'"],baseUri:["'self'"],formAction:["'self'"],frameAncestors:["'none'"]}}))
app.use('/static/*',serveStatic({root:'./public'}))
app.use('/api/*',bodyLimit({maxSize:5*1024*1024,onError:c=>c.json({error:'요청 크기가 너무 큽니다. 최대 5MB까지 허용됩니다.'},413)}))
app.use('/api/admin/*',async(c,next)=>{c.header('Cache-Control','no-store');if(!['GET','HEAD'].includes(c.req.method)){const origin=c.req.header('Origin');if(origin!==new URL(c.req.url).origin)return c.json({error:'허용되지 않은 요청입니다.'},403)}await next()})
app.use('*',async(c,next)=>{if(!c.env.PUBLIC_SITE_URL)c.header('X-Robots-Tag','noindex, nofollow');await next()})
app.use('*',async(c,next)=>{const p=new URL(c.req.url).pathname;if(p.length>1&&p.endsWith('/'))return c.redirect(p.slice(0,-1)+new URL(c.req.url).search,301);await next()})
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('')
const random=()=>crypto.randomUUID()+crypto.randomUUID()
async function isAdmin(c:any){const token=getCookie(c,'gm_session');if(!token||!c.env.DB)return false;const row=await c.env.DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await hash(token),Date.now()).first();return !!row}
app.use('*',async(c,next)=>{if(!/^\/(?:static|films|media|api\/admin)(?:\/|$)/.test(new URL(c.req.url).pathname))c.set('content',await loadContent(c.env.DB));await next()})
const model=(c:any):Content=>c.get('content')
const layout=(c:any)=>createUI(model(c))
const views=(c:any)=>createPages(model(c))
const feeds=(c:any)=>channelListing(c.env.DB,model(c),p=>c.executionCtx.waitUntil(p))
const render=(c:any,title:string,content:string,schemas:object[]=[],status=200)=>{const path=new URL(c.req.url).pathname;const origin=c.env.PUBLIC_SITE_URL||new URL(c.req.url).origin;const description=title+' — 더굿모닝치과에서 진료 방법과 주의사항, 관련 의료진 및 내원 안내를 확인하세요. 환자의 불편함을 한 번 더 듣고 상담합니다. '+(model(c)?.branches||[]).map(b=>b.name+' '+b.phone).join(' · ');const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'홈',item:origin+'/'},...(path==='/'?[]:[{'@type':'ListItem',position:2,name:title,item:origin+path}])]};return c.html(layout(c).shell(title,content,path,origin,description,[breadcrumb,...schemas],!!c.env.PUBLIC_SITE_URL&&!path.startsWith('/admin')),status)}
async function posts(c:any,type:string){if(!c.env.DB)return [];const r=await c.env.DB.prepare('SELECT id,slug,title,type,updated_at FROM posts WHERE status=? AND type=? ORDER BY updated_at DESC').bind('published',type).all();return r.results||[]}
app.get('/',c=>render(c,'환자의 불편함을 한 번 더 듣는 치과',layout(c).home()))
app.get('/treatments',c=>render(c,'수면·임플란트·보존·잇몸 진료 안내',views(c).treatmentHub()))
app.get('/treatments/:slug',c=>{const t=model(c).treatments.find(t=>t.slug===c.req.param('slug'));if(!t)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,t.name+' 진료 안내',views(c).treatmentPage(t),[{'@context':'https://schema.org','@type':'MedicalProcedure',name:t.name,description:t.description},{'@context':'https://schema.org','@type':'FAQPage',mainEntity:t.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}])})
app.get('/doctors',c=>render(c,'의료진 소개',views(c).doctorsPage()))
app.get('/doctors/:slug',c=>{const d=model(c).doctors.find(d=>d.slug===c.req.param('slug'));if(!d)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,d.name+' 원장 소개',views(c).doctorPage(d),[{'@context':'https://schema.org','@type':'Person',name:d.name,jobTitle:d.role,worksFor:{'@type':'MedicalOrganization',name:'더굿모닝치과'}}])})
app.get('/mission',c=>render(c,'1990년부터 이어온 더굿모닝의 약속',views(c).missionPage()))
app.get('/tour',c=>render(c,'병원 둘러보기',views(c).tourPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('equipment')}</div></section>`))
app.get('/directions',c=>render(c,'청량리·광명 오시는 길과 진료시간',views(c).directionsPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('parking')}${views(c).operationPanels('accessibility')}</div></section>`))
app.get('/hours',c=>c.redirect('/directions',301))
app.get('/about',c=>c.redirect('/directions',301))
app.get('/reservation',c=>render(c,'전화 상담·예약 안내',views(c).directionsPage(true)+`<section class="content-section"><div class="wrap">${views(c).operationPanels('sedation')}</div></section>`))
app.get('/contents',c=>render(c,'치과 영상·건강정보·백과사전',views(c).contentsPage()))
app.get('/video',async c=>render(c,'원장 설명 영상',views(c).videoPage()+views(c).channelPanel(await feeds(c),'youtube')))
app.get('/faq',c=>render(c,'자주 묻는 질문',views(c).faqPage(),[{'@context':'https://schema.org','@type':'FAQPage',mainEntity:model(c).allFaq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]))
app.get('/symptom-checker',c=>render(c,'증상별 진료 정보 찾기',views(c).checkerPage()))
app.get('/cases',c=>render(c,'치료사례 공개 안내',views(c).casesPage()))
app.get('/pricing',c=>render(c,'비급여 진료비 확인 안내',(model(c).operations.some(o=>o.category==='pricing'&&o.verified)?heading('TREATMENT FEES','비급여 진료비 안내','치료 항목별 금액을 확인하실 수 있습니다. 정확한 치료 계획과 총비용은 진료 후 안내합니다.')+`<section class="content-section"><div class="wrap">${views(c).operationPanels('pricing')}</div></section>`:views(c).pricingPage())))
app.get('/careers',c=>render(c,'채용 문의 안내',views(c).careersPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('careers')}</div></section>`))
app.get('/privacy',c=>render(c,'개인정보 안내',views(c).legalPage()+`<section class="content-section"><div class="wrap">${views(c).operationPanels('legal')}</div></section>`))
app.get('/terms',c=>render(c,'홈페이지 이용 안내',views(c).legalPage(false)))
app.get('/column',async c=>render(c,'대표원장 칼럼 · 인블로그',views(c).columnPage(await feeds(c))))
app.get('/visiting',c=>render(c,'해외·타지역 환자 내원 안내',views(c).visitingPage()))
app.get('/encyclopedia',c=>render(c,'치과 백과사전',heading('DENTAL DICTIONARY','치과에서 들은 그 말,<br>무슨 뜻일까요?',`${glossary.length}개 용어를 쉬운 말로 풀었습니다. 정확한 적용은 진료 시 확인해 주세요.`)+`<section class="content-section"><div class="wrap"><nav class="glossary-index" aria-label="가나다 색인">${['전체','ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','기타'].map((v,i)=>`<button type="button" data-initial="${v}" aria-pressed="${i===0}">${v}</button>`).join('')}</nav><div class="filter-bar"><input id="glossary-search" type="search" aria-label="용어 검색" placeholder="용어 또는 설명 검색" style="margin-left:0;width:100%"></div><div class="content-grid" id="glossary-list">${glossary.map(t=>`<article class="term-card" data-term="${esc(t.term)}" data-search="${esc(t.term+' '+t.description)}"><h3>${t.term}</h3><p>${t.description}</p><a href="/treatments/${t.slug}">관련 진료 보기 ${icon('arrow')}</a></article>`).join('')}</div><p id="glossary-empty" hidden>검색 결과가 없습니다. 다른 용어를 입력해 주세요.</p></div></section>`))
for(const type of ['blog','notice']){
 app.get('/'+type,async c=>render(c,type==='notice'?'병원 소식':'치과 건강정보',views(c).postList(await posts(c,type),type==='notice')+(type==='blog'?views(c).channelPanel(await feeds(c),'naver'):'')))
 app.get('/'+type+'/:slug',async c=>{const p=await c.env.DB?.prepare('SELECT * FROM posts WHERE slug=? AND type=? AND status=?').bind(c.req.param('slug'),type,'published').first();if(!p)return render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404);return render(c,p.title,views(c).postPage(p),[{'@context':'https://schema.org','@type':'Article',headline:p.title,datePublished:p.created_at,dateModified:p.updated_at,author:{'@type':'Organization',name:'더굿모닝치과'}}])})
}
app.get('/api/search',async c=>{const q=(c.req.query('q')||'').trim().toLowerCase().slice(0,100);const items=[...model(c).generalFaq.map(([question,answer])=>({title:question,category:'자주 묻는 질문',url:'/faq',keywords:answer})),...model(c).videos.map(v=>({title:v.title,category:'설명 영상',url:'/video',keywords:v.category})),...(await posts(c,'blog')).map((p:any)=>({title:p.title,category:'건강정보',url:'/blog/'+p.slug,keywords:''})),...model(c).treatments.map(t=>({title:t.name,category:'진료 안내',url:'/treatments/'+t.slug,keywords:[t.description,...t.symptoms,...t.sections.map(s=>s.title),...t.faq.map(([q])=>q)].join(' ')})),...model(c).doctors.map(d=>({title:d.name+' 원장',category:'의료진',url:'/doctors/'+d.slug,keywords:d.role})),...glossary.map(t=>({title:t.term,category:'치과 용어 · 관련 진료',url:'/treatments/'+t.slug,keywords:t.description})),{title:'오시는 길 · 진료시간',category:'병원 안내',url:'/directions',keywords:'위치 청량리 광명 전화 주차 일요일 시간'},{title:'상담 예약',category:'내원 안내',url:'/reservation',keywords:'예약 전화 상담'}];return c.json({results:q?items.filter(t=>(t.title+' '+t.keywords).toLowerCase().includes(q)).slice(0,15):[]})})
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
app.get('/api/health',c=>c.json({ok:true,service:'the-good-morning'}))
app.get('/admin',async c=>{c.header('Cache-Control','no-store');return render(c,'관리자 콘텐츠 스튜디오',views(c).adminPage(await isAdmin(c),!!c.env.ADMIN_PASSWORD))})
app.post('/api/admin/login',async c=>{
 if(!c.env.ADMIN_PASSWORD||!c.env.DB)return c.json({error:'관리자 설정이 필요합니다.'},503)
 const ip=await hash((c.req.header('cf-connecting-ip')||'local')+c.env.ADMIN_PASSWORD);const now=Date.now()
 await c.env.DB.batch([c.env.DB.prepare('DELETE FROM admin_attempts WHERE attempted_at<?').bind(now-15*60*1000),c.env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now)])
 const attempts=await c.env.DB.prepare('SELECT COUNT(*) AS n FROM admin_attempts WHERE ip_hash=?').bind(ip).first()
 if(attempts.n>=5)return c.json({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429)
 const data=await c.req.json().catch(()=>null);const input=typeof data?.password==='string'?data.password:''
 await c.env.DB.prepare('INSERT INTO admin_attempts(ip_hash,attempted_at) VALUES(?,?)').bind(ip,now).run()
 const x=await hash(input);const y=await hash(c.env.ADMIN_PASSWORD);let diff=0;for(let i=0;i<x.length;i++)diff|=x.charCodeAt(i)^y.charCodeAt(i)
 if(diff)return c.json({error:'비밀번호를 확인해 주세요.'},401)
 const token=random();await c.env.DB.batch([c.env.DB.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(await hash(token),now+8*3600*1000),c.env.DB.prepare('DELETE FROM admin_attempts WHERE ip_hash=?').bind(ip)])
 setCookie(c,'gm_session',token,{httpOnly:true,secure:new URL(c.req.url).protocol==='https:',sameSite:'Strict',path:'/',maxAge:8*3600});return c.json({ok:true})
})
app.use('/api/admin/*',async(c,next)=>{if(!await isAdmin(c))return c.json({error:'관리자 로그인이 필요합니다.'},401);await next()})
app.route('/api/admin',studio)
app.post('/api/admin/logout',async c=>{const token=getCookie(c,'gm_session');if(token)await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(token)).run();deleteCookie(c,'gm_session',{path:'/'});return c.json({ok:true})})
app.get('/api/admin/posts',async c=>{const r=await c.env.DB.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all();return c.json({posts:r.results})})
app.post('/api/admin/posts',async c=>{
 const p=await c.req.json().catch(()=>null)
 if(!p||!['blog','notice'].includes(p.type)||!['draft','published'].includes(p.status)||typeof p.title!=='string'||!p.title.trim()||p.title.length>120||typeof p.slug!=='string'||p.slug.length>75||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||typeof p.body!=='string'||!p.body.trim()||p.body.length>40000)return c.json({error:'제목, 주소, 본문 및 게시 상태를 확인해 주세요.'},400)
 const now=new Date().toISOString();const id=p.id||crypto.randomUUID()
 if(p.id&&!await c.env.DB.prepare('SELECT id FROM posts WHERE id=?').bind(p.id).first())return c.json({error:'게시물이 없습니다.'},404)
 try{await c.env.DB.prepare('INSERT INTO posts(id,slug,title,body,type,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,body=excluded.body,type=excluded.type,status=excluded.status,updated_at=excluded.updated_at').bind(id,p.slug,p.title.trim(),p.body,p.type,p.status,now,now).run();return c.json({ok:true,id})}catch{return c.json({error:'이미 사용 중인 주소입니다. 다른 주소를 입력해 주세요.'},409)}
})
app.delete('/api/admin/posts/:id',async c=>{await c.env.DB.prepare('DELETE FROM posts WHERE id=?').bind(c.req.param('id')).run();return c.json({ok:true})})
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
app.get('/media/:key',async c=>{const key=c.req.param('key');if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))return c.notFound();const published=await c.env.DB?.prepare("SELECT id FROM posts WHERE status='published' AND instr(body,?)>0 LIMIT 1").bind('/media/'+key).first();const content=await loadContent(c.env.DB);const path='/media/'+key;const contentRef=content.doctors.some(d=>d.image===path)||content.videos.some(v=>v.image===path)||content.operations.some(o=>o.verified&&['pricing','parking','accessibility','equipment','careers','legal','sedation'].includes(o.category)&&o.body.includes(']('+path+')'));if(!published&&!contentRef&&!await isAdmin(c))return c.notFound();const obj=await c.env.R2?.get(key);if(!obj)return c.notFound();c.header('Content-Type',obj.httpMetadata?.contentType||'application/octet-stream');c.header('Cache-Control','private, no-store');return c.body(obj.body)})
const basePaths=['/','/treatments','/doctors','/mission','/tour','/directions','/reservation','/contents','/video','/faq','/symptom-checker','/cases','/pricing','/careers','/privacy','/terms','/blog','/notice','/encyclopedia','/visiting','/column']
app.get('/sitemap.xml',async c=>{const origin=c.env.PUBLIC_SITE_URL||new URL(c.req.url).origin;const list=[...basePaths,...model(c).treatments.map(t=>'/treatments/'+t.slug),...model(c).doctors.map(d=>'/doctors/'+d.slug),...(await posts(c,'blog')).map((p:any)=>'/blog/'+p.slug),...(await posts(c,'notice')).map((p:any)=>'/notice/'+p.slug)];c.header('Content-Type','application/xml');return c.body('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+list.map(p=>'<url><loc>'+esc(origin+p)+'</loc></url>').join('')+'</urlset>')})
app.get('/robots.txt',c=>c.text(c.env.PUBLIC_SITE_URL?`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nSitemap: ${c.env.PUBLIC_SITE_URL}/sitemap.xml`:'User-agent: *\nDisallow: /\n# Production launch review pending.'))
app.get('/llms.txt',c=>c.text('# 더굿모닝치과\n\n환자의 불편함을 한 번 더 듣는 치과. 1990년 개원.\n\n'+model(c).branches.map(b=>`- ${b.name}: ${b.address}, ${b.phone}`).join('\n')+'\n\n## 진료\n'+model(c).treatments.map(t=>`- [${t.name}](/treatments/${t.slug}): ${t.description}`).join('\n')+'\n\n의료정보는 진단을 대신하지 않습니다. 미리보기 콘텐츠는 병원 확인 전입니다.'))
app.get('/feed.xml',async c=>{const origin=c.env.PUBLIC_SITE_URL||new URL(c.req.url).origin;const list=await posts(c,'blog');c.header('Content-Type','application/xml');return c.body(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>더굿모닝 치과 건강정보</title><link>${esc(origin+'/blog')}</link><description>진료와 관리 이야기</description>${list.map((p:any)=>`<item><title>${esc(p.title)}</title><link>${esc(origin+'/blog/'+p.slug)}</link><guid>${esc(origin+'/blog/'+p.slug)}</guid><pubDate>${new Date(p.updated_at).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`)})
app.notFound(c=>render(c,'페이지를 찾을 수 없습니다',views(c).notFound(),[],404))
app.onError((err,c)=>{console.error('Request failed:',err.message);if(new URL(c.req.url).pathname.startsWith('/api/'))return c.json({error:'요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'},500);return c.html('<html lang="ko"><meta charset="utf-8"><h1>잠시 연결이 원활하지 않습니다.</h1><p>다시 시도하시거나 병원으로 전화해 주세요.</p><a href="/">홈으로</a></html>',500)})
export default app
