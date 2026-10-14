import type {Content} from './content'
import {branchPlaceUrl} from './content'
import {esc,icon,button,heading,faqList} from './ui'
import {topics,topicPath,topicGrid,topicItemList,koOnly,OG_SIZE,type Topic} from './area-topics'

// Local search hubs (Korean only). One exact keyword per page: home + /area/cheongnyangni = "청량리 치과",
// /area/jegi-dong = "제기동 치과". Facts are limited to what the site already states (address, Exit 2 / 85m,
// hours, clinicians, treatments). No walking times, parking or floor details beyond the published address.
// Content updated date drives sitemap lastmod.
export type Hub={slug:string;keyword:string;title:string;description:string;updated:string;lead:string;faq:[string,string][]}
const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
export const hubs:Hub[]=[
 {slug:'cheongnyangni',keyword:'청량리 치과',updated:'2026-10-14',
  title:'청량리 치과 | 더굿모닝치과의원 — 1990년부터 같은 자리, 일요일 진료',
  description:'청량리 치과 더굿모닝치과의원. 청량리역에서 1호선 한 정거장, 제기동역 2번 출구 85m. 일요일 10–14시 진료, 수면치료·임플란트 재수술·앞니 치료·장애인 진료를 안내합니다.',
  lead:'청량리역 생활권에서 1990년부터 2대째 같은 자리를 지켜온 더굿모닝치과의원의 위치·진료시간·의료진·주요 진료를 한곳에 정리했습니다.',
  faq:[
   ['청량리역에서 더굿모닝치과까지 어떻게 가나요?','청량리역에서 1호선을 타면 다음 역이 제기동역입니다. 제기동역 2번 출구에서 85m 거리의 서울특별시 동대문구 왕산로 123, 2층으로 오시면 됩니다. 버스·도보 경로는 네이버 지도에서 출발지를 입력해 확인해 주세요.'],
   ['청량리 근처에서 일요일에 진료하는 치과인가요?','네. 일요일은 10:00~14:00, 토요일은 09:30~14:00에 점심시간 없이 진료합니다. 공휴일·대체공휴일과 임시 휴진 여부는 내원 전에 02-969-3776으로 확인해 주세요.'],
   ['수면치료를 예약하면 당일에 바로 받을 수 있나요?','의식하진정은 전신 상태·복용 약·금식 여부·보호자 동반을 먼저 확인한 뒤 결정합니다. 사전 평가 없이 당일 진행을 약속하지 않으며, 적합성과 효과는 개인에 따라 다릅니다.'],
   ['다른 치과에서 어렵다고 들은 임플란트 재수술도 상담할 수 있나요?','상담할 수 있습니다. 기존 치료 시기와 기록·영상이 있다면 가져와 주세요. 현재 임플란트를 유지할지, 부품만 교체할지, 제거 후 다시 심을지를 검사 후 구분해 설명합니다.'],
   ['주차는 가능한가요?','주차 위치와 지원 조건은 예약하실 때 병원에 확인해 주세요. 대중교통으로는 1호선 제기동역 2번 출구가 가장 가깝습니다.']
  ]},
 {slug:'jegi-dong',keyword:'제기동 치과',updated:'2026-10-12',
  title:'제기동 치과 | 더굿모닝치과의원 — 제기동역 2번 출구 85m',
  description:'제기동 치과 더굿모닝치과의원. 1호선 제기동역 2번 출구에서 85m, 동대문구 왕산로 123 2층. 어르신 틀니·전신질환 진료, 보호자 설명, 평일·주말 진료시간을 안내합니다.',
  lead:'제기동역 2번 출구에서 85m. 동네 어르신과 가족이 오래 다녀온 더굿모닝치과의원의 오시는 길과 진료 안내입니다.',
  faq:[
   ['제기동역 몇 번 출구에서 가까운가요?','1호선 제기동역 2번 출구에서 85m 거리입니다. 주소는 서울특별시 동대문구 왕산로 123, 2층입니다.'],
   ['평일 점심시간은 언제인가요?','평일 점심시간은 13:00~14:30이며, 수요일은 13:00~15:30입니다. 토요일과 일요일은 점심시간 없이 진료합니다.'],
   ['틀니가 불편한 어르신도 상담할 수 있나요?','상담할 수 있습니다. 강종승 원장은 오랫동안 어르신 진료와 틀니 진료에 집중해 왔습니다. 현재 틀니의 불편한 점과 사용 기간, 복용 중인 약을 알려주시면 가능한 방법을 설명합니다.'],
   ['혈압약이나 당뇨약을 먹고 있어도 치료할 수 있나요?','복용 중인 약과 최근 상태를 먼저 확인합니다. 필요하면 진료 전 혈압과 혈당을 측정하고, 항응고제를 드시는 분은 지혈 계획을 세웁니다. 약은 임의로 끊지 마시고 상담 때 약 목록을 보여 주세요.'],
   ['보호자가 함께 가면 치료 내용을 설명해 주나요?','네. 보호자와 함께 오시는 경우 그날 진행한 치료와 귀가 후 주의사항을 보호자분께도 설명합니다.']
  ]}
]
export const hubPath=(h:Hub)=>'/area/'+h.slug
export const findHub=(slug:string)=>hubs.find(h=>h.slug===slug)

