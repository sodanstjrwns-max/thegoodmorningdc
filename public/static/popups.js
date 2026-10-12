/* 더굿모닝치과 공지 팝업 — PC(≥768px) 계단식 카드 뭉치, 모바일 한 장씩 넘기기 (esoldc 패턴, CSP: 외부 스크립트) */
(function(){'use strict';
var ov=document.getElementById('gm-popups');if(!ov)return;
var stack=ov.querySelector('.gm-popup-stack'),nav=ov.querySelector('.gm-popup-nav'),ind=ov.querySelector('.gm-popup-ind'),dots=ov.querySelector('.gm-popup-dots'),bar=ov.querySelector('.gm-popup-bar'),count=ov.querySelector('.gm-popup-count'),allBtn=ov.querySelector('.gm-popup-all');
var today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
function hideKey(id){return 'gm-popup-hide-'+id}function closedKey(id){return 'gm-popup-closed-'+id}
function get(store,k){try{return window[store].getItem(k)}catch(e){return null}}function set(store,k,v){try{window[store].setItem(k,v)}catch(e){}}
// 오늘 숨긴 카드(로컬)와 이번 방문에서 닫은 카드(세션)는 다시 띄우지 않음
Array.prototype.slice.call(stack.querySelectorAll('.gm-popup-card')).forEach(function(c){var id=c.getAttribute('data-popup-id');if(get('localStorage',hideKey(id))===today||get('sessionStorage',closedKey(id))==='1')c.parentNode.removeChild(c)});
var order=Array.prototype.slice.call(stack.querySelectorAll('.gm-popup-card'));
if(!order.length){ov.parentNode.removeChild(ov);return}
var mq=window.matchMedia('(max-width:767px)'),idx=0,deckOn=false,locked=false,prevOverflow='',returnFocus=null,opened=false;
function single(){return ov.classList.contains('gm-popup-single')}
function lock(){if(!locked){prevOverflow=document.body.style.overflow;document.body.style.overflow='hidden';locked=true}}
function unlock(){if(locked){document.body.style.overflow=prevOverflow;locked=false}}
function setInter(c,on){Array.prototype.forEach.call(c.querySelectorAll('a,button:not(.gm-popup-peek)'),function(el){if(on)el.removeAttribute('tabindex');else el.setAttribute('tabindex','-1')});var pk=c.querySelector('.gm-popup-peek');if(pk){var back=!on&&deckOn;pk.setAttribute('tabindex',back?'0':'-1');pk.setAttribute('aria-hidden',back?'false':'true')}}
function updateBar(){bar.hidden=!(order.length>1);count.textContent=order.length}
function layout(){
 var n=order.length;deckOn=!mq.matches&&n>1;ov.classList.toggle('gm-popup-deck',deckOn);updateBar();
 if(!deckOn){order.forEach(function(c){c.style.removeProperty('--gm-x');c.style.removeProperty('--gm-y');c.style.zIndex='';c.classList.remove('gm-popup-back');setInter(c,true)});stack.style.width='';stack.style.height='';stack.style.removeProperty('--gm-maxh');stack.style.removeProperty('--gm-dy');ov.style.removeProperty('--gm-w');return}
 var steps=n-1,vw=window.innerWidth-40,vh=window.innerHeight-40-(bar.hidden?0:bar.offsetHeight+10),maxW=0;
 order.forEach(function(c){maxW=Math.max(maxW,c.offsetWidth)});
 var dx=Math.max(10,Math.min(30,(vw-maxW)/steps)),dy=Math.max(18,Math.min(40,vh*.34/steps));
 stack.style.setProperty('--gm-dy',dy+'px');stack.style.setProperty('--gm-maxh',Math.max(260,vh-dy*steps)+'px');
 var w=0,h=0;order.forEach(function(c,k){var s=steps-k;c.style.setProperty('--gm-x',(s*dx)+'px');c.style.setProperty('--gm-y',(s*dy)+'px');c.style.zIndex=String(n-k);c.classList.toggle('gm-popup-back',k>0);setInter(c,k===0);w=Math.max(w,s*dx+c.offsetWidth);h=Math.max(h,s*dy+c.offsetHeight)});
 stack.style.width=w+'px';stack.style.height=h+'px';ov.style.setProperty('--gm-w',w+'px')}
function show(i,dir){var n=order.length;if(!n)return;idx=(i+n)%n;order.forEach(function(c,k){var on=k===idx;c.classList.toggle('gm-popup-active',on);c.style.setProperty('--gm-dx',dir?(dir*40)+'px':'0');setInter(c,on)});ind.textContent=(idx+1)+' / '+n;var d='';for(var k=0;k<n;k++)d+='<i'+(k===idx?' class="on"':'')+'></i>';dots.innerHTML=d;nav.hidden=n<2;stack.classList.toggle('gm-popup-more',n>1);stack.classList.toggle('gm-popup-more2',n>2)}
function front(){return single()?order[idx]:order[0]}
function focusFirst(){var c=front(),b=c&&c.querySelector('.gm-popup-x');if(b){try{b.focus({preventScroll:true})}catch(e){b.focus()}}}
function focusables(){var list=[];if(!bar.hidden)list.push(allBtn);var c=front();if(c)Array.prototype.forEach.call(c.querySelectorAll('.gm-popup-x,a.gm-popup-link,.gm-popup-hide,.gm-popup-close'),function(el){list.push(el)});if(deckOn)order.slice(1).forEach(function(b){var pk=b.querySelector('.gm-popup-peek');if(pk)list.push(pk)});else if(single()&&!nav.hidden){list.push(ov.querySelector('.gm-popup-prev'));list.push(ov.querySelector('.gm-popup-next'))}return list}
function applyMode(){ov.classList.toggle('gm-popup-single',mq.matches);order.forEach(function(c){c.classList.remove('gm-popup-active')});layout();if(mq.matches)show(Math.min(idx,order.length-1),0)}
function open(){if(opened)return;opened=true;returnFocus=document.activeElement;ov.hidden=false;applyMode();requestAnimationFrame(function(){ov.classList.add('show')});lock();setTimeout(focusFirst,60)}
function closeAll(){order.forEach(function(c){set('sessionStorage',closedKey(c.getAttribute('data-popup-id')),'1')});ov.classList.remove('show');unlock();setTimeout(function(){ov.hidden=true},300);if(returnFocus&&returnFocus.focus){try{returnFocus.focus({preventScroll:true})}catch(e){}}}
function removeCard(c,hide){var k=order.indexOf(c);if(k<0)return;var id=c.getAttribute('data-popup-id');set('sessionStorage',closedKey(id),'1');if(hide)set('localStorage',hideKey(id),today);order.splice(k,1);c.classList.add('gm-popup-out');c.classList.remove('gm-popup-back');if(!order.length){closeAll();return}
 if(single()){c.parentNode.removeChild(c);show(Math.min(idx,order.length-1),0);updateBar();setTimeout(focusFirst,0);return}
 layout();setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},260);setTimeout(focusFirst,0)}
