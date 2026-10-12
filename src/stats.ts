// Admin-only integrated stats (pattern ported from clients/gosudental src/pages/stats.ts).
// Server-side fetch to the central PF dashboard; the bearer token is the Pages secret STATS_API_TOKEN
// and is never rendered, logged or sent to the browser.
import {STATS_API_URL,CLARITY_DASHBOARD_URL} from './site-config'
import {esc} from './ui'

export async function fetchSiteStats(token?:string):Promise<any|null>{
 if(!token)return null
 try{const r=await fetch(STATS_API_URL,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(8000)});if(!r.ok)return null;return await r.json()}catch{return null}
}
const fmt=(n:any)=>n==null||isNaN(Number(n))?'—':Number(n).toLocaleString('ko-KR')
const pct=(n:any)=>n==null||isNaN(Number(n))?'—':Number(n).toFixed(1)+'%'
const sec=(n:any)=>{if(n==null||isNaN(Number(n)))return '—';const s=Math.round(Number(n));return s>=60?`${Math.floor(s/60)}분 ${s%60}초`:`${s}초`}
function delta(v:any,invert=false){if(v==null||!isFinite(Number(v)))return '';const n=Number(v);if(n===0)return '<span class="stx-delta">— 0%</span>';const good=invert?n<0:n>0;return `<span class="stx-delta ${good?'good':'bad'}">${n>0?'▲':'▼'} ${Math.abs(n).toFixed(1)}%</span>`}
function spark(values:number[],color:string){if(!values||values.length<2)return '<p class="stx-empty">데이터 수집 중</p>';const w=600,h=70,max=Math.max(...values,1),step=w/(values.length-1),pts=values.map((v,i)=>[i*step,h-8-(v/max)*(h-18)]),line=pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="stx-svg" role="img" aria-label="추이 그래프"><path d="${line} L${w},${h} L0,${h} Z" fill="${color}" opacity="0.08"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2"/></svg>`}
const card=(label:string,value:string,foot='')=>`<div class="stx-card"><div class="stx-label">${label}</div><div class="stx-value">${value}</div><div class="stx-foot">${foot}</div></div>`
const table=(title:string,heads:string[],rows:string[][])=>`<div class="stx-table-wrap"><h3>${title}</h3>${rows.length?`<table class="stx-table"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i?'tr':'tl'}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<p class="stx-empty">데이터 수집 중입니다</p>'}</div>`
function insights(d:any){
 const out:string[]=[],g=d?.gsc,a=d?.ga,ai=d?.ai
 if(!d||!d.configured)return ['중앙 대시보드 데이터 연동이 완료되면 이 자리에 자동 인사이트가 표시됩니다.','사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 적용되어 운영 중입니다.','청량리 치과·제기동 치과 지역 안내와 진료 설명이 쌓일수록 지역+진료 검색 노출이 먼저 늘어납니다.']
 if(g){if((g.clicks??0)<100)out.push(`최근 28일 검색 클릭 ${fmt(g.clicks)}회 — 아직 색인·순위 안착 단계입니다. 지금은 노출(${fmt(g.impressions)}회) 증가 추세가 더 중요한 신호입니다.`);else if(g.delta?.clicks!=null)out.push(`최근 28일 검색 클릭 ${fmt(g.clicks)}회 — 직전 기간 대비 ${Math.abs(Number(g.delta.clicks)).toFixed(1)}% ${g.delta.clicks>=0?'증가':'감소'}했습니다.`)
  if(g.position!=null)out.push(`평균 노출 순위 ${Number(g.position).toFixed(1)}위${g.position<=10?' — 검색 1페이지에 노출되는 검색어가 생기고 있습니다.':' — 롱테일 검색어부터 순위가 형성되는 초기 흐름입니다.'}`)
  if(g.topQueries?.length)out.push(`가장 많이 유입된 검색어는 “${esc(g.topQueries[0].query)}”입니다.`)}
 if(a&&(a.leads??0)>0)out.push(`전화·예약·상담 등 전환(리드)이 최근 28일 ${fmt(a.leads)}건 발생했습니다.`)
 if(ai&&(ai.sessions??0)>0)out.push(`ChatGPT 등 AI 검색을 통한 방문이 ${fmt(ai.sessions)}회(전체 세션의 ${esc(ai.share)}%) 있었습니다.`)
 if(out.length<3)out.push('검색 순위는 개설 후 약 6개월부터 본격적인 경쟁 구간에 들어갑니다.')
 return out.slice(0,5)
}
const AI:Record<string,string>={chatgpt:'ChatGPT',perplexity:'Perplexity',claude:'Claude',gemini:'Gemini',etc:'기타 AI'}
export function statsView(d:any){
 const g=d?.gsc,a=d?.ga,ai=d?.ai,cl=d?.clarity,configured=!!d?.configured
 let s=`<section class="content-section stx-root"><div class="wrap"><div class="stx-head"><div><h2>통합 통계</h2><p class="subtle">더굿모닝치과(thegoodmorningdc.kr) 검색·방문·AI 유입 성과 · PF Web Engine 중앙 대시보드 연동</p></div>${d?.range?`<span class="subtle">${esc(d.range.start)} ~ ${esc(d.range.end)}</span>`:''}</div>`
 s+=`<div class="stx-expect"><strong>검색 순위는 시간이 필요합니다</strong><ol><li>0~1개월 · 색인</li><li>1~3개월 · 롱테일 노출</li><li>3~6개월 · 지역+진료 검색어</li><li>6개월~ · 경쟁 검색어</li></ol></div>`
 if(!configured){s+=`<div class="stx-pending"><h3>데이터 연동 대기 중</h3><p>검색콘솔·애널리틱스 데이터 연동이 준비되는 대로 지표가 자동으로 표시됩니다.</p></div>`}
 else{
  s+=`<h3 class="stx-sec">검색 성과 <small>Google Search Console · 최근 28일</small></h3>`+(g?`<div class="stx-grid">${card('검색 클릭',fmt(g.clicks),delta(g.delta?.clicks))}${card('검색 노출',fmt(g.impressions),delta(g.delta?.impressions))}${card('CTR',g.ctr!=null?(g.ctr*100).toFixed(1)+'%':'—',delta(g.delta?.ctr))}${card('평균 순위',g.position!=null?Number(g.position).toFixed(1)+'위':'—',delta(g.delta?.position,true))}</div><div class="stx-spark"><div class="stx-label">일별 검색 클릭</div>${spark((g.dailyClicks??[]).map((x:any)=>Number(x.clicks)||0),'#7d6b2a')}</div>`:'<p class="stx-empty">검색콘솔 데이터 수집 중입니다</p>')
  s+=`<h3 class="stx-sec">방문 성과 <small>Google Analytics 4 · 최근 28일</small></h3>`+(a?`<div class="stx-grid">${card('사용자',fmt(a.users),delta(a.delta?.users))}${card('세션',fmt(a.sessions),delta(a.delta?.sessions))}${card('리드(전환)',fmt(a.leads),delta(a.delta?.leads))}${card('AI 유입',ai?`${fmt(ai.sessions)} (${esc(ai.share??0)}%)`:'—',ai?delta(ai.delta):'')}</div><div class="stx-spark"><div class="stx-label">일별 사용자</div>${spark((a.dailyUsers??[]).map((x:any)=>Number(x.users)||0),'#242725')}</div>`:`<p class="stx-empty">${d.hasGa?'애널리틱스 데이터 수집 중입니다':'애널리틱스 연동 대기 중입니다'}</p>`)
  s+=`<h3 class="stx-sec">행동 분석 <small>Microsoft Clarity · 최근 3일</small> <a class="text-link" href="${esc(CLARITY_DASHBOARD_URL)}" target="_blank" rel="noopener noreferrer">Clarity 대시보드</a></h3>`+(cl?`<div class="stx-grid">${card('세션',fmt(cl.sessions))}${card('평균 스크롤',pct(cl.avgScrollDepth))}${card('참여시간',sec(cl.engagementSec))}${card('레이지 클릭',cl.rageClicks!=null?fmt(cl.rageClicks)+'건':'—',pct(cl.rageClickPct))}</div>`:'<p class="stx-empty">Clarity 수집 대기 중</p>')
 }
 s+=`<div class="stx-insight"><h3>자동 인사이트</h3><ul>${insights(d).map(l=>`<li>${l}</li>`).join('')}</ul></div>`
 if(configured){s+=`<div class="stx-tables">${table('상위 검색어 TOP 10',['검색어','클릭','노출'],(g?.topQueries??[]).slice(0,10).map((q:any)=>[esc(q.query),fmt(q.clicks),fmt(q.impressions)]))}${table('상위 페이지 TOP 10',['페이지','클릭','노출'],(g?.topPages??[]).slice(0,10).map((q:any)=>[esc(String(q.page??'').replace(/^https?:\/\/[^/]+/,'')||'/'),fmt(q.clicks),fmt(q.impressions)]))}${table('AI 소스별 유입',['AI 소스','세션'],ai?Object.entries(ai.bySource??{}).filter(([,v])=>Number(v)>0).sort((x,y)=>Number(y[1])-Number(x[1])).map(([k,v])=>[AI[k]??esc(k),fmt(v)]):[])}</div>`}
 return s+`<p class="subtle"><a href="/admin">관리자 홈으로</a></p></div></section>`
}