export function hubPage(h:Hub,c:Content){
 const b=c.branches[0],other=hubs.find(x=>x!==h)!
 const hours=`<dl class="area-hours">${b.schedule.map((s,i)=>`<div><dt>${days[i]}</dt><dd>${esc(s.replaceAll(',',' / ')||'휴진')}</dd></div>`).join('')}</dl>`
 const t=(slug:string)=>{const x=c.treatments.find(t=>t.slug===slug);return x?`<a href="/treatments/${esc(x.slug)}">${esc(x.name)}</a>`:''}
 const doctors=`<ul class="area-doctors">${c.doctors.map(d=>`<li><a href="/doctors/${esc(d.slug)}">${esc(d.name)} 원장</a><span>${esc(d.role)}</span></li>`).join('')}</ul>`
 const sections=h.slug==='cheongnyangni'?[
  ['청량리에서 더굿모닝치과를 찾는 분들께',`<p>더굿모닝치과는 1990년 강종승 원장이 문을 연 뒤, 아들 강도욱 원장이 이어받아 2대째 같은 자리에서 진료하는 치과입니다. 네이버 플레이스에서는 ‘더굿모닝치과의원 청량리’로 찾으실 수 있습니다.</p><p>오래 다닌 어르신이 손주의 손을 잡고 다시 오시는 동네 치과로 지내 왔습니다. 그래서 한 번의 치료보다 오래 같이 관리하는 일을 먼저 생각합니다.</p>`],
  ['청량리역에서 어떻게 오나요?',`<p>청량리역에서 1호선을 타면 다음 역이 제기동역입니다. 제기동역 2번 출구로 나와 85m 거리, 서울특별시 동대문구 왕산로 123 건물 2층입니다.</p><p>버스나 도보로 오실 때는 출발지에 따라 경로가 달라지므로 지도에서 확인해 주세요.</p><p><a class="text-link" href="${esc(branchPlaceUrl(b))}" target="_blank" rel="noopener noreferrer">네이버 지도에서 길찾기 ${icon('diagonal')}</a> <a class="text-link" href="/directions">오시는 길 자세히 보기 ${icon('arrow')}</a></p>`],
  ['청량리 더굿모닝치과는 언제 진료하나요?',`<p>평일에 출근 때문에 치과를 미뤄 오셨다면 주말을 이용해 보세요. 토요일과 일요일은 점심시간 없이 진료합니다. 공휴일 진료와 임시 휴진은 전화로 먼저 확인해 주세요.</p>${hours}<p>${esc(b.note)}</p>`],
  ['청량리 근처에서 어떤 진료를 받을 수 있나요?',`<p>치과가 무서워 오래 미뤄 오신 분, 다른 곳에서 치료가 어렵다는 말을 들으신 분이 많이 찾아오십니다. 아래 진료는 원장이 직접 시간을 더 들여 설명하는 분야입니다.</p><ul class="area-links"><li>${t('sedation')} — 불안과 긴장이 큰 분을 위한 의식하진정 상담</li><li>${t('implant-revision')} — 흔들리거나 염증이 생긴 임플란트의 원인 확인</li><li>${t('implant-front')}·${t('prosthesis')} — 치아와 잇몸선을 함께 보는 앞니 치료</li><li>${t('bone-graft')}·${t('sinus-lift')} — 뼈가 부족하거나 상악동 문제가 있는 경우</li><li>${t('sedation-disabled')}·${t('sedation-systemic')} — 장애가 있거나 전신질환이 있는 분</li></ul>`],
  ['치과가 무서워 오래 미뤄 오셨다면',`<p>진료실에서 “무서워서 몇 년을 미뤘어요”라는 말씀을 자주 듣습니다. 미룬 시간만큼 치아는 더 상하고 치료 범위도 커집니다. 더굿모닝치과는 치과마취과학회 정회원인 강도욱 원장이 의식하진정(수면치료)을 함께 계획해, 긴장과 불안이 큰 분도 치료를 시작할 수 있도록 돕습니다.</p><p>의식하진정은 전신마취와 다르며, 스스로 호흡하고 부르면 반응할 수 있는 상태입니다. 치료 과정이 잘 기억나지 않는 경우가 많지만 기억과 감각이 남는 정도는 사람마다 다르고, 진정 후에는 졸림이나 어지러움이 있을 수 있어 보호자와 함께 귀가해야 합니다.</p>`],
  ['임플란트나 상악동 문제로 다시 치료를 고민한다면',`<p>임플란트 주변 잇몸이 붓거나 고름이 나고, 보철물이 자꾸 빠진다면 원인부터 다시 확인해야 합니다. 위쪽 어금니 치료 뒤 코로 물이 넘어오거나 냄새가 계속된다면 상악동 문제가 함께 있을 수 있습니다. 치주과 전문의인 강도욱 원장이 잇몸·잇몸뼈와 상악동 상태를 함께 보고, 유지할 수 있는 것과 다시 해야 하는 것을 구분해 설명합니다. 이전에 받은 치료 기록과 영상이 있으면 꼭 가져와 주세요.</p>`],
  ['누가 진료하나요?',`<p>치주과·보철과·통합치의학과 전문의를 포함한 원장 다섯 명이 진료합니다. 원장별 진료 요일은 예약할 때 확인해 주세요.</p>${doctors}`],
  ['처음 방문 전에 무엇을 준비하면 좋을까요?',`<p>복용 중인 약의 이름을 확인할 수 있는 목록, 이전 치료 기록이나 영상이 있다면 함께 가져와 주세요. 수면치료를 원하시면 예약할 때 먼저 말씀해 주시면 사전 확인 절차를 안내합니다. 거동이 불편하신 분은 이동 방법과 필요한 도움을 미리 알려주세요.</p>`]
 ]:[
  ['제기동역 바로 앞, 동네 치과',`<p>더굿모닝치과의원은 1호선 제기동역 2번 출구에서 85m 떨어진 서울특별시 동대문구 왕산로 123, 2층에 있습니다. 경동시장과 약령시로 잘 알려진 제기동에서 1990년부터 같은 자리를 지켜 왔습니다.</p><p>강종승 원장이 시작한 진료를 아들 강도욱 원장이 이어, 부모님 세대와 자녀·손주 세대가 함께 다니는 가족이 많습니다.</p>`],
  ['제기동역에서 어떻게 오나요?',`<p>제기동역 2번 출구로 나오시면 85m 거리입니다. 건물 2층으로 올라오시면 됩니다. 휠체어 이동이나 엘리베이터 이용이 필요하신 분은 내원 전에 병원에 확인해 주세요.</p><p><a class="text-link" href="${esc(branchPlaceUrl(b))}" target="_blank" rel="noopener noreferrer">네이버 지도에서 위치 보기 ${icon('diagonal')}</a> <a class="text-link" href="/directions">오시는 길 자세히 보기 ${icon('arrow')}</a></p>`],
  ['진료시간과 점심시간',`<p>평일 점심시간은 13:00부터 14:30까지이고, 수요일은 15:30까지입니다. 시장이나 볼일을 보신 뒤 들르시는 분은 점심시간을 피해 전화로 먼저 예약해 주시면 기다리는 시간을 줄일 수 있습니다.</p>${hours}`],
  ['어르신 진료와 틀니',`<p>강종승 원장은 소아 진료를 제외한 여러 분야를 오래 진료해 왔고, 특히 어르신 진료와 틀니에 집중해 왔습니다. 틀니가 헐겁거나 씹을 때 아프신 분, 틀니와 임플란트를 함께 고민하시는 분은 현재 사용 중인 틀니를 가지고 오세요.</p><ul class="area-links"><li>${t('implant-denture')} — 틀니를 임플란트로 고정하는 방법</li><li>${t('implant-full')} — 전체 구강 상태와 전신 상태부터 확인</li><li><a href="/doctors/kang-jongseung">강종승 원장 소개</a></li></ul>`],
  ['복용 약이 많거나 전신질환이 있어도 괜찮을까요?',`<p>고혈압·당뇨·골다공증, 심장 수술 후 항응고제 복용처럼 관리가 필요한 상태는 진료 전에 먼저 확인합니다. 필요하면 혈압과 혈당을 재고, 지혈 준비와 약물 확인을 거친 뒤 치료 범위를 정합니다. 강도욱 원장은 인근 종합병원에서 전신질환이 있는 환자를 의뢰받아 진료하기도 합니다.</p><ul class="area-links"><li>${t('implant-systemic')}</li><li>${t('sedation-systemic')}</li></ul>`],
  ['부모님과 자녀가 함께 다니는 치과',`<p>부모님이 다니시던 치과에 자녀가 오고, 그 자녀가 다시 아이의 손을 잡고 오는 가족이 많습니다. 오랫동안 같은 병원에서 진료 기록이 이어지면 이전 치료의 경과를 비교해 보기 쉽고, 치료 후에도 정기 검진으로 변화를 함께 살필 수 있습니다. 강종승 원장의 진료를 받아 오신 분들은 지금도 같은 자리에서 진료를 이어가실 수 있습니다.</p>`],
  ['수면치료가 필요한 어르신이라면',`<p>치과 치료가 오래 걸리거나 입을 오래 벌리고 있기 힘든 어르신, 치료에 대한 두려움이 큰 분은 의식하진정을 함께 상담할 수 있습니다. 다만 나이와 전신 상태, 복용 약, 호흡 상태에 따라 진정이 적합하지 않을 수 있어 사전 평가를 먼저 합니다. 진정 치료 당일에는 보호자와 함께 오셔서 함께 귀가해 주세요.</p><ul class="area-links"><li>${t('sedation')}</li><li>${t('implant-sedation')}</li></ul>`],
  ['보호자와 함께 오시는 경우',`<p>거동이 불편하신 부모님을 모시고 오는 일은 보호자에게도 큰 부담입니다. 진료 자세와 이동을 함께 돕고, 그날 진행한 치료 내용과 귀가 후 주의사항을 보호자분께 꼭 설명합니다.</p>`]
 ]
 const toc=sections.map(([title],i)=>`<a href="#area-${i+1}">${esc(title)}</a>`).join('')
 return heading('LOCAL DENTAL GUIDE',h.keyword,h.lead)+`<section class="content-section area-hub" data-area-hub="${esc(h.slug)}"><div class="wrap article-layout"><article class="article-body prose"><nav class="area-toc" aria-label="이 페이지 바로가기">${toc}<a href="#area-faq">자주 묻는 질문</a></nav>${h.slug==='cheongnyangni'?`<section class="area-topics" id="area-topics">${topicGrid('청량리 진료별 안내','청량리·제기동에서 오시는 분들이 많이 묻는 진료를 주제별로 정리했습니다. 오시는 길, 진료 선택 기준, 예약·상담 흐름을 확인하세요.')}</section>`:''}${sections.map(([title,body],i)=>`<section id="area-${i+1}"><h2>${esc(title)}</h2>${body}</section>`).join('')}<section id="area-faq"><h2>${h.slug==='cheongnyangni'?'청량리에서 오시는 분들이 자주 묻는 질문':'제기동 주민분들이 자주 묻는 질문'}</h2>${faqList(h.faq,'area-'+h.slug)}</section><p class="subtle">함께 보기: <a href="${hubPath(other)}">${esc(other.keyword)}</a> · <a href="/">더굿모닝치과</a> 홈 · 최종 수정 ${esc(h.updated)}</p><p class="subtle">진료 내용과 일정은 개인 상태와 병원 사정에 따라 달라질 수 있습니다. 치료 방법·기간·효과 및 부작용은 개인에 따라 다르며, 진료 전 충분한 상담이 필요합니다.</p></article><aside class="sticky-aside"><span class="eyebrow">VISIT</span><p><strong>${esc(b.address)}</strong><br>${esc(b.station)}</p><p><a class="footer-phone branch-phone" href="tel:${b.phone.replaceAll('-','')}">${esc(b.phone)}</a></p>${button('상담·예약 안내','/reservation')}<a class="text-link" href="${esc(b.booking)}" target="_blank" rel="noopener noreferrer">네이버 예약 ${icon('diagonal')}</a></aside></div></section>`
}
export const hubSchemas=(h:Hub,origin='')=>[{'@context':'https://schema.org','@type':'FAQPage',mainEntity:h.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},...(h.slug==='cheongnyangni'?[topicItemList(origin,'청량리 진료별 안내')]:[])]

