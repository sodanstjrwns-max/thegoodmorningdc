/* Implant scroll story: sticky stage whose 3D scenes crossfade with scroll progress.
   Off (static stacked list) when prefers-reduced-motion, Save-Data, or the site motion toggle (html.motion-off). */
(()=>{
 const section=document.querySelector('[data-implant-scroll]');if(!section)return
 const track=section.querySelector('.implant-scroll-track'),steps=[...section.querySelectorAll('.implant-step')]
 const figures=steps.map(s=>s.querySelector('.implant-step-figure')),n=steps.length
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),root=document.documentElement
 const allowed=()=>!reduce.matches&&!navigator.connection?.saveData&&!root.classList.contains('motion-off')
 let on=false,ticking=false,visible=false,active=-1
 section.style.setProperty('--scenes',String(n))
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
 function frame(){
  ticking=false;if(!on)return
  const r=track.getBoundingClientRect(),vh=innerHeight,total=r.height-vh
  const p=clamp(-r.top/(total||1),0,1)
  // first 8% of the track keeps the title card; the rest maps onto scenes 0..n-1
  const intro=.08,q=clamp((p-intro)/(1-intro),0,1),s=q*(n-1)
  section.classList.toggle('past-intro',p>intro*.6)
  figures.forEach((f,i)=>{const d=Math.abs(s-i),o=clamp(1-d,0,1);f.style.setProperty('--o',(i===0&&p<=intro?1:o).toFixed(3));f.style.setProperty('--s',(1+.04*clamp(d,0,1)).toFixed(4))})
  const a=Math.round(s);if(a!==active){active=a;steps.forEach((st,i)=>st.classList.toggle('is-active',i===a))}
  section.style.setProperty('--p',q.toFixed(4))
  section.querySelector('.implant-scroll-rail i')?.style.setProperty('--p',q.toFixed(4))
 }
 const request=()=>{if(!ticking&&visible){ticking=true;requestAnimationFrame(frame)}}
 function sync(){
  const want=allowed()
  if(want===on)return
  on=want;section.classList.toggle('is-scrub',on)
  if(!on){figures.forEach(f=>{f.style.removeProperty('--o');f.style.removeProperty('--s')});steps.forEach(st=>st.classList.remove('is-active'));section.classList.remove('past-intro');active=-1}
  else{figures.forEach(f=>{const img=f.querySelector('img');if(img)img.loading='eager'});visible=true;request()}
 }
 new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);request()},{rootMargin:'200px 0px'}).observe(section)
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request)
 reduce.addEventListener?.('change',sync)
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']})
 sync()
})()
