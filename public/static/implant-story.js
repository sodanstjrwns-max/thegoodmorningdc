/* Implant scroll story: sticky stage with a continuous implant cross-section (gum · jawbone · fixture · abutment · crown)
   scrubbed by scroll progress (2026-10-22, director request). Off (static stacked list with 3D scene images) when
   prefers-reduced-motion, Save-Data, or the site motion toggle (html.motion-off). */
(()=>{
 const section=document.querySelector('[data-implant-scroll]');if(!section)return
 const track=section.querySelector('.implant-scroll-track'),steps=[...section.querySelectorAll('.implant-step')]
 const anatomy=section.querySelector('.implant-anatomy'),rail=section.querySelector('.implant-scroll-rail i'),n=steps.length
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),root=document.documentElement
 const allowed=()=>!reduce.matches&&!navigator.connection?.saveData&&!root.classList.contains('motion-off')
 let on=false,ticking=false,visible=false,active=-1
 section.style.setProperty('--scenes',String(n))
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v))
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2
 const vars=['--ia-ghost','--ia-scan','--ia-scan-y','--ia-measure','--ia-fix','--ia-fix-o','--ia-turn','--ia-glow','--ia-abut','--ia-abut-o','--ia-crown','--ia-crown-o']
 function paint(s,intro){
  if(!anatomy)return
  const fix=ease(clamp((s-1.75)/.85)),abut=ease(clamp((s-2.75)/.55)),crown=ease(clamp((s-3.4)/.5))
  const v={
   '--ia-ghost':intro?1:1-clamp((s-.3)/.6),
   '--ia-scan':clamp((s-.75)/.15)*clamp((1.85-s)/.15),
   '--ia-scan-y':clamp((s-.8)/.9),
   '--ia-measure':clamp((s-1.1)/.3)*clamp((2-s)/.25),
   '--ia-fix':fix,'--ia-fix-o':clamp((s-1.7)/.1),
   '--ia-turn':(fix*8)%1,
   '--ia-glow':clamp((s-2.55)/.25)*(1-.5*clamp((s-3.6)/.4)),
   '--ia-abut':abut,'--ia-abut-o':clamp((s-2.7)/.1),
   '--ia-crown':crown,'--ia-crown-o':clamp((s-3.35)/.1)
  }
  for(const k in v)anatomy.style.setProperty(k,v[k].toFixed(4))
 }
 function frame(){
  ticking=false;if(!on)return
  const r=track.getBoundingClientRect(),vh=innerHeight,total=r.height-vh
  const p=clamp(-r.top/(total||1))
  // first 8% of the track keeps the title card; the rest maps onto steps 0..n-1
  const intro=.08,q=clamp((p-intro)/(1-intro)),s=q*(n-1)
  section.classList.toggle('past-intro',p>intro*.6)
  paint(s,p<=intro)
  const a=Math.round(s);if(a!==active){active=a;steps.forEach((st,i)=>st.classList.toggle('is-active',i===a))}
  section.style.setProperty('--p',q.toFixed(4))
  rail?.style.setProperty('--p',q.toFixed(4))
 }
 const request=()=>{if(!ticking&&visible){ticking=true;requestAnimationFrame(frame)}}
 function sync(){
  const want=allowed()
  if(want===on)return
  on=want;section.classList.toggle('is-scrub',on)
  if(!on){if(anatomy)vars.forEach(k=>anatomy.style.removeProperty(k));steps.forEach(st=>st.classList.remove('is-active'));section.classList.remove('past-intro');active=-1}
  else{visible=true;request()}
 }
 new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);request()},{rootMargin:'200px 0px'}).observe(section)
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request)
 reduce.addEventListener?.('change',sync)
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']})
 sync()
})()