// "청량리 {진료}" sub-page. First body image = og image (same 1200×630 JPEG), FAQ = FAQPage.
export function topicPage(t:Topic,c:Content){
 const b=c.branches[0],hub=hubs[0]
 const tr=(slug:string)=>{const x=c.treatments.find(x=>x.slug===slug);return x?`<li><a href="/treatments/${esc(x.slug)}">${esc(x.name)}</a> — ${esc(x.description)}</li>`:''}
 const docs=t.doctors.map(slug=>c.doctors.find(d=>d.slug===slug)).filter(Boolean).map(d=>`<li><a href="/doctors/${esc(d!.slug)}">${esc(d!.name)} 원장</a><span>${esc(d!.role)}</span></li>`).join('')
 const toc=[...t.sections.map(([title],i)=>`<a href="#topic-${i+1}">${esc(title)}</a>`),'<a href="#topic-steps">상담·예약 흐름</a>','<a href="#topic-faq">자주 묻는 질문</a>'].join('')
 return heading('CHEONGNYANGNI CARE GUIDE',esc(t.keyword),esc(t.lead))+`<section class="content-section area-hub area-topic-page" data-area-topic="${esc(t.slug)}"><div class="wrap article-layout"><article class="article-body prose"><figure class="area-topic-hero"><img src="${t.image.og}" alt="${esc(t.image.alt)}" width="${OG_SIZE.width}" height="${OG_SIZE.height}" fetchpriority="high" decoding="async"></figure><nav class="area-toc" aria-label="이 페이지 바로가기">${toc}</nav>${t.sections.map(([title,body],i)=>`<section id="topic-${i+1}"><h2>${esc(title)}</h2>${body}</section>`).join('')}<section id="topic-steps"><h2>상담·예약 흐름</h2><ol class="area-steps">${t.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>예약은 전화 <a href="tel:${b.phone.replaceAll('-','')}">${esc(b.phone)}</a>, <a href="${esc(b.booking)}" target="_blank" rel="noopener noreferrer">네이버 예약</a>, <a href="/reservation#reservation-form">온라인 예약 상담 신청</a>으로 할 수 있습니다. 온라인 신청은 예약 확정이 아니며 병원에서 연락드려 일정을 정합니다.</p></section><section id="topic-treatments"><h2>함께 읽어 볼 진료 안내</h2><p>방법별 과정·주의사항·질문답변은 각 진료 페이지에 자세히 정리했습니다.</p><ul class="area-links">${t.treatments.map(tr).join('')}</ul>${docs?`<h3>관련 의료진</h3><ul class="area-doctors">${docs}</ul>`:''}</section><section id="topic-faq"><h2>${esc(t.keyword)} 자주 묻는 질문</h2>${faqList(t.faq,'topic-'+t.slug)}</section><section class="area-topics">${topicGrid('다른 청량리 진료 안내','',t.slug)}</section><p class="subtle">함께 보기: <a href="${hubPath(hub)}">${esc(hub.keyword)}</a> · <a href="/area/jegi-dong">제기동 치과</a> · <a href="/directions">오시는 길</a> · 최종 수정 ${esc(t.updated)}</p><p class="subtle">대표 사진: ${esc(t.image.source)}. 진료 내용과 일정은 개인 상태와 병원 사정에 따라 달라질 수 있습니다. 치료 방법·기간·효과 및 부작용은 개인에 따라 다르며, 진료 전 충분한 상담이 필요합니다.</p></article><aside class="sticky-aside"><span class="eyebrow">VISIT</span><p><strong>${esc(b.address)}</strong><br>${esc(b.station)}</p><p><a class="footer-phone branch-phone" href="tel:${b.phone.replaceAll('-','')}">${esc(b.phone)}</a></p>${button('상담·예약 안내','/reservation')}<a class="text-link" href="${esc(b.booking)}" target="_blank" rel="noopener noreferrer">네이버 예약 ${icon('diagonal')}</a><p class="area-aside-link"><a href="${hubPath(hub)}">청량리 치과 안내로 돌아가기</a></p></aside></div></section>`
}
export const topicSchemas=(t:Topic)=>[{'@context':'https://schema.org','@type':'FAQPage',mainEntity:t.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]
export {topics,topicPath,koOnly}
