/* 더굿모닝치과 메인 스크롤 몰입 연출 — 보조 레이어 (GSAP ScrollTrigger)
   이 사이트는 이미 히어로 필름·글자 키네틱·리본·수면 일출·임플란트 스크롤 스토리·의료진 덱 등 자체 연출이 있다.
   그 섹션과 제목(.type-ready)·카드(.lift-ready)는 건드리지 않고, 연출이 없던 블록에만 "좋은 아침" 빛처럼 가볍게 더한다.
   - 사이트 원칙(스크롤을 가로채지 않음)에 맞춰 Lenis 관성 스크롤은 쓰지 않는다
   - 사이트 모션 토글(motion-enabled/OFF)·동작 줄이기·데이터 절약을 그대로 따른다 — 꺼지면 즉시 끝 상태로
   - 글자는 모두 HTML 에 그대로(크롤러·AEO 영향 없음), JS 가 꺼져도 전부 보인다 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // #앵커로 들어오면 브라우저의 앵커 이동(사이트의 부드러운 스크롤 포함)이 끝난 뒤에 시작한다 — ScrollTrigger 초기 계산이 이동을 끊지 않도록
  function boot() {
    if (location.hash.length < 2) { setTimeout(start, 60); return; }
    var t0 = Date.now(), timer = 0, done = false;
    function run() { if (done) return; done = true; clearTimeout(timer); removeEventListener('scroll', settle); start(); }
    function settle() { clearTimeout(timer); timer = setTimeout(run, Math.max(220, 400 - (Date.now() - t0))); }
    addEventListener('scroll', settle, { passive: true });
    settle();
    setTimeout(run, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  function start() {
  var root = document.documentElement;
  if (!root.classList.contains('motion-enabled')) return;
  var main = document.getElementById('main');
  if (!main) return;
  root.classList.add('mx');

  // 등장 대기열: 화면 진입 때 재생, 페이지 맨 끝에 닿으면 남은 것 전부 재생(끝 근처라 기준선에 못 닿는 블록 대비)
  var pending = [], finishers = [];
  function go(tw) {
    if (tw._mxGo) return; tw._mxGo = 1;
    tw.play();
    setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
  }
  addEventListener('scroll', function () {
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { pending.forEach(go); finishers.slice().forEach(function (f) { f(); }); }
  }, { passive: true });
  var mobile = matchMedia('(max-width: 767px)').matches;
  var MORNING = 'power2.out';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  // 기존 연출 요소(키네틱 제목·lift 카드)와 겹치면 건너뛴다
  var OWNED = '.type-ready, .lift-ready, .image-reveal, [data-story-mode], [data-implant-scroll], .hero';
  function free(el) { return !el.closest(OWNED) && !el.querySelector(OWNED); }

  var tweens = [], triggers = [];
  function enter(targets, vars, trigger, start) {
    targets = gsap.utils.toArray(targets).filter(free);
    if (!targets.length) return null;
    var from = {}, to = { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'brightness(1) saturate(1)', paused: true,
      onStart: function () { gsap.set(targets, { transition: 'none' }); },
      onComplete: function () { gsap.set(targets, { clearProps: 'opacity,transform,transition,filter' }); } };
    Object.keys(vars).forEach(function (k) { (['duration', 'ease', 'stagger', 'delay'].indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    if (!from.filter) delete to.filter;
    var tw = gsap.fromTo(targets, from, to);
    pending.push(tw);
    tweens.push(tw);
    triggers.push(ScrollTrigger.create({ trigger: trigger || targets[0], start: start || 'top 88%', once: true, onEnter: function () { go(tw); } }));
    return tw;
  }
  function scrubOnce(target, from, to, st) {
    if (!free(target)) return;
    var tw = gsap.fromTo(target, from, Object.assign({ ease: 'none', paused: true }, to));
    tweens.push(tw);
    var done = false;
    var trig = ScrollTrigger.create(Object.assign({}, st, {
      onUpdate: function (self) { if (!done) tw.progress(self.progress); },
      onLeave: finish
    }));
    triggers.push(trig);
    function finish() {
      if (done) return; done = true;
      tw.progress(1);
      gsap.set(target, { clearProps: Object.keys(from).filter(function (k) { return k.indexOf('--') !== 0; }).join(',') });
      trig.kill();
      finishers.splice(finishers.indexOf(finish), 1);
    }
    finishers.push(finish);
    if (trig.progress >= 1) finish(); else tw.progress(trig.progress);
  }

  // ── 1. 미뤄온 진료 4가지: 해가 뜨는 호(弧)처럼 — 가장자리 카드가 먼저, 가운데가 조금 늦게 더 높이서 떠오름
  var pc = $$('#care-priorities .priority-card');
  if (pc.length) {
    var mid = (pc.length - 1) / 2;
    enter(pc, { y: function (i) { return mobile ? 28 : 40 + (mid - Math.abs(i - mid)) * 26; }, opacity: 0, duration: 1.1, ease: MORNING,
      stagger: { each: 0.09, from: 'edges' } }, pc[0].parentElement, 'top 86%');
  }

  // ── 2. 청량리 진료 안내 카드: 차례로 올라오며 사진이 아침 햇살처럼 밝아짐
  var at = $$('#cheongnyangni-guide .area-topic-grid > li');
  if (at.length) {
    enter(at, { y: mobile ? 30 : 50, opacity: 0, duration: 1, ease: MORNING, stagger: 0.08 }, at[0], 'top 88%');
    $$('#cheongnyangni-guide .area-topic-card img').forEach(function (img, i) {
      enter(img, { filter: 'brightness(0.72) saturate(0.6)', duration: 1.6, ease: 'sine.out', delay: 0.2 + (i % 3) * 0.08 }, img, 'top 85%');
    });
  }

  // ── 3. 1990년부터: 원장 인용에 노란 아침 빛 줄이 위에서 아래로 차오르고, 진료 분야 목록은 오른쪽에서 한 줄씩
  var dq = $('#director-story .director-quote');
  if (dq && free(dq)) {
    dq.classList.add('mx-sunline');
    triggers.push(ScrollTrigger.create({ trigger: dq, start: 'top 85%', end: 'bottom 55%', scrub: true,
      onUpdate: function (s) { dq.style.setProperty('--mx-sun', s.progress.toFixed(3)); },
      onLeave: function () { dq.style.setProperty('--mx-sun', '1'); } }));
  }
  var dv = $$('#director-story .director-values > li');
  if (dv.length) enter(dv, { x: mobile ? 16 : 40, opacity: 0, duration: 0.9, ease: MORNING, stagger: 0.07 }, dv[0], 'top 90%');
  var dm = $('#director-story .director-morning');
  if (dm) enter(dm, { y: 30, opacity: 0, duration: 1.1, ease: MORNING }, dm, 'top 88%');

  // ── 4. 포기하지 않으셨으면: 진료 칩이 하나씩 톡 놓임
  var chips = $$('#inclusive-care .treatment-chips > a');
  if (chips.length) enter(chips, { y: 14, scale: 0.86, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.08 }, chips[0], 'top 94%');
  var ib = $('#inclusive-care blockquote');
  if (ib) enter(ib, { y: 26, opacity: 0, duration: 1.1, ease: MORNING }, ib, 'top 88%');

  // ── 5. 공식 블로그 최근 이야기: 왼쪽에서 한 줄씩
  var lj = $$('.latest-journal li');
  if (lj.length) enter(lj, { x: -24, opacity: 0, duration: 0.8, ease: MORNING, stagger: 0.05 }, lj[0].parentElement, 'top 90%');

  // ── 6. 환자 리뷰: 두 창구가 양쪽에서 만나고, 어두운 상담 상자가 다가옴
  $$('#patient-reviews .review-platform').forEach(function (a, i) {
    enter(a, { x: (i ? 1 : -1) * (mobile ? 24 : 60), opacity: 0, duration: 1, ease: MORNING }, a.parentElement, 'top 90%');
  });
  var rc = $('#patient-reviews .review-cta');
  if (rc) scrubOnce(rc, { scale: mobile ? 0.96 : 0.92 }, { scale: 1 }, { trigger: rc, start: 'top bottom', end: 'top 55%' });

  // ── 7. 오시는 길: 약도가 액자에서 펼쳐지고, 핀이 마지막에 톡 떨어짐
  var bm = $('#visit .branch-map');
  if (bm && free(bm)) {
    scrubOnce(bm, { clipPath: mobile ? 'inset(3% 4% 3% 4%)' : 'inset(7% 9% 7% 9%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, { trigger: bm, start: 'top 95%', end: 'top 45%' });
    var pin = $('.map-pin', bm);
    if (pin) enter(pin, { y: -46, opacity: 0, duration: 0.9, ease: 'bounce.out' }, bm, 'top 55%');
  }
  var hrs = $$('#visit .hours > div');
  if (hrs.length) enter(hrs, { y: 10, opacity: 0, duration: 0.6, ease: MORNING, stagger: 0.04 }, hrs[0].parentElement, 'top 92%');

  // 사이트 모션을 끄면(모션 OFF 버튼·데이터 절약) 바로 끝 상태로 두고 손을 뗀다
  document.addEventListener('site-motion-change', function () {
    if (root.classList.contains('motion-enabled')) return;
    tweens.forEach(function (t) { t.progress(1); });
    triggers.forEach(function (t) { t.kill(); });
    $$('.mx-sunline').forEach(function (q) { q.style.setProperty('--mx-sun', '1'); });
    root.classList.remove('mx');
  });

  ScrollTrigger.refresh();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
