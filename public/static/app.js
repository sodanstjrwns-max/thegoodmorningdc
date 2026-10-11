(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3500)}
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),root=document.documentElement;
const siteMotionButton=$('#site-motion-toggle');let sitePaused=false;
try{sitePaused=sessionStorage.getItem('gm_motion')==='off'}catch{}
const slowConnection=()=>['slow-2g','2g','3g'].includes(navigator.connection?.effectiveType);
const motionAllowed=()=>!motionPreference.matches&&!navigator.connection?.saveData&&!slowConnection()&&!sitePaused;
function syncSiteMotion(){
 const allowed=motionAllowed();root.classList.toggle('motion-enabled',allowed);root.classList.toggle('motion-off',!allowed);
 if(siteMotionButton){siteMotionButton.hidden=false;siteMotionButton.disabled=motionPreference.matches||!!navigator.connection?.saveData||slowConnection();siteMotionButton.setAttribute('aria-pressed',String(!allowed));siteMotionButton.setAttribute('aria-label',allowed?'사이트 전체 모션 끄기':'사이트 전체 모션 켜기');siteMotionButton.lastElementChild.textContent=allowed?'모션 ON':'모션 OFF'}
 if(!allowed)$$('.type-ready,.lift-ready').forEach(el=>el.classList.add('type-visible','lift-visible'));
 document.dispatchEvent(new Event('site-motion-change'));
}
siteMotionButton?.addEventListener('click',()=>{sitePaused=!sitePaused;try{sessionStorage.setItem('gm_motion',sitePaused?'off':'on')}catch{}syncSiteMotion()});
motionPreference.addEventListener('change',syncSiteMotion);navigator.connection?.addEventListener?.('change',syncSiteMotion);
// Retain the original heading structure and accessible name; only visual glyphs are split.
if(!location.pathname.startsWith('/admin')){
 $$('#main h1,#main h2,.closing-inner h2').forEach(heading=>{
  if(heading.querySelector('button,input,a')||!motionAllowed())return;
  const copy=heading.cloneNode(true);$$('br',copy).forEach(br=>br.replaceWith(' '));
  heading.setAttribute('aria-label',heading.getAttribute('aria-label')||copy.textContent.replace(/\s+/g,' ').trim());
  const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),nodes=[];let node,index=0;
  while(node=walker.nextNode())if(node.textContent.trim())nodes.push(node);
  nodes.forEach(text=>{const fragment=document.createDocumentFragment();text.textContent.split(/(\s+)/).forEach(word=>{
   if(!word.trim()){fragment.append(document.createTextNode(word));return}
   const group=document.createElement('span');group.className='kinetic-word';group.setAttribute('aria-hidden','true');
   for(const character of word){const glyph=document.createElement('span');glyph.className='kinetic-char';glyph.textContent=character;glyph.style.setProperty('--char-index',String(Math.min(index++,40)));group.append(glyph)}fragment.append(group)
  });text.replaceWith(fragment)});heading.classList.add('type-ready');
 });
 $$('.strength-card,.specialty-card,.doctor-card,.video-card,.info-card,.philosophy-story,.section-title-row>p,.mission-story-layout figure,.clinic-story-photo').forEach((el,i)=>{el.classList.add('lift-ready');el.style.setProperty('--lift-delay',(i%3)*70+'ms');if(el.matches('figure,.clinic-story-photo'))el.classList.add('image-reveal')});
 if('IntersectionObserver'in window){const reveal=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('type-visible','lift-visible');reveal.unobserve(target)}}),{threshold:.06});$$('.type-ready,.lift-ready').forEach(el=>reveal.observe(el))}
 else $$('.type-ready,.lift-ready').forEach(el=>el.classList.add('type-visible','lift-visible'));
}
syncSiteMotion();
// Arrival is a local visual enhancement, not a navigation lifecycle dependency.
// It never intercepts links, fades out the current page, or hides an unloaded page.
const entryHeading=$('.inner-page:not(.admin-page) #main > .page-heading,.inner-page:not(.admin-page) #main > .treatment-detail-hero');
if(entryHeading){
 const clearEntry=()=>entryHeading.classList.remove('route-enter');
 entryHeading.addEventListener('animationend',event=>{if(event.animationName==='route-arrive')clearEntry()});
 entryHeading.addEventListener('animationcancel',event=>{if(event.animationName==='route-arrive')clearEntry()});
 document.addEventListener('site-motion-change',()=>{if(!motionAllowed())clearEntry()});
 if(motionAllowed()&&!location.hash)entryHeading.classList.add('route-enter');
}
// Scroll work is batched once per animation frame, never scroll-jacked.
let scrollQueued=false;const movingPhotos=$$('.philosophy-portrait,.clinic-story-photo'),manifesto=$('.philosophy-manifesto'),manifestoGlyphs=manifesto?$$('.kinetic-char',manifesto):[];
function updateScrollMotion(){
 scrollQueued=false;const available=document.documentElement.scrollHeight-innerHeight;
 root.style.setProperty('--reading-progress',String(available>0?scrollY/available:0));
 if(!motionAllowed())return;
 const heroElement=$('#hero-section');if(heroElement){const r=heroElement.getBoundingClientRect();heroElement.style.setProperty('--hero-exit',String(Math.min(1,Math.max(0,-r.top/r.height))))}
 const ribbon=$('.kinetic-ribbon');if(ribbon){const r=ribbon.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)ribbon.style.setProperty('--ribbon-shift',String(Math.max(0,(innerHeight-r.top)*.22)))}
 movingPhotos.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--photo-shift',String(-Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)))*r.height*.12))});
 if(manifesto){const parent=$('#philosophy').getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-parent.top)/(parent.height*.7)));manifestoGlyphs.forEach((el,i)=>el.style.setProperty('--ink-opacity',String(.4+.6*Math.min(1,Math.max(0,(p-i/manifestoGlyphs.length)*5)))))}
 const calm=$('#sedation-story');if(calm){const r=calm.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)));calm.style.setProperty('--breathe-shift',String((p-.5)*120));calm.style.setProperty('--sun-shift',String((1-p)*120));calm.style.setProperty('--sun-glow',String(.25+p*.75))}}
 const closing=$('.closing-cta');if(closing){const r=closing.getBoundingClientRect();if(r.top<innerHeight)closing.style.setProperty('--closing-turn',String((innerHeight-r.top)*.06))}
}
function queueScrollMotion(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScrollMotion)}}
addEventListener('scroll',queueScrollMotion,{passive:true});addEventListener('resize',queueScrollMotion,{passive:true});document.addEventListener('site-motion-change',queueScrollMotion);updateScrollMotion();
if(matchMedia('(hover:hover) and (pointer:fine)').matches)$$('.strength-card').forEach(card=>card.addEventListener('pointermove',event=>{if(!motionAllowed())return;const r=card.getBoundingClientRect();card.style.setProperty('--pointer-x',event.clientX-r.left+'px');card.style.setProperty('--pointer-y',event.clientY-r.top+'px')}));
const menu=$('#mobile-menu'),toggle=$('.menu-toggle');function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','전체 메뉴 열기');document.body.classList.remove('locked');$('#main').inert=false}
toggle?.addEventListener('click',()=>{if(!menu.hidden){closeMenu();return}menu.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','전체 메뉴 닫기');document.body.classList.add('locked');$('#main').inert=true;$('a',menu).focus()});
document.addEventListener('keydown',e=>{if(!menu.hidden){if(e.key==='Escape'){closeMenu();toggle.focus()}if(e.key==='Tab'){const list=[toggle,...$$('a,button:not([disabled])',menu)];const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));
const desktopNavigation=matchMedia(root.lang==='en'?'(min-width:1391px)':'(min-width:1021px)');
desktopNavigation.addEventListener('change',event=>{if(event.matches&&!menu.hidden){const hadFocus=menu.contains(document.activeElement)||document.activeElement===toggle;closeMenu();if(hadFocus)$('.site-header .brand')?.focus({preventScroll:true})}});
// Desktop disclosure stays inside the header-sized panel, with Escape and focus support.
$$('.desktop-nav .nav-item').forEach(item=>{
 const trigger=$(':scope > a[aria-controls]',item);if(!trigger)return;
 const panel=document.getElementById(trigger.getAttribute('aria-controls'));
 const set=expanded=>trigger.setAttribute('aria-expanded',String(expanded));
 const open=()=>{if(!desktopNavigation.matches)return;item.classList.remove('menu-dismissed');set(true)};
 const dismiss=()=>{item.classList.add('menu-dismissed');set(false)};
 item.addEventListener('pointerenter',open);item.addEventListener('focusin',open);
 item.addEventListener('pointerleave',()=>{if(!item.contains(document.activeElement))set(false)});
 item.addEventListener('focusout',()=>queueMicrotask(()=>{if(!item.matches(':hover')&&!item.contains(document.activeElement))set(false)}));
 item.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();trigger.focus({preventScroll:true});dismiss()}if(e.key==='ArrowDown'&&e.target===trigger){e.preventDefault();open();$('a',panel)?.focus()}});
 document.addEventListener('pointerdown',e=>{if(!item.contains(e.target))dismiss()});
 desktopNavigation.addEventListener('change',()=>{dismiss()});
});
$('.back-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:motionAllowed()?'smooth':'instant'}));
// Motion preferences prevent autoplay, never a visitor's explicit media playback.
const hero=$('#hero-section'),motionButton=$('#hero-motion-toggle');
if(hero&&motionButton){
 const film=$('#hero-clinic-film'),prompt=$('#hero-playback-prompt'),playButton=$('#hero-play-button'),status=$('#hero-playback-status');
 let userPaused=false,explicitPlayback=false,inView=true,playPending=false,blocked=false,issue='',attempt=0,slowTimer;
 const chapters=$$('.film-chapters [data-film-chapter]',hero);
 const chapterLabels=['함께 이야기하는 의료진','함께 살펴보는 두 원장님','좋은 아침을 맞이하는 공간','진료에 집중할 수 있는 공간'];
 const playbackAllowed=()=>explicitPlayback||motionAllowed();
 const suspended=()=>document.hidden||!inView||!!$('#video-dialog')?.open;
 const wantsPlayback=()=>playbackAllowed()&&!userPaused&&!suspended();
 function paintPlayback(){
  const playing=!!film&&!film.paused&&film.readyState>=2&&!blocked;
  motionButton.hidden=false;motionButton.disabled=false;
  motionButton.setAttribute('aria-pressed',String(!playing));
  const label=playing?'영상 정지':'영상 재생';$('span',motionButton).textContent=label;motionButton.setAttribute('aria-label','히어로 '+label);
  hero.classList.toggle('motion-paused',userPaused);hero.classList.toggle('motion-suspended',suspended());
  hero.dataset.motionState=!playbackAllowed()?'reduced':suspended()?'suspended':userPaused?'paused':blocked?'blocked':'playing';
  hero.dataset.playbackReason=issue||(!playbackAllowed()?'preference':userPaused?'paused':playing?'playing':'loading');
  const controls=$('.film-chapters',hero);if(controls)controls.hidden=!film?.getAttribute('src');
  if(playButton)playButton.hidden=false;
  if(status)status.textContent=issue==='network'?'영상을 불러오지 못했습니다. 다시 재생하거나 새 창에서 열어주세요.':issue==='autoplay'?'자동재생이 제한되었습니다. 눌러서 영상을 재생하세요.':issue==='slow'?'영상 연결이 지연되고 있습니다. 다시 재생하거나 새 창에서 열어주세요.':!playbackAllowed()?'자동재생은 꺼져 있습니다. 영상만 직접 재생할 수 있습니다.':userPaused?'영상이 일시정지되었습니다.':'원내 소개 영상 · 무음 재생';
  if(prompt){if(playing&&prompt.contains(document.activeElement))motionButton.focus({preventScroll:true});prompt.hidden=playing||suspended()}
 }
 function updateFilmChapter(){
  if(!film||!Number.isFinite(film.duration))return;
  const index=Math.min(chapters.length-1,Math.floor(film.currentTime/4));
  hero.style.setProperty('--film-progress',String(film.currentTime/film.duration));hero.dataset.filmChapter=String(index);
  $('.film-counter',hero).textContent='0'+(index+1)+' / 04';$('#hero-film-caption').textContent=chapterLabels[index];
  chapters.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 }
 function syncFilm(){
  if(!film)return;
  if(!wantsPlayback()){film.pause();clearTimeout(slowTimer);paintPlayback();return}
  if(blocked){paintPlayback();return}
  if(!film.getAttribute('src')){film.defaultMuted=true;film.muted=true;film.playsInline=true;film.src=matchMedia('(max-width:760px)').matches?film.dataset.mobile:film.dataset.desktop;film.load()}
  if(film.paused&&!playPending){
   playPending=true;const currentAttempt=++attempt;
   clearTimeout(slowTimer);slowTimer=setTimeout(()=>{if(currentAttempt===attempt&&wantsPlayback()&&(film.paused||film.readyState<3)){issue='slow';paintPlayback()}},8000);
   film.play().catch(error=>{
    if(currentAttempt!==attempt||!wantsPlayback())return;
    blocked=true;issue=error.name==='NotAllowedError'?'autoplay':'network';hero.dataset.filmState='poster';hero.classList.remove('film-playing');
   }).finally(()=>{if(currentAttempt!==attempt)return;playPending=false;if(!wantsPlayback())film.pause();paintPlayback()});
  }
  paintPlayback();
 }
 function syncMotion(){root.classList.toggle('hero-in-view',inView);hero.classList.toggle('motion-ready',motionAllowed());syncFilm()}
 function directPlay(){
  // Called synchronously inside the trusted click; do not defer play() to metadata/timers.
  explicitPlayback=true;userPaused=false;blocked=false;issue='';playPending=false;++attempt;
  if(film?.error)film.load();hero.classList.add('motion-intro-finished');syncMotion();
 }
 film?.addEventListener('playing',()=>{if(!wantsPlayback()){film.pause();return}blocked=false;issue='';clearTimeout(slowTimer);hero.classList.add('film-playing');hero.dataset.filmState='playing';paintPlayback()});
 film?.addEventListener('pause',paintPlayback);
 film?.addEventListener('error',()=>{blocked=true;issue='network';playPending=false;clearTimeout(slowTimer);hero.classList.remove('film-playing');hero.dataset.filmState='poster';paintPlayback()});
 film?.addEventListener('timeupdate',updateFilmChapter);
 chapters.forEach(b=>b.addEventListener('click',()=>{if(!film||!Number.isFinite(film.duration))return;film.currentTime=Number(b.dataset.filmChapter)*4+.03;updateFilmChapter()}));
 playButton?.addEventListener('click',directPlay);
 motionButton.addEventListener('click',()=>{if(!film?.paused&&!blocked){userPaused=true;hero.classList.add('motion-intro-finished');syncMotion()}else directPlay()});
 document.addEventListener('video-dialog-change',syncMotion);
 document.addEventListener('site-motion-change',()=>{explicitPlayback=false;syncMotion()});
 document.addEventListener('visibilitychange',syncMotion);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncMotion()},{threshold:0}).observe(hero);
 syncMotion();
}
// Content-led stories run once on entry; no request, live consultation, or diagnostic engine.
$$('[data-story-mode]').forEach(scene=>{
 const mode=scene.dataset.storyMode,panels=$$('[data-story-panel]',scene),selectors=$$('[data-story-select]',scene);
 const pauseButton=$('[data-story-pause]',scene),replayButton=$('[data-story-replay]',scene),status=$('.story-playback-status',scene);
 const transcripts=panels.map(panel=>({question:$('.typing-question',panel)?.textContent||'',answer:$('.typing-answer',panel)?.textContent||''}));
 let active=0,elapsed=0,lastTime=0,raf=0,inView=false,paused=false,complete=false,typingPhase='',lastState='';
 const duration=()=>mode==='talk'?1100+transcripts[active].question.length*38+transcripts[active].answer.length*23+1100:panels.length*3100;
 function activate(index){
  active=index;scene.dataset.storyActive=String(active);
  panels.forEach((panel,i)=>{panel.hidden=i!==active;panel.classList.toggle('is-active',i===active)});
  selectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
  $$('[data-journey-photo]',scene).forEach((photo,i)=>photo.classList.toggle('is-active',i===active));
  const number=$('.story-step-number',scene);if(number)number.textContent=String(active+1).padStart(2,'0');
  scene.style.setProperty('--story-progress',String((active+1)/panels.length));scene.style.setProperty('--story-turn',(active+1)*360/panels.length+'deg');
 }
 function render(final=false){
  if(mode==='talk'){
   const text=transcripts[active],q=$('.typing-question',panels[active]),a=$('.typing-answer',panels[active]);
   const qEnd=500+text.question.length*38;
   q.textContent=final?text.question:text.question.slice(0,Math.max(0,Math.floor((elapsed-500)/38)));
   a.textContent=final?text.answer:text.answer.slice(0,Math.max(0,Math.floor((elapsed-qEnd-600)/23)));
   typingPhase=final?'finished':elapsed<qEnd?'question':elapsed<qEnd+600?'listening':'answer';scene.dataset.typingPhase=typingPhase;
  }else if(!final){const next=Math.min(panels.length-1,Math.floor(elapsed/3100));if(next!==active)activate(next)}
  scene.dataset.storyElapsed=String(Math.floor(elapsed));
 }
 function state(){
  const allowed=motionAllowed();const value=!allowed?'static':complete?'complete':paused?'paused':!inView||document.hidden?'suspended':'playing';scene.dataset.storyState=value;
  const stateKey=value+':'+paused;if(stateKey===lastState)return value==='playing';lastState=stateKey;
  status.textContent=({static:'모션 줄이기 적용',complete:'직접 눌러 살펴보세요',paused:'연출 일시정지',suspended:'화면에서 이어집니다',playing:'진료 안내 연출'})[value];
  pauseButton.disabled=!allowed||complete;pauseButton.textContent=paused?'연출 재생':'연출 정지';pauseButton.setAttribute('aria-pressed',String(paused));replayButton.disabled=!allowed;
  return value==='playing';
 }
 function tick(now){
  raf=0;if(!state()){lastTime=0;return}
  if(lastTime)elapsed+=Math.min(100,now-lastTime);lastTime=now;
  render();if(elapsed>=duration()){complete=true;render(true);state();return}raf=requestAnimationFrame(tick);
 }
 function sync(){
  if(raf){cancelAnimationFrame(raf);raf=0}lastTime=0;
  if(!motionAllowed()){complete=true;elapsed=duration();render(true)}
  if(state())raf=requestAnimationFrame(tick);
 }
 selectors.forEach(button=>button.addEventListener('click',()=>{
  const next=Number(button.dataset.storySelect);activate(next);paused=false;
  // Manual navigation never advances away while someone is reading a selected step.
  if(mode==='talk'&&motionAllowed()){elapsed=0;complete=false;render()}else{complete=true;elapsed=duration();render(true)}sync();
 }));
 pauseButton.addEventListener('click',()=>{paused=!paused;sync()});
 replayButton.addEventListener('click',()=>{if(!motionAllowed())return;paused=false;complete=false;elapsed=0;if(mode!=='talk')activate(0);render();sync()});
 scene.addEventListener('keydown',event=>{const target=event.target;if(!target.matches('[data-story-select]')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();let next=active;if(event.key==='Home')next=0;else if(event.key==='End')next=selectors.length-1;else next=(active+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+selectors.length)%selectors.length;selectors[next].focus();selectors[next].click()});
 scene.addEventListener('focusin',event=>{if(event.target.closest('.story-panel')&&!complete){paused=true;sync()}});
 document.addEventListener('site-motion-change',sync);document.addEventListener('visibilitychange',sync);
 scene.classList.add('story-enhanced');$$('.story-selectors,.story-playback',scene).forEach(el=>el.hidden=false);activate(0);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:.12}).observe(scene);
 else{complete=true;render(true)}
 sync();
});
// Scroll-assembled care architecture; the native page scroll is never intercepted.
const assembly=$('#preservation-assembly');
if(assembly){
 const notes=$$('[data-assembly-note]',assembly),layers=$$('[data-plan-layer]',assembly),range=$('#assembly-range'),follow=$('#assembly-follow');
 const labels=notes.map(note=>$('h3',note).textContent);let manual=false,queued=false;
 function paint(value){
  const v=Math.max(1,Math.min(4,value)),index=Math.min(3,Math.floor(v-.001));
  layers.forEach((layer,i)=>layer.style.setProperty('--assembled',String(motionAllowed()?Math.min(1,Math.max(0,v-i)):1)));
  notes.forEach((note,i)=>note.classList.toggle('is-current',i===index));
  $('.assembly-count',assembly).innerHTML=String(index+1).padStart(2,'0')+' <small>/ 04</small>';
  $('#assembly-active-label').textContent=labels[index];range.value=String(v);range.setAttribute('aria-valuetext',(index+1)+'단계 '+labels[index]);
  assembly.dataset.assemblyStage=String(index);assembly.dataset.assemblyValue=String(v);
 }
 function update(){
  queued=false;const mobile=matchMedia('(max-width:760px)').matches;
  follow.hidden=mobile;follow.disabled=!motionAllowed();follow.setAttribute('aria-pressed',String(!manual));
  assembly.dataset.assemblyMode=!motionAllowed()?'static':manual||mobile?'manual':'scroll';
  if(!motionAllowed()){paint(4);return}if(manual||mobile)return;
  const first=notes[0].getBoundingClientRect(),last=notes.at(-1).getBoundingClientRect();
  if(last.bottom<0||first.top>innerHeight)return;
  paint(1+3*Math.max(0,Math.min(1,(innerHeight*.4-first.top)/Math.max(1,last.top-first.top))));
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
 range.addEventListener('input',()=>{manual=true;paint(Number(range.value));assembly.dataset.assemblyMode='manual';follow.setAttribute('aria-pressed','false')});
 follow.addEventListener('click',()=>{manual=false;queue()});
 $('.assembly-controls',assembly).hidden=false;paint(4);update();addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});document.addEventListener('site-motion-change',queue);
}
// Physician cards: user-driven coverflow with safe links and a static-grid fallback.
const deck=$('#physician-deck');
if(deck){
 const viewport=$('.physician-deck-viewport',deck),cards=$$('[data-physician-card]',deck),selectors=$$('[data-deck-select]',deck),controls=$('.physician-deck-controls',deck),announcement=$('.deck-announcement',deck);
 let active=0,enabled=false,start=null,suppressClick=false;
 function render(announce=true){
  const gap=Math.min(230,viewport.clientWidth*.28);
  cards.forEach((card,i)=>{let offset=i-active;if(offset>cards.length/2)offset-=cards.length;if(offset<-cards.length/2)offset+=cards.length;const distance=Math.abs(offset);
   card.style.setProperty('--deck-x',offset*gap+'px');card.style.setProperty('--deck-rotate',-offset*13+'deg');card.style.setProperty('--deck-scale',String(Math.max(.4,1-distance*.12)));card.style.setProperty('--deck-z',String(10-distance));card.style.setProperty('--deck-opacity',String(Math.max(0,1-distance*.25)));card.classList.toggle('is-active',i===active);
   if(enabled&&i!==active){card.setAttribute('aria-hidden','true');$$('a',card).forEach(a=>a.tabIndex=-1)}else{card.removeAttribute('aria-hidden');$$('a',card).forEach(a=>a.removeAttribute('tabindex'))}
  });
  selectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));deck.dataset.deckActive=String(active);
  if(announce)announcement.textContent=(active+1)+' / '+cards.length+' · '+$('h3',cards[active]).textContent;
 }
 function select(index){active=(index+cards.length)%cards.length;render()}
 function sync(){enabled=motionAllowed();deck.classList.toggle('deck-enhanced',enabled);controls.hidden=!enabled;announcement.hidden=!enabled;viewport.tabIndex=enabled?0:-1;$('.deck-footnote',deck).firstChild.textContent=enabled?'좌우로 드래그하거나 이름을 선택하세요.':'의료진의 전체 약력과 진료 분야를 살펴보세요.';start=null;render(false)}
 $('[data-deck-previous]',deck).addEventListener('click',()=>select(active-1));$('[data-deck-next]',deck).addEventListener('click',()=>select(active+1));selectors.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 cards.forEach((card,i)=>{card.addEventListener('click',event=>{if(!enabled)return;if(suppressClick){event.preventDefault();suppressClick=false;return}if(i!==active){event.preventDefault();select(i)}});$$('img',card).forEach(img=>img.draggable=false)});
 viewport.addEventListener('pointerdown',event=>{if(!enabled||!event.isPrimary||event.button!==0||event.target.closest('a,button'))return;start={id:event.pointerId,x:event.clientX,y:event.clientY};suppressClick=false});
 viewport.addEventListener('pointermove',event=>{if(start&&start.id===event.pointerId&&Math.abs(event.clientX-start.x)>10)suppressClick=true});
 const end=event=>{if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){select(active+(dx<0?1:-1));suppressClick=true}setTimeout(()=>suppressClick=false,0)};
 addEventListener('pointerup',end);addEventListener('pointercancel',()=>{start=null;suppressClick=false});
 deck.addEventListener('keydown',event=>{if(!enabled||event.target.closest('a')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();select(event.key==='Home'?0:event.key==='End'?cards.length-1:active+(event.key==='ArrowRight'?1:-1))});
 document.addEventListener('site-motion-change',sync);addEventListener('resize',()=>render(false),{passive:true});sync();
}
// A reveal lens translates existing glossary content, not patient data or AI output.
const language=$('#language-reveal');
if(language){
 const panels=$$('[data-term-panel]',language),selectors=$$('[data-term-select]',language),range=$('#language-range'),replay=$('#language-replay');
 let selected=0,raf=0,began=0,startValue=0,visible=false,played=false;
 function value(v){range.value=String(v);range.setAttribute('aria-valuetext','쉬운 말 '+Math.round(v)+'% 표시');language.style.setProperty('--term-reveal',v+'%');language.dataset.revealValue=String(v)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;language.dataset.revealState='idle'}
 function animate(){
  stop();if(!motionAllowed()||!visible||document.hidden){value(100);return}
  value(0);startValue=0;began=performance.now();language.dataset.revealState='playing';
  function frame(now){if(!motionAllowed()||!visible||document.hidden){stop();return}const p=Math.min(1,(now-began)/1800),eased=1-Math.pow(1-p,3);value(startValue+(100-startValue)*eased);if(p<1)raf=requestAnimationFrame(frame);else{raf=0;language.dataset.revealState='complete'}}
  raf=requestAnimationFrame(frame);
 }
 function select(index){selected=index;panels.forEach((panel,i)=>panel.hidden=i!==index);selectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));language.dataset.termActive=String(index);animate()}
 range.addEventListener('input',()=>{stop();value(Number(range.value))});replay.addEventListener('click',animate);selectors.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 language.addEventListener('keydown',event=>{if(!event.target.matches('[data-term-select]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?panels.length-1:(selected+(event.key==='ArrowRight'?1:-1)+panels.length)%panels.length;selectors[next].focus();select(next)});
 document.addEventListener('site-motion-change',()=>{if(!motionAllowed()){stop();value(100)}});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 language.classList.add('language-enhanced');$('.language-selectors',language).hidden=false;$('.language-range-controls',language).hidden=false;panels.forEach((panel,i)=>panel.hidden=i!==0);language.dataset.termActive='0';value(motionAllowed()?50:100);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)stop();else if(!played){played=true;animate()}},{threshold:.2}).observe(language);else value(100);
}
// The shared scroll scheduler also drives the sedation sunrise.
const branchData=JSON.parse($('#branch-data')?.textContent||'[]'),names=Object.fromEntries(branchData.map(b=>[b.id,b.name])),phones=Object.fromEntries(branchData.map(b=>[b.id,b.phone]));let branch=branchData[0]?.id||'cheongnyangni';try{sessionStorage.removeItem('gm_branch')}catch{}
function hoursStatus(){const b=branchData.find(b=>b.id===branch),status=$('#regular-hours-status');if(!b||!status)return;const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const get=t=>parts.find(p=>p.type===t)?.value;const date=get('year')+'-'+get('month')+'-'+get('day'),day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')),now=get('hour')+':'+get('minute');const special=b.exceptions.find(e=>e.date===date),hours=special?special.hours:b.schedule[day],prefix=special?'변경 일정':'정규 일정';const periods=(hours||'').split(',').filter(Boolean).map(p=>p.split('-')),current=periods.find(([a,z])=>now>=a&&now<z);status.textContent=prefix+' · '+(!periods.length?'휴진':current?current[1]+'까지':periods.some(([a])=>now<a)&&periods.some(([,z])=>now>=z)?'휴게시간':'진료시간 외');status.title=special?special.note:'등록되지 않은 공휴일·임시휴진은 반영되지 않습니다. 내원 전 확인해 주세요.'}
function setBranch(id){if(!names[id])return;branch=id;const b=branchData.find(b=>b.id===id);$$('[data-branch]').forEach(el=>{const active=el.dataset.branch===id;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active))});$$('[data-branch-panel]').forEach(p=>p.hidden=p.dataset.branchPanel!==id);$$('.branch-phone').forEach(a=>{a.href='tel:'+phones[id].replaceAll('-','');if(!a.querySelector('svg')&&!a.closest('.mobile-bottom'))a.textContent=phones[id]});$$('.branch-booking').forEach(a=>{a.href=b.booking||'/reservation';a.textContent=b.booking?'네이버 예약':'예약 안내'});$$('.branch-kakao').forEach(a=>{a.href=b.kakao||'/reservation';a.textContent=b.kakao?'카카오 상담':'상담 안내'});$$('.branch-directions').forEach(a=>a.href=(document.documentElement.lang==='en'?'/en':'')+'/directions');hoursStatus()}
setBranch(branch);setInterval(hoursStatus,60000);
$$('.copy-address').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.address);toast('주소를 복사했습니다.')}catch{toast('복사할 주소: '+b.dataset.address)}}));
$$('dialog').forEach(dialog=>{dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close()}});$('.dialog-close',dialog)?.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{if(dialog.id==='video-dialog'){$('#video-container').replaceChildren();document.dispatchEvent(new Event('video-dialog-change'))}})});
$$('[data-video]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.video;if(!/^[\w-]{11}$/.test(id))return;const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';frame.title=b.getAttribute('aria-label')||b.textContent;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;$('#video-container').replaceChildren(frame);$('#video-dialog').showModal();document.dispatchEvent(new Event('video-dialog-change'))}));
$$('.search-open,#mobile-search-open').forEach(b=>b.addEventListener('click',()=>{$('#search-dialog').showModal();$('#site-search').focus()}));let searchTimer,searchRequest;
$('#site-search')?.addEventListener('input',e=>{clearTimeout(searchTimer);searchRequest?.abort();const q=e.target.value.trim();if(!q){$('#search-results').replaceChildren();return}searchTimer=setTimeout(async()=>{searchRequest=new AbortController();try{const r=await fetch('/api/search?lang='+(document.documentElement.dataset.locale||'ko')+'&q='+encodeURIComponent(q),{signal:searchRequest.signal});if(!r.ok)throw Error();const data=await r.json();$('#search-results').innerHTML=data.results.length?data.results.map(x=>`<a class="search-result" href="${safe(x.url)}"><span>${safe(x.title)}</span><small>${safe(x.category)}</small></a>`).join(''):'<p class="subtle">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>'}catch(err){if(err.name!=='AbortError')$('#search-results').textContent='검색 연결이 원활하지 않습니다. 다시 시도해 주세요.'}},180)});
$$('[data-video-category]').forEach(button=>button.addEventListener('click',()=>{const selected=button.dataset.videoCategory;$$('[data-video-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$$('#video-list .video-card').forEach(card=>card.hidden=selected!=='all'&&card.dataset.category!==selected)}));
// A direct question link opens its answer without changing navigation behavior.
function openLinkedAnswer(){const id=decodeURIComponent(location.hash.slice(1));const answer=id&&document.getElementById(id);if(answer?.matches('details'))answer.open=true}
try{openLinkedAnswer()}catch{}addEventListener('hashchange',()=>{try{openLinkedAnswer()}catch{}});
let category='all';function filterTreatments(){const q=($('#treatment-search')?.value||'').trim().toLowerCase();let count=0;$$('#treatment-list [data-category]').forEach(c=>{c.hidden=!((category==='all'||c.dataset.category===category)&&c.dataset.search.toLowerCase().includes(q));if(!c.hidden)count++});if($('#treatment-empty'))$('#treatment-empty').hidden=count>0}
$$('[data-filter-group="treatments"] button').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;$$('[data-filter-group="treatments"] button').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});filterTreatments()}));$('#treatment-search')?.addEventListener('input',filterTreatments);
let selectedInitial='전체';const initialOf=text=>{const n=text.trim().charCodeAt(0)-44032;return n>=0&&n<=11171?'ㄱㄱㄴㄷㄷㄹㅁㅂㅂㅅㅅㅇㅈㅈㅊㅋㅌㅍㅎ'[Math.floor(n/588)]:'기타'};function filterGlossary(){const q=($('#glossary-search')?.value||'').trim().toLowerCase();let count=0;$$('#glossary-list [data-search]').forEach(c=>{c.hidden=!(c.dataset.search.toLowerCase().includes(q)&&(selectedInitial==='전체'||initialOf(c.dataset.term)===selectedInitial));if(!c.hidden)count++});if($('#glossary-empty'))$('#glossary-empty').hidden=count>0}$('#glossary-search')?.addEventListener('input',filterGlossary);$$('[data-initial]').forEach(b=>b.addEventListener('click',()=>{selectedInitial=b.dataset.initial;$$('[data-initial]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterGlossary()}));
if($('#checker')){const questions=[{title:'가장 불편한 증상은 무엇인가요?',choices:['치아가 시리거나 아파요','잇몸이 붓거나 피가 나요','임플란트가 불편해요','치아가 없거나 깨졌어요','치과가 너무 무서워요','턱에서 소리나 통증이 있어요']},{title:'어느 부위가 불편하신가요?',choices:['앞니','어금니','잇몸 전체','턱관절','잘 모르겠어요']},{title:'불편함은 얼마나 되셨나요?',choices:['며칠 이내','몇 주 정도','몇 달 이상','예전부터 반복돼요']},{title:'지금 상태는 어떠신가요?',choices:['가끔 불편해요','찬 것에 주로 시려요','계속 아프거나 밤에 잠을 못 자요','호흡·삼킴 곤란, 심한 부종 또는 멈추지 않는 출혈이 있어요']}];let step=0,answers=[];function draw(){const done=step===questions.length;$('#checker-options').hidden=done;$('#checker-result').hidden=!done;$('#checker-back').hidden=step===0;$('#checker-step').textContent=done?'YOUR CARE GUIDE':'STEP 0'+(step+1)+' / 04';$$('.checker-progress i').forEach((e,i)=>e.classList.toggle('active',i<=step));if(done){$('#checker-title').textContent='다음 정보를 살펴보세요.';const choices=[['cavity','충치·신경치료 안내'],['gum','잇몸치료 안내'],['implant-revision','임플란트 재수술·재치료 안내'],[answers[1]===0?'implant-front':'implant-full','상실·손상 치아 치료 안내'],['sedation','의식하진정 수면치료 안내'],['tmj','턱관절 진료 안내']];const result=choices[answers[0]];const warning=answers[3]===3?'호흡·삼킴 곤란, 심한 부종 또는 멈추지 않는 출혈은 응급 평가가 필요합니다. 지체하지 말고 119 또는 가까운 응급실을 이용하세요.':answers[3]===2?'지속적인 통증이나 수면을 방해하는 통증은 신속한 치과 평가가 필요합니다. 병원에 연락해 당일 진료 가능 여부를 확인하세요.':'불편이 지속되거나 반복된다면 치과 검사를 받아 원인을 확인해 주세요. 증상이 가벼워도 검사 없이 안전하다고 판단할 수 없습니다.';$('#checker-result').innerHTML=`<div class="alert">${warning}</div><p>선택한 증상과 관련해 읽어볼 수 있는 일반 정보입니다. 특정 질환이나 치료가 필요하다는 진단이 아닙니다.</p><a class="btn dark-button" style="margin:22px 0" href="/treatments/${result[0]}">${result[1]} ↗</a><p><a class="text-link" href="/reservation">병원에 문의하기 →</a></p><button class="checker-back" id="checker-restart">처음부터 다시 확인하기</button>`;$('#checker-restart').onclick=()=>{step=0;answers=[];draw()};$('#checker-back').textContent='← 답변 수정';}else{$('#checker-title').textContent=questions[step].title;$('#checker-options').innerHTML=questions[step].choices.map((v,i)=>`<button data-answer="${i}">${safe(v)}</button>`).join('');$$('#checker-options button').forEach(b=>b.onclick=()=>{answers[step]=Number(b.dataset.answer);step++;draw();$('#checker-title').setAttribute('tabindex','-1');$('#checker-title').focus({preventScroll:true})});$('#checker-back').textContent='← 이전 질문'}}$('#checker-back').onclick=()=>{step=Math.max(0,step-1);draw()};draw()}
async function api(url,opts={}){const r=await fetch(url,{...opts,headers:{...(opts.body instanceof ArrayBuffer?{}:{'Content-Type':'application/json'}),...opts.headers}});let data;try{data=await r.json()}catch{throw Error('서버 응답을 읽지 못했습니다.')}if(!r.ok)throw Error(data.error||'요청을 처리하지 못했습니다.');return data}
$('#admin-login')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,b=$('button[type="submit"]',form);b.disabled=true;$('#login-error').textContent='';try{await api('/api/admin/login',{method:'POST',body:JSON.stringify({username:form.elements.username.value,password:form.elements.password.value})});location.reload()}catch(err){$('#login-error').textContent=err.message;b.disabled=false}});
if(!$('#admin-posts')&&$('#admin-logout'))$('#admin-logout').onclick=async()=>{try{await api('/api/admin/logout',{method:'POST'});location.reload()}catch(e){toast(e.message)}};
if($('#admin-posts')){let postData=[];const form=$('#post-editor');async function loadPosts(){try{postData=(await api('/api/admin/posts')).posts;$('#admin-posts').innerHTML=postData.map(p=>`<article class="admin-post"><div><strong>${safe(p.title)}</strong><br><small>${p.type==='notice'?'공지':'건강정보'} · ${p.status==='draft'?'비공개 초안':'공개'} · ${safe(p.updated_at.slice(0,10))}</small></div>${p.status==='published'?`<a target="_blank" rel="noopener" class="text-link" href="/${p.type}/${safe(p.slug)}">보기</a>`:''}<button data-edit="${safe(p.id)}">수정</button><button data-delete="${safe(p.id)}">삭제</button></article>`).join('')||'<p class="subtle">등록된 글이 없습니다.</p>';$$('[data-edit]').forEach(b=>b.onclick=()=>openEditor(postData.find(p=>p.id===b.dataset.edit)));$$('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('게시물을 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;try{await api('/api/admin/posts/'+b.dataset.delete,{method:'DELETE'});if(form.elements.id.value===b.dataset.delete)form.hidden=true;await loadPosts();toast('삭제했습니다.')}catch(e){toast(e.message)}})}catch(e){$('#admin-posts').textContent=e.message}}
function openEditor(p){form.reset();for(const key of ['id','title','slug','body','type','status'])form.elements[key].value=p?.[key]||(key==='type'?'blog':key==='status'?'draft':'');form.hidden=false;window.GMRichEditor?.sync(form.elements.body);$('#editor-title').textContent=p?'글 수정':'새 글 작성';$('#editor-message').textContent='';$('#editor-preview').hidden=true;form.scrollIntoView({behavior:motionAllowed()?'smooth':'instant',block:'start'})}
$('#new-post').onclick=()=>openEditor(null);$('#admin-logout').onclick=async()=>{try{await api('/api/admin/logout',{method:'POST'});location.reload()}catch(e){toast(e.message)}};
form.addEventListener('submit',async e=>{e.preventDefault();const b=$('button[type="submit"]',form);b.disabled=true;try{const data=Object.fromEntries(new FormData(form));const r=await api('/api/admin/posts',{method:'POST',body:JSON.stringify(data)});form.elements.id.value=r.id;$('#editor-message').textContent=data.status==='published'?'공개 저장되었습니다.':'비공개 초안으로 저장되었습니다.';await loadPosts()}catch(e){$('#editor-message').textContent=e.message}finally{b.disabled=false}});
$('#preview-post').onclick=async()=>{try{const r=await api('/api/admin/preview',{method:'POST',body:JSON.stringify({body:form.elements.body.value})});$('#editor-preview').innerHTML=r.html;$('#editor-preview').hidden=false}catch(e){toast(e.message)}};
async function upload(file){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){toast('5MB 이하의 JPG·PNG·WebP 이미지를 선택해 주세요.');return}$('#editor-message').textContent='이미지 업로드 중…';try{const r=await api('/api/admin/upload',{method:'POST',headers:{'Content-Type':file.type},body:await file.arrayBuffer()});const area=form.elements.body;const pos=area.selectionStart;const text='\n\n![병원 안내 이미지]('+r.url+')\n\n';area.setRangeText(text,pos,pos,'end');window.GMRichEditor?.sync(area);$('#editor-message').textContent='이미지를 삽입했습니다. 대괄호 안의 설명을 수정하고 글을 저장해 주세요.'}catch(e){$('#editor-message').textContent=e.message}}
$('#post-image').onchange=e=>upload(e.target.files[0]);const area=form.elements.body;area.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault()});area.addEventListener('drop',e=>{if(e.dataTransfer.files.length){e.preventDefault();upload(e.dataTransfer.files[0])}});loadPosts()}
// Restore current preferences after history/BFCache navigation. Never replay the
// entrance over a restored reading position or leave the document inert.
addEventListener('pageshow',event=>{
 if(!event.persisted)return;
 entryHeading?.classList.remove('route-enter');
 closeMenu();$$('dialog[open]').forEach(dialog=>dialog.close());
 try{sitePaused=sessionStorage.getItem('gm_motion')==='off';sessionStorage.removeItem('gm_branch');setBranch(branchData[0]?.id)}catch{}
 syncSiteMotion();queueScrollMotion();
});
})();