function toFront(c){var k=order.indexOf(c);if(k<1)return;order.splice(k,1);order.unshift(c);layout();focusFirst()}
stack.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-popup-act]'),c=e.target.closest&&e.target.closest('.gm-popup-card');
 if(!b){if(c&&deckOn&&c.classList.contains('gm-popup-back')){e.preventDefault();toFront(c)}return}
 e.preventDefault();var act=b.getAttribute('data-popup-act');if(act==='front'){toFront(c);return}removeCard(c,act==='hide')});
allBtn.addEventListener('click',closeAll);
ov.querySelector('.gm-popup-prev').addEventListener('click',function(){show(idx-1,-1);focusFirst()});
ov.querySelector('.gm-popup-next').addEventListener('click',function(){show(idx+1,1);focusFirst()});
var sx=0,sy=0,tracking=false;
stack.addEventListener('touchstart',function(e){if(!single()||e.touches.length!==1)return;tracking=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
stack.addEventListener('touchend',function(e){if(!tracking)return;tracking=false;var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3){if(dx<0)show(idx+1,1);else show(idx-1,-1)}},{passive:true});
ov.addEventListener('click',function(e){if(e.target===ov)closeAll()});
document.addEventListener('keydown',function(e){if(ov.hidden||!ov.classList.contains('show'))return;
 if(e.key==='Escape'){e.preventDefault();var c=front();if(c)removeCard(c,false);return}
 if(e.key==='Tab'){var list=focusables();if(!list.length)return;var i=list.indexOf(document.activeElement);e.preventDefault();var j=i<0?0:(i+(e.shiftKey?-1:1)+list.length)%list.length;try{list[j].focus({preventScroll:true})}catch(err){list[j].focus()}return}
 if(single()){if(e.key==='ArrowRight')show(idx+1,1);else if(e.key==='ArrowLeft')show(idx-1,-1)}});
var raf=0;function relayout(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;if(deckOn&&!ov.hidden)layout()})}
Array.prototype.forEach.call(stack.querySelectorAll('img'),function(im){im.addEventListener('load',relayout)});
window.addEventListener('resize',relayout);
var onMq=function(){if(!ov.hidden)applyMode()};if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);
// 첫 화면을 먼저 보여준 뒤 표시. 다른 대화상자(검색·영상)가 열려 있으면 기다림.
function start(){if(document.querySelector('dialog[open]')){setTimeout(start,1500);return}open()}
setTimeout(start,800);
})();
