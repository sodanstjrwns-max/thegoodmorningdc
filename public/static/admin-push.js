/* 더굿모닝 관리자 — 예약 알림(Web Push) 설정 화면 (dodamdc 패턴) */
(function(){'use strict';
var panel=document.getElementById('push-panel');if(!panel)return;
var $=function(s){return document.querySelector(s)};
var publicKey=panel.getAttribute('data-public-key')||'',configured=panel.getAttribute('data-configured')==='1';
var status=$('#push-status'),hint=$('#push-hint'),enableBtn=$('#push-enable'),testBtn=$('#push-test'),list=$('#push-devices'),count=$('#push-count');
var reg=null,current=null,devices=[];
var ua=navigator.userAgent||'',isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var standalone=navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
var supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
function setStatus(t,kind){status.textContent=t;status.className=kind==='ok'?'push-ok':kind==='err'?'push-err':''}
function setHint(t){hint.textContent=t||'';hint.hidden=!t}
function api(path,body){return fetch('/api/admin/push/'+path,body===undefined?{credentials:'same-origin'}:{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok||j.error)throw new Error(j.error||('요청 실패 ('+r.status+')'));return j})})}
function b64(s){var pad='='.repeat((4-s.length%4)%4),raw=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/')),out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
function label(){var d=/iPad/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'iPad':/iPhone/.test(ua)?'iPhone':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows PC':/Macintosh/.test(ua)?'Mac':'기기';var b=/Edg\//.test(ua)?'Edge':/SamsungBrowser/.test(ua)?'삼성 인터넷':/Whale/.test(ua)?'웨일':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'브라우저';return d+' · '+b+(standalone?' · 홈 화면 앱':'')}
function fmt(v){return v?String(v).slice(0,16).replace('T',' '):''}
function render(){list.textContent='';count.textContent=devices.length+'대';if(!devices.length){var e=document.createElement('li');e.textContent='아직 등록된 기기가 없습니다.';list.appendChild(e);return}
 devices.forEach(function(d){var li=document.createElement('li'),info=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small'),btn=document.createElement('button');li.setAttribute('data-endpoint',d.endpoint);name.textContent=d.label+(current&&current.endpoint===d.endpoint?' (이 기기)':'');meta.textContent=' 등록 '+fmt(d.createdAt)+(d.lastOkAt?' · 마지막 발송 '+fmt(d.lastOkAt):'')+(d.failCount?' · 실패 '+d.failCount+'회':'');info.appendChild(name);info.appendChild(meta);btn.type='button';btn.className='btn outline push-remove';btn.setAttribute('data-endpoint',d.endpoint);btn.textContent='해제';li.appendChild(info);li.appendChild(btn);list.appendChild(li)})}
function here(){return !!(current&&devices.some(function(d){return d.endpoint===current.endpoint}))}
function refresh(){if(!supported)return;if(Notification.permission==='denied'){setStatus('알림 권한이 거부되어 있습니다. 휴대폰 설정(또는 브라우저 사이트 설정)에서 알림을 허용으로 바꾼 뒤 다시 눌러 주세요.','err');enableBtn.disabled=true;testBtn.disabled=true;return}
 if(here()){setStatus('켜짐 — 이 기기로 새 예약 신청 알림을 보냅니다.','ok');enableBtn.textContent='이 기기 다시 등록';enableBtn.disabled=!publicKey;testBtn.disabled=!configured}else{setStatus('꺼짐 — ‘알림 받기’를 눌러 이 기기에서 알림을 켜 주세요.');enableBtn.textContent='알림 받기';enableBtn.disabled=!publicKey;testBtn.disabled=!configured||!devices.length}}
function load(){return api('devices').then(function(j){devices=j.devices||[];render();refresh()})}
function init(){
 if(!supported){if(isIOS&&!standalone){setStatus('아이폰·아이패드는 먼저 홈 화면에 추가해야 알림을 받을 수 있습니다.','err');setHint('사파리 하단 공유 버튼 → ‘홈 화면에 추가’ → 홈 화면의 ‘굿모닝 관리자’ 아이콘으로 열어 로그인한 뒤 이 화면에서 ‘알림 받기’를 눌러 주세요.')}else setStatus('이 브라우저는 알림을 지원하지 않습니다. 크롬·엣지·사파리(iOS 16.4 이상)를 사용해 주세요.','err');enableBtn.disabled=true;load().catch(function(e){setStatus(e.message,'err')});return}
 if(isIOS&&!standalone)setHint('아이폰은 홈 화면에 추가한 ‘굿모닝 관리자’ 아이콘으로 연 화면에서 켜야 알림이 도착합니다.');
 if(!publicKey){setStatus('서버에 알림 키가 설정되지 않았습니다. 제작 담당자에게 문의하세요.','err');enableBtn.disabled=true}
 navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(r){reg=r;return r.pushManager.getSubscription()}).then(function(sub){current=sub;return load()}).catch(function(e){setStatus('알림 준비 실패: '+e.message,'err')})}
enableBtn.addEventListener('click',function(){enableBtn.disabled=true;setStatus('권한을 요청하는 중…');Promise.resolve(Notification.requestPermission()).then(function(perm){if(perm!=='granted'){refresh();if(perm==='default')setStatus('‘허용’을 선택하지 않아 켜지지 않았습니다. 다시 눌러 주세요.','err');return}
 return (reg?Promise.resolve(reg):navigator.serviceWorker.ready).then(function(r){reg=r;return r.pushManager.getSubscription().then(function(sub){return sub||r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(publicKey)})})}).then(function(sub){current=sub;return api('subscribe',{subscription:sub.toJSON(),label:label()})}).then(function(j){devices=j.devices||[];render();refresh()})}).catch(function(e){refresh();setStatus('알림을 켜지 못했습니다: '+(e&&e.message?e.message:e),'err')})});
testBtn.addEventListener('click',function(){testBtn.disabled=true;api('test',{endpoint:here()?current.endpoint:null}).then(function(j){devices=j.devices||[];render();refresh();setStatus(j.sent?'테스트 알림을 보냈습니다('+j.sent+'대). 잠시 후 알림이 표시됩니다.':'발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',j.sent?'ok':'err')}).catch(function(e){setStatus(e.message,'err');testBtn.disabled=false})});
list.addEventListener('click',function(ev){var btn=ev.target.closest('.push-remove');if(!btn)return;var endpoint=btn.getAttribute('data-endpoint');if(!confirm('이 기기의 알림을 해제할까요?'))return;btn.disabled=true;var local=current&&current.endpoint===endpoint?current.unsubscribe().catch(function(){}):Promise.resolve();local.then(function(){if(current&&current.endpoint===endpoint)current=null;return api('unsubscribe',{endpoint:endpoint})}).then(function(j){devices=j.devices||[];render();refresh();setStatus('알림을 해제했습니다.')}).catch(function(e){setStatus(e.message,'err');btn.disabled=false})});
init();
})();
