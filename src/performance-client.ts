/// <reference lib="dom" />
import {onCLS,onINP,onLCP,type Metric} from 'web-vitals'
// No attribution build: never send DOM targets, interaction text, metric IDs or raw values.
if(!location.pathname.startsWith('/admin')&&navigator.doNotTrack!=='1'&&!(navigator as any).globalPrivacyControl){
 let enabled=false,resolved=false
 const pending:Metric[]=[],sent=new Set<string>()
 const send=(m:Metric)=>{
  if(!resolved){pending.push(m);return}if(!enabled)return
  const key=m.id+':'+m.name;if(sent.has(key))return;sent.add(key)
  void fetch('/api/performance',{method:'POST',keepalive:true,credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:location.pathname,metric:m.name,bucket:m.rating,device:matchMedia('(max-width:760px)').matches?'mobile':'desktop'})}).catch(()=>{})
 }
 onLCP(send);onCLS(send);onINP(send)
 void fetch('/api/event-config',{credentials:'omit'}).then(r=>r.json()).then((d:any)=>{resolved=true;enabled=d.performanceEnabled===true;pending.splice(0).forEach(send)}).catch(()=>{resolved=true;pending.length=0})
}
