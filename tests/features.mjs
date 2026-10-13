// Features33: 예약 상담 신청·웹 푸시·수가 관리·공지 팝업·IndexNow 자동 제출 (local synthetic data only).
// Run against a local server: TEST_URL=http://localhost:3011 node tests/features.mjs
import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const base=process.env.TEST_URL||'http://localhost:3000';assert.match(base,/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/,'Local synthetic tests only (creates and deletes records)')
// ---- unit: slot availability, IndexNow URL list, fee guard ----
const bundle=async entry=>import('data:text/javascript;base64,'+Buffer.from((await build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'neutral',external:['@block65/webcrypto-web-push']})).outputFiles[0].text.replace(/^import .*@block65.*$/m,'const buildPushPayload=()=>{throw Error("not in unit test")};')).toString('base64'))
const {slotAvailable}=await bundle('src/reservations.ts'),{indexNowUrls,submitIndexNow}=await bundle('src/indexnow.ts'),{checkFeeItems}=await bundle('src/fees.ts')
const branch={schedule:['10:00-14:00','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,15:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-14:00'],exceptions:[{date:'2026-10-20',hours:'',note:'휴진'}]}
assert.equal(slotAvailable(branch,'2026-10-14','afternoon'),true);assert.equal(slotAvailable(branch,'2026-10-17','afternoon'),false,'Saturday afternoon');assert.equal(slotAvailable(branch,'2026-10-18','morning'),true,'Sunday morning');assert.equal(slotAvailable(branch,'2026-10-20','any'),false,'closed exception')
assert.deepEqual(indexNowUrls('https://x.kr',['/column/a','/notice/b','/treatments/c','//evil']),['https://x.kr/column/a','https://x.kr/notice/b','https://x.kr/en/notice/b','https://x.kr/treatments/c','https://x.kr/en/treatments/c'])
let calls=0;const fakeDb={prepare:()=>({bind:()=>({run:async()=>({})}),first:async()=>null})}
const dry=await submitIndexNow({DB:fakeDb},'https://x.kr',false,['/notice/a'],'test',async()=>{calls++;return new Response('')});assert.equal(dry.mode,'dry-run');assert.equal(calls,0)
const live=await submitIndexNow({DB:fakeDb},'https://x.kr',true,['/notice/a'],'test',async(u,o)=>{calls++;const b=JSON.parse(o.body);assert.equal(b.key,'98fd1c7b41dc3340ee91b700aef8397d');assert.equal(b.keyLocation,'https://x.kr/98fd1c7b41dc3340ee91b700aef8397d.txt');return new Response('',{status:202})});assert.equal(calls,2);assert.deepEqual(live.results.map(r=>r.status),[202,202])
const failing=await submitIndexNow({DB:{prepare:()=>{throw Error('db down')}}},'https://x.kr',true,['/notice/a'],'test',async()=>{throw Error('offline')});assert.deepEqual(failing.results.map(r=>r.status),['network-error','network-error'],'IndexNow failure never throws')
assert.throws(()=>checkFeeItems([{name:'임플란트 이벤트',amount:'50만원',unit:'',note:'',hidden:false}]),/의료법/);assert.throws(()=>checkFeeItems([{name:'미백',amount:'30% 할인',unit:'',note:''}]),/의료법/);assert.throws(()=>checkFeeItems([]),/1~100/)
assert.equal(checkFeeItems([{name:' 미백 ',amount:'15~30만원 / 1회',unit:'',note:'',hidden:true}])[0].name,'미백')
// ---- browser/API against the local server ----
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']}),ip=()=>'198.51.100.'+(1+Math.floor(Math.random()*250))
const admin=await browser.newContext({reducedMotion:'reduce'}),errors=[],csp=[],cleanup=[]
const api=(path,method='GET',data)=>admin.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data===undefined?{}:{data})})
const json=async r=>{const t=await r.text();assert.ok(r.ok(),t);return JSON.parse(t)}
const password=fs.readFileSync('.dev.vars','utf8').match(/ADMIN_PASSWORD="([^"]+)"/)[1];await json(await api('login','POST',{password}))
const kst=n=>new Date(Date.now()+9*3600000+n*86400000).toISOString().slice(0,10)
const weekday=()=>{for(let n=1;n<10;n++){const d=new Date(kst(n)+'T00:00:00Z').getUTCDay();if(d>=1&&d<=5&&d!==3)return kst(n)}}
const saturday=()=>{for(let n=1;n<10;n++)if(new Date(kst(n)+'T00:00:00Z').getUTCDay()===6)return kst(n)}
try{
 // 1. Reservation request form (KO) — browser submit, inbox, statuses, roles
 const anon=await browser.newContext({reducedMotion:'reduce',extraHTTPHeaders:{'cf-connecting-ip':ip()}}),page=await anon.newPage()
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/Content Security Policy/i.test(m.text()))csp.push(m.text())})
 await page.goto(base+'/reservation?treatment=sedation#reservation-form');const form=page.locator('[data-request-kind="reservation"]')
 assert.equal(await form.locator('[name=treatment]').inputValue(),'sedation','prefill from treatment CTA')
 for(const sel of ['[name=name]','[name=contact]','[name=preferredDate]','[name=timeSlot]','[name=consent]'])assert.equal(await form.locator(sel).getAttribute('required'),'','required '+sel)
 assert.ok(await page.locator('.reservation-intro').isVisible());assert.ok(await page.locator('.request-privacy summary').count())
 await form.locator('[name=name]').fill('QA LOCAL 예약');await form.locator('[name=contact]').fill('010-0000-0000');await form.locator('[name=preferredDate]').fill(weekday());await form.locator('[name=timeSlot]').selectOption('afternoon');await form.locator('[name=message]').fill('QA synthetic');await form.locator('[name=consent]').check()
 await form.locator('button[type=submit]').click();await page.waitForFunction(()=>/접수되었습니다/.test(document.querySelector('[data-request-kind="reservation"] .request-result')?.textContent||''))
 const id=(await form.locator('.request-result').textContent()).match(/[0-9a-f-]{36}/)[0];cleanup.push(id)
 let inbox=(await json(await api('requests'))).requests,item=inbox.find(r=>r.id===id)
 assert.equal(item.kind,'reservation');assert.equal(item.status,'new');assert.equal(item.data.treatment,'sedation');assert.equal(item.data.timeSlot,'afternoon');assert.equal(item.data.consentVersion,'2026-10-13-v4');assert.ok(item.expiresAt-item.createdAt>=89*86400000)
 // invalid submissions
 const submit=(fields,ipAddr=ip())=>anon.request.post(base+'/api/requests/reservation',{headers:{Origin:base,'cf-connecting-ip':ipAddr},multipart:{locale:'ko',name:'QA',contact:'010-1111-2222',treatment:'consult',preferredDate:weekday(),timeSlot:'morning',consent:'yes',...fields}})
 assert.equal((await submit({consent:''})).status(),400,'consent required');assert.equal((await submit({contact:'abc'})).status(),400,'phone format')
 assert.equal((await submit({preferredDate:kst(-1)})).status(),400,'past date');assert.equal((await submit({preferredDate:kst(61)})).status(),400,'beyond window')
 assert.equal((await submit({preferredDate:saturday(),timeSlot:'afternoon'})).status(),400,'weekend afternoon');assert.equal((await submit({treatment:'not-a-treatment'})).status(),400)
 assert.equal((await submit({website:'http://spam'})).status(),400,'honeypot');assert.equal((await anon.request.post(base+'/api/requests/reservation',{headers:{Origin:'https://attacker.invalid'},multipart:{name:'x'}})).status(),403)
 const en=await submit({locale:'en',consent:''});assert.match((await en.json()).error,/consent/i,'English error for /en form')
 const limitIp=ip();let last;for(let i=0;i<6;i++){last=await submit({message:'QA rate '+i},limitIp);if(last.status()===201)cleanup.push((await last.json()).id)}assert.equal(last.status(),429,'rate limit 5/hour')
 // statuses + memo (admin and coordinator), other roles blocked
 assert.equal((await api('requests/'+id,'POST',{status:'closed',note:'',revision:item.revision})).status(),400,'reservation statuses only')
 await json(await api('requests/'+id,'POST',{status:'contacted',note:'QA 전화 완료',revision:item.revision}))
 const stamp=Date.now().toString(36),coord=await json(await api('users','POST',{username:'qa-feat-coord-'+stamp,name:'QA LOCAL coordinator',role:'coordinator'})),editor=await json(await api('users','POST',{username:'qa-feat-editor-'+stamp,name:'QA LOCAL editor',role:'editor'}))
 const coordCtx=await browser.newContext(),editorCtx=await browser.newContext(),as=(ctx,path,method='GET',data)=>ctx.request.fetch(base+'/api/admin/'+path,{method,headers:{Origin:base},...(data===undefined?{}:{data})})
 await json(await as(coordCtx,'login','POST',{username:'qa-feat-coord-'+stamp,password:coord.initialPassword}));await json(await as(editorCtx,'login','POST',{username:'qa-feat-editor-'+stamp,password:editor.initialPassword}))
 item=(await json(await as(coordCtx,'requests'))).requests.find(r=>r.id===id);assert.equal(item.note,'QA 전화 완료')
 await json(await as(coordCtx,'requests/'+id,'POST',{status:'confirmed',note:'QA 예약확정',revision:item.revision}))
 for(const p of ['requests','fees','popups','indexnow-log','push/devices'])assert.equal((await as(editorCtx,p)).status(),403,'editor blocked '+p)
 for(const p of ['fees','popups','indexnow-log'])assert.equal((await as(coordCtx,p)).status(),403,'coordinator blocked '+p)
 assert.equal((await as(coordCtx,'push/devices')).status(),200,'coordinator may register push devices')
 // admin inbox UI renders reservation labels
 const adminPage=await admin.newPage();adminPage.on('pageerror',e=>errors.push(e.message));await adminPage.goto(base+'/admin');await adminPage.waitForSelector(`[data-request="${id}"]`)
 assert.match(await adminPage.locator(`[data-request="${id}"] h3`).textContent(),/^예약 상담 · QA LOCAL 예약/);assert.equal(await adminPage.locator(`[data-request="${id}"] [data-request-status] option:checked`).textContent(),'예약확정')
 assert.deepEqual(await adminPage.locator(`[data-request="${id}"] [data-request-status] option`).allTextContents(),['신규','연락완료','예약확정','취소'])
 assert.match(await adminPage.locator(`[data-request="${id}"] dl`).textContent(),/희망 진료수면치료|희망 진료/)
 // 2. Web push: zero devices never throws; device registration and failed delivery are handled
 let push=await json(await api('push/devices'));assert.equal(push.configured,true,'.dev.vars test VAPID keys');assert.match(push.publicKey,/^[A-Za-z0-9_-]{80,}$/)
 for(const d of push.devices)await api('push/unsubscribe','POST',{endpoint:d.endpoint})
 assert.equal((await api('push/test','POST',{})).status(),404,'no devices')
 const endpoint='https://push.invalid/qa-'+Date.now(),key=Buffer.concat([Buffer.from([4]),Buffer.alloc(64,7)]).toString('base64url')
 push=await json(await api('push/subscribe','POST',{subscription:{endpoint,keys:{p256dh:key,auth:Buffer.alloc(16,1).toString('base64url')}},label:'QA LOCAL device'}));assert.ok(push.devices.some(d=>d.endpoint===endpoint))
 const sent=await json(await api('push/test','POST',{endpoint}));assert.equal(sent.sent,0);assert.equal(sent.failed+sent.removed>=1,true,'failed delivery is reported, not thrown')
 await json(await api('push/unsubscribe','POST',{endpoint}))
 assert.equal((await api('push/subscribe','POST',{subscription:{endpoint:'http://insecure',keys:{p256dh:key,auth:'x'}}})).status(),400)
 await adminPage.goto(base+'/admin/notifications');assert.equal(await adminPage.locator('h1').textContent(),'알림 설정');await adminPage.waitForFunction(()=>!/확인 중/.test(document.querySelector('#push-status').textContent))
 assert.equal(await adminPage.locator('#push-enable').textContent(),'알림 받기');assert.equal(await adminPage.locator('#push-test').count(),1);assert.match(await adminPage.content(),/홈 화면에 추가/)
 assert.equal(await adminPage.locator('link[rel=manifest]').getAttribute('href'),'/admin/manifest.webmanifest')
 const manifest=await (await adminPage.request.get(base+'/admin/manifest.webmanifest')).json();assert.equal(manifest.display,'standalone');const sw=await adminPage.request.get(base+'/sw.js');assert.equal(sw.status(),200);assert.match(await sw.text(),/showNotification/)
 assert.equal((await anon.request.get(base+'/admin/notifications',{maxRedirects:0})).status(),302,'anonymous redirected')
 // 3. Fee manager: item toggle, reorder, page switch; published data restored exactly
 const fees=await json(await api('fees')),entry=fees.entries.find(e=>e.key==='fees-0324-review');assert.equal(entry.items.length,32);assert.equal(fees.page.enabled,true)
 const original=entry.items.map(i=>({...i}))
 const hidden=original.map((i,n)=>n===0?{...i,hidden:true}:i);[hidden[1],hidden[2]]=[hidden[2],hidden[1]]
 let saved=await json(await api('fees/fees-0324-review','POST',{revision:entry.revision,items:hidden}));assert.equal(saved.visible,31)
 assert.equal((await api('fees/fees-0324-review','POST',{revision:entry.revision,items:hidden})).status(),409,'stale revision')
 assert.equal((await api('fees/fees-0324-review','POST',{revision:saved.revision,items:[{name:'임플란트',amount:'80만원 → 50만원',unit:'',note:''}]})).status(),400,'promotion guard')
 const pricing=await anon.newPage();await pricing.goto(base+'/pricing');assert.match(await pricing.locator('.pricing-panel caption').textContent(),/31개 항목/);assert.equal(await pricing.locator('.pricing-panel th[scope=row]',{hasText:'레진 코어'}).count(),0);assert.equal(await pricing.locator('a.pricing-source[href="/static/fees-0324.pdf"]').count(),1,'original PDF link kept')
 assert.equal(await pricing.locator('.footer-fees li',{hasText:'레진 코어'}).count(),0,'hidden item not in footer summary');assert.doesNotMatch(await (await anon.request.get(base+'/llms-full.txt')).text(),/레진 코어/)
 let page2=await json(await api('fees-page','POST',{enabled:false,revision:fees.page.revision}));assert.equal(page2.page.enabled,false)
 await pricing.goto(base+'/pricing');assert.equal(await pricing.locator('.pricing-panel').count(),0);assert.match(await pricing.locator('meta[name=robots]').getAttribute('content'),/noindex/);assert.equal(await pricing.locator('.footer-fees').count(),0)
 assert.doesNotMatch(await (await anon.request.get(base+'/sitemap.xml')).text(),/\/pricing</);assert.doesNotMatch(await (await anon.request.get(base+'/llms-full.txt')).text(),/80만원/)
 page2=await json(await api('fees-page','POST',{enabled:true,revision:page2.page.revision}));assert.equal(page2.page.enabled,true)
 const now=(await json(await api('fees'))).entries.find(e=>e.key==='fees-0324-review');await json(await api('fees/fees-0324-review','POST',{revision:now.revision,items:original}))
 await pricing.goto(base+'/pricing');assert.match(await pricing.locator('.pricing-panel caption').textContent(),/32개 항목/);assert.match(await (await anon.request.get(base+'/sitemap.xml')).text(),/\/pricing</)
 // admin fee editor UI
 await adminPage.goto(base+'/admin');await adminPage.locator('[data-feature="fees"]').click();await adminPage.waitForSelector('#fee-rows tr');assert.equal(await adminPage.locator('#fee-rows tr').count(),32);assert.match(await adminPage.locator('#fee-summary').textContent(),/공개 32개/)
 // 4. Popups: max 10, deck on PC, single card on mobile, hide-today, Esc, no CSP/inline script
 const made=[];for(let i=0;i<3;i++){const r=await json(await api('popups','POST',{title:'QA LOCAL 공지 '+(i+1),body:'QA 팝업 본문 '+(i+1),image:'',image_alt:'',link_url:i===0?'/notice':'',start_date:kst(0),end_date:kst(3),enabled:true}));made.push(r.id)}
 const extra=await json(await api('popups','POST',{title:'QA LOCAL 예약 공지',body:'미래',image:'',image_alt:'',link_url:'',start_date:kst(5),end_date:'',enabled:true}));made.push(extra.id)
 assert.equal((await api('popups','POST',{title:'bad',body:'x',image:'',image_alt:'',link_url:'javascript:alert(1)',start_date:'',end_date:'',enabled:true})).status(),400,'unsafe link')
 assert.equal((await api('popups','POST',{title:'bad',body:'',image:'',image_alt:'',link_url:'',start_date:'',end_date:'',enabled:true})).status(),400,'image or body required')
 const fill=[];while(made.length+fill.length<10)fill.push((await json(await api('popups','POST',{title:'QA LOCAL fill',body:'x',image:'',image_alt:'',link_url:'',start_date:'',end_date:'',enabled:false}))).id)
 assert.equal((await api('popups','POST',{title:'QA LOCAL 11',body:'x',image:'',image_alt:'',link_url:'',start_date:'',end_date:'',enabled:false})).status(),400,'max 10')
 for(const f of fill){const p=(await json(await api('popups'))).popups.find(x=>x.id===f);await json(await api('popups/'+f+'?revision='+p.revision,'DELETE'))}
 const list=(await json(await api('popups'))).popups;assert.deepEqual(list.filter(p=>made.includes(p.id)).map(p=>p.active),[true,true,true,false])
 const desk=await browser.newContext({viewport:{width:1440,height:900}}),dp=await desk.newPage();dp.on('pageerror',e=>errors.push(e.message));dp.on('console',m=>{if(/Content Security Policy/i.test(m.text()))csp.push(m.text())})
 await dp.goto(base+'/');const cls0=await dp.evaluate(()=>{let v=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)v+=e.value}).observe({type:'layout-shift',buffered:true});window.__cls=()=>v;return 0})
 await dp.waitForSelector('#gm-popups.show');assert.equal(await dp.locator('#gm-popups').getAttribute('role'),'dialog');assert.equal(await dp.locator('#gm-popups .gm-popup-card').count(),3,'only active popups');assert.ok(await dp.locator('#gm-popups').evaluate(e=>e.classList.contains('gm-popup-deck')),'PC deck')
 assert.equal(await dp.evaluate(()=>document.querySelectorAll('script:not([src]):not([type])').length),0,'no inline scripts');assert.equal(await dp.evaluate(()=>document.activeElement?.classList.contains('gm-popup-x')),true,'focus moves into popup')
 assert.equal(await dp.locator('.gm-popup-card.gm-popup-back').count(),2);await dp.locator('.gm-popup-card.gm-popup-back .gm-popup-peek').first().click();
 await dp.keyboard.press('Escape');await dp.waitForFunction(()=>document.querySelectorAll('#gm-popups .gm-popup-card:not(.gm-popup-out)').length===2)
 await dp.locator('.gm-popup-card:not(.gm-popup-back):not(.gm-popup-out) .gm-popup-hide').click();await dp.waitForFunction(()=>Object.keys(localStorage).some(k=>k.startsWith('gm-popup-hide-')))
 await dp.locator('.gm-popup-all').count();await dp.keyboard.press('Escape');await dp.waitForSelector('#gm-popups',{state:'hidden'});assert.equal(await dp.evaluate(()=>document.body.style.overflow),'','scroll restored')
 assert.ok(await dp.evaluate(()=>window.__cls())<0.05,'popup causes no layout shift')
 await dp.goto(base+'/treatments');await dp.waitForTimeout(1300);assert.equal(await dp.locator('#gm-popups.show').count(),0,'closed popups stay closed this visit')
 const mob=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),mp=await mob.newPage();mp.on('pageerror',e=>errors.push(e.message))
 await mp.goto(base+'/directions');await mp.waitForSelector('#gm-popups.show');assert.ok(await mp.locator('#gm-popups').evaluate(e=>e.classList.contains('gm-popup-single')));assert.equal(await mp.locator('.gm-popup-card.gm-popup-active').count(),1,'one card at a time on mobile')
 assert.equal(await mp.locator('.gm-popup-ind').textContent(),'1 / 3');await mp.locator('.gm-popup-next').click();assert.equal(await mp.locator('.gm-popup-ind').textContent(),'2 / 3');assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await mp.locator('.gm-popup-card.gm-popup-active .gm-popup-close').click();assert.equal(await mp.locator('.gm-popup-ind').textContent(),'2 / 2')
 assert.equal(await mp.locator('.mobile-bottom .branch-request').getAttribute('href'),'/reservation#reservation-form');for(const c of ['branch-phone','branch-kakao','branch-booking'])assert.equal(await mp.locator('.mobile-bottom .'+c).count(),1,'mobile bar keeps '+c)
 await mp.goto(base+'/treatments/implant-revision');assert.match(await mp.locator('.contextual-contact a').first().getAttribute('href'),/^\/reservation\?treatment=implant-revision#reservation-form$/)
 assert.equal(await (await anon.newPage()).goto(base+'/admin').then(()=>0),0)
 // admin popup manager renders
 await adminPage.goto(base+'/admin');await adminPage.locator('[data-feature="popups"]').click();await adminPage.waitForSelector('.popup-admin-list li');assert.equal(await adminPage.locator('.popup-admin-list li').count(),4);await adminPage.locator('#popup-new').click();assert.equal(await adminPage.locator('.popup-form [name=title]').count(),1)
 // image popup: uploaded R2 image is public only while an enabled popup uses it; in-use images cannot be deleted
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'),up=await json(await admin.request.post(base+'/api/admin/upload',{headers:{Origin:base},data:png}))
 assert.equal((await api('popups','POST',{title:'QA LOCAL 이미지',body:'',image:up.url,image_alt:'',link_url:'',start_date:'',end_date:'',enabled:true})).status(),400,'alt required')
 const imgPopup=await json(await api('popups','POST',{title:'QA LOCAL 이미지',body:'',image:up.url,image_alt:'QA 이미지 설명',link_url:'',start_date:'',end_date:'',enabled:true}));made.push(imgPopup.id)
 assert.equal((await anon.request.get(base+up.url)).status(),200,'popup image public while enabled');assert.equal((await api('media-library/'+up.url.slice(7),'DELETE')).status(),409,'in-use image protected')
 let ip2=(await json(await api('popups'))).popups.find(x=>x.id===imgPopup.id);await json(await api('popups','POST',{...ip2,enabled:false}));assert.equal((await anon.request.get(base+up.url)).status(),404,'disabled popup image private')
 for(const id2 of made){const p=(await json(await api('popups'))).popups.find(x=>x.id===id2);await json(await api('popups/'+id2+'?revision='+p.revision,'DELETE'))}
 await json(await api('media-library/'+up.url.slice(7),'DELETE'))
 // 5. IndexNow: publishing/unpublishing a notice queues a (local = dry-run) submission and never blocks
 const slug='qa-feat-notice-'+Date.now(),post=await json(await api('posts','POST',{type:'notice',status:'published',title:'QA LOCAL IndexNow',slug,body:'QA synthetic'}))
 await json(await api('posts','POST',{id:post.id,type:'notice',status:'draft',title:'QA LOCAL IndexNow',slug,body:'QA synthetic'}));await json(await api('posts/'+post.id,'DELETE'))
 let log=[];for(let i=0;i<20&&log.filter(e=>e.urls.some(u=>u.endsWith('/notice/'+slug))).length<2;i++){await new Promise(r=>setTimeout(r,300));log=(await json(await api('indexnow-log'))).log}
 const mine=log.filter(e=>e.urls.some(u=>u.endsWith('/notice/'+slug)));assert.deepEqual(mine.map(e=>e.reason).sort(),['publish:notice','unpublish:notice']);assert.ok(mine.every(e=>e.mode==='dry-run'&&!e.results.length),'local never pings real endpoints')
 assert.ok(mine[0].urls.includes(base+'/en/notice/'+slug))
 await adminPage.locator('[data-feature="indexnow"]').click();await adminPage.waitForSelector('#feature-content table');
 // Handover guide documents all four features and drops the old 'not available' statements
 const guide=(await (await anon.request.get(base+'/handover')).text()).replace(/<[^>]+>/g,'')
 for(const term of ['예약 알림을 휴대폰으로 받는 법','홈 화면에 추가','알림 받기','테스트 알림 보내기','예약 접수함 사용법','수가 공개 ON/OFF','공지 팝업 올리기','발행 시 자동 색인 제출','15,000,000원'])assert.ok(guide.includes(term),'handover '+term)
 assert.doesNotMatch(guide,/별도 팝업 기능이 있는 것처럼|일반 진료 상담은 전화·네이버 예약·카카오·톡톡 등 연결된 채널에서 확인|자동 이메일 알림은 현재 연결되지 않았으므로|\*\*/)
 // 6. Privacy policy + EN parity
 const privacy=await (await anon.request.get(base+'/privacy')).text();assert.match(privacy,/홈페이지 예약 상담 신청: .*1년/);assert.match(privacy,/2026년 10월 13일/);assert.doesNotMatch(privacy,/자동 이메일 알림 서비스는 연결되어 있지 않습니다/)
 const enPrivacy=await (await anon.request.get(base+'/en/privacy')).text();assert.match(enPrivacy,/Online reservation requests/);assert.match(enPrivacy,/web push alert/)
 const enRes=await (await anon.request.get(base+'/en/reservation')).text(),formHtml=enRes.slice(enRes.indexOf('id="reservation-form"'),enRes.indexOf('</form>',enRes.indexOf('id="reservation-form"')));assert.doesNotMatch(formHtml.replace(/<[^>]+>/g,' '),/[가-힣]/,'EN reservation form fully translated')
 assert.deepEqual(errors,[]);assert.deepEqual(csp,[])
 console.log('Features33 PASS: reservation form/inbox/roles/limits, push routes, fee manager/page switch, popups deck/mobile/hide-today, IndexNow dry-run log, privacy KO/EN')
}finally{
 for(const id of cleanup){const r=(await json(await api('requests'))).requests.find(x=>x.id===id);if(r)await api('requests/'+id+'?revision='+r.revision,'DELETE')}
 for(const u of (await json(await api('users'))).users.filter(u=>u.username.startsWith('qa-feat-')&&u.enabled))await api('users/'+u.id,'POST',{revision:u.revision,name:u.name,role:u.role,enabled:false})
 await browser.close()
}
