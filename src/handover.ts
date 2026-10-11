import source from '../handoff/DELIVERY.md?raw'
import {markdown} from './markdown'

const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))

// Public, curated guide only. Never import technical handoff notes, backups or credentials.
// Vite includes the Markdown at build time; no runtime filesystem or DB is used.
export function handoverPage(){
 const document=markdown(source.replace(/^# [^\n]+\n+/,''))
 const sections=document.headings.filter(h=>/^\d{2}\. /.test(h.text))
 const status=sections.find(h=>h.text.startsWith('09.'))?.id||''
 return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="강도욱 원장님과 운영 담당자를 위한 더굿모닝치과 홈페이지 운영·인수 안내서. 제작 의의, 관리자 사용법, 콘텐츠 운영과 인수 확인 항목을 안내합니다."><meta name="theme-color" content="#262c28"><title>더굿모닝치과 홈페이지 운영·인수 안내서</title><link rel="canonical" href="https://thegoodmorningdc.kr/handover"><link rel="icon" href="/static/images/logo-mark.png"><link rel="stylesheet" href="/static/handover.css?v=23"><script src="/static/handover.js?v=23" defer></script></head><body id="guide-top"><a class="skip-link" href="#guide-content">안내서 본문 바로가기</a>
 <header class="guide-bar"><a class="guide-brand" href="/">더굿모닝치과<span>WEBSITE HANDOVER</span></a><nav class="guide-actions" aria-label="안내서 도구"><a href="/" target="_blank" rel="noopener noreferrer">홈페이지 보기</a><button type="button" id="guide-copy" hidden>안내서 링크 복사</button><button type="button" id="guide-print" hidden>인쇄 · PDF 저장</button></nav></header>
 <main><section class="guide-cover" aria-labelledby="guide-title"><p class="eyebrow">THE GOOD MORNING DENTAL / HANDOVER GUIDE</p><p class="guide-kicker">강도욱 원장님께 · 제작 문석준</p><h1 id="guide-title">설명이 쌓일수록,<br>더 가치 있는 홈페이지.</h1><p class="guide-subtitle">더굿모닝치과 홈페이지 운영·인수 안내서</p><p class="guide-lead">검색에서 발견될 준비부터, 환자가 이해하고 상담을 선택하는 순간까지.<br>무엇을 만들었고, 어떻게 운영하면 좋은지 정리했습니다.</p><div class="guide-meta"><span>문서 기준일 2026.10.11</span><span>로그인 없이 읽는 공개 안내서</span><a href="#${status}">인수 검토 중 · 현재 상태 확인</a></div><div class="guide-quicklinks"><a class="guide-primary" href="/admin" target="_blank" rel="noopener noreferrer">관리자 열기</a><a href="#${sections[0]?.id||'guide-content'}">바로가기와 사용법 읽기</a></div><p id="guide-feedback" role="status" aria-live="polite"></p></section>
 <div class="guide-layout"><aside class="guide-index"><nav aria-label="안내서 목차"><p class="eyebrow">CONTENTS</p><ol>${sections.map(h=>`<li><a href="#${h.id}">${escape(h.text.replace(/^\d{2}\. /,''))}</a></li>`).join('')}</ol></nav><p class="guide-public-note">공개 안내서에는 비밀번호와 개인정보를 넣지 않습니다. 관리자 접근정보는 별도로 전달합니다.</p></aside><article class="guide-document" id="guide-content" tabindex="-1">${document.html}</article></div>
 </main><footer class="guide-footer"><p>더굿모닝치과 · 홈페이지 운영·인수 안내</p><p>이 문서는 공개 안내용입니다. 자료 수령·기능 검수·정식 오픈 승인은 별도 단계입니다.</p><p><a href="/handover">thegoodmorningdc.kr/handover</a><a href="#guide-top">문서 맨 위로</a></p><noscript><p>브라우저의 인쇄 메뉴에서 PDF로 저장할 수 있습니다. 본문·목차·링크는 JavaScript 없이도 이용할 수 있습니다.</p></noscript></footer></body></html>`
}
