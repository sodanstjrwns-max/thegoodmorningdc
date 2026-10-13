import {esc,icon} from './ui'
import {treatmentMedia} from './case-media-data'

// 2026-10-13 director requests: B/A + related videos inside treatment pages, implant scroll story, patient review links.
export const reviewLinks={
 naver:'https://map.naver.com/p/entry/place/19524548?placePath=%2Freview',
 google:'https://www.google.com/maps?cid=9331921146403260855'
}
export const youtubeChannel='https://www.youtube.com/channel/UCYLjg7-qpfI4ev-QkfpubFQ'
export const hasTreatmentMedia=(slug:string)=>!!treatmentMedia[slug]&&(treatmentMedia[slug].cases.length>0||treatmentMedia[slug].videos.length>0)

const dateLabel=(d:string)=>d.replaceAll('-','.')
const caseCard=(c:{img:string;title:string;url:string;date:string},name:string)=>`<li class="ba-card"><a href="${esc(c.url)}" target="_blank" rel="noopener" aria-label="${esc(c.title)} — 원장 칼럼 새 창에서 읽기"><figure class="ba-figure"><img src="/static/images/cases/${esc(c.img)}.webp" alt="${esc(name)} 치료 전후 사례 사진 (구내 사진·방사선 사진)" width="800" height="450" loading="lazy" decoding="async"><span class="ba-badge">BEFORE · AFTER</span></figure><h3 class="external-title" lang="ko">${esc(c.title)}</h3><p class="ba-meta"><span>원장 칼럼</span><time datetime="${esc(c.date)}">${dateLabel(c.date)}</time><span class="ba-open">원문 보기 ${icon('diagonal')}</span></p></a></li>`
const videoCover=(v:{id:string;title:string},i:number,name:string)=>`<li class="media-video"><button type="button" class="media-video-cover" data-video="${esc(v.id)}" aria-label="${esc(v.title)} 영상 재생"><span class="media-video-kicker">${esc(name)} / VIDEO ${String(i+1).padStart(2,'0')}</span><strong>${esc(v.title)}</strong><span class="media-video-play">${icon('play')}</span></button><p><span>YouTube · 더굿모닝치과 공식 채널</span><a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener">YouTube에서 보기 ${icon('diagonal')}</a></p></li>`

export function treatmentMediaSections(slug:string,name:string){
 const m=treatmentMedia[slug];if(!m)return ''
 const first=m.cases.slice(0,6),rest=m.cases.slice(6)
 const cases=m.cases.length?`<section id="before-after" class="ba-section" aria-labelledby="ba-title"><span class="eyebrow">CASES / BEFORE · AFTER</span><h2 id="ba-title">${esc(name)} 치료 전후 사례</h2><p class="ba-lead">사진을 누르면 강도욱 대표원장의 칼럼 원문(인블로그)이 새 창으로 열립니다. 진단 과정과 치료 순서를 함께 확인하실 수 있습니다.</p><ul class="ba-grid">${first.map(c=>caseCard(c,name)).join('')}</ul>${rest.length?`<details class="ba-more"><summary>사례 ${rest.length}건 더 보기</summary><ul class="ba-grid">${rest.map(c=>caseCard(c,name)).join('')}</ul></details>`:''}<p class="ba-legal">치료 전후 사진은 같은 부위를 같은 방식(구내 사진·방사선 사진)으로 기록한 진료 자료이며, 환자를 알아볼 수 있는 정보는 제외했습니다. 치료 방법·기간·결과는 개인의 구강 상태와 전신 건강에 따라 다르며, 같은 결과를 보장하지 않습니다.</p></section>`:''
 const videos=m.videos.length?`<section id="related-videos" class="media-video-section" aria-labelledby="related-videos-title"><span class="eyebrow">VIDEO / DOCTOR'S TALK</span><h2 id="related-videos-title">관련 ${esc(name)} 영상</h2><p class="ba-lead">원장님이 직접 설명하는 영상입니다. 누르면 이 페이지에서 바로 재생됩니다.</p><ul class="media-video-grid">${m.videos.map((v,i)=>videoCover(v,i,name)).join('')}</ul><div class="media-more"><a class="btn outline" href="/video">영상 더 보기 ${icon('arrow')}</a><a class="text-link" href="${youtubeChannel}" target="_blank" rel="noopener">YouTube 채널 열기 ${icon('diagonal')}</a></div></section>`:''
 return cases+videos
}

const implantSteps:[string,string,string,string][]=[
 ['01','빈자리','치아 하나가 빠진 자리','빠진 자리를 오래 두면 씹는 힘이 한쪽으로 몰리고, 주변 치아와 잇몸뼈에도 변화가 생길 수 있습니다.'],
 ['02','잇몸뼈 확인','시간이 지나면 잇몸뼈가 줄어들 수 있습니다','뼈의 높이와 폭은 CT로 확인합니다. 부족하다면 뼈이식이나 상악동 거상술을 함께 검토합니다.'],
 ['03','식립','잇몸뼈 안에 인공 치아 뿌리(픽스처)를 심습니다','긴장이 크다면 상담 후 수면치료(의식하진정)를 함께 계획할 수 있습니다. 뼈와 단단히 붙을 때까지 기다리는 기간이 필요합니다.'],
 ['04','연결','지대주(어버트먼트)로 보철과 연결합니다','잇몸 모양과 맞물림을 확인하며 연결 부품을 정합니다.'],
 ['05','보철','보철(크라운)을 올려 씹는 기능을 회복합니다','치료 후에도 정기 검진과 잇몸 관리가 오래 사용하는 데 중요합니다.']
]
export function implantScrollStory(){
 return `<section class="implant-scroll" id="implant-scroll-story" aria-labelledby="implant-scroll-title" data-implant-scroll><div class="implant-scroll-track"><div class="implant-scroll-stage"><header class="implant-scroll-head"><span class="eyebrow">IMPLANT STORY / THE GOOD MORNING</span><h2 id="implant-scroll-title">잃어버린 치아가,<br><em>다시 일상으로 돌아오기까지.</em></h2><p class="implant-scroll-sub">스크롤을 내리면 임플란트 치료의 흐름을 단계별로 보여드립니다.</p></header><ol class="implant-scroll-steps">${implantSteps.map(([n,label,title,text],i)=>`<li class="implant-step" data-step="${i}"><figure class="implant-step-figure"><img src="/static/images/implant-story/scene-${i+1}.webp" srcset="/static/images/implant-story/scene-${i+1}-720.webp 720w, /static/images/implant-story/scene-${i+1}.webp 1200w" sizes="(max-width:760px) 100vw, 70vw" alt="임플란트 치료 ${n}단계 · ${label}: ${title} (3D 일러스트)" width="1200" height="671" loading="lazy" decoding="async"></figure><div class="implant-step-copy"><span class="implant-step-num">${n}<small>/ 05 · ${label}</small></span><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol><div class="implant-scroll-rail" aria-hidden="true"><i></i></div><p class="implant-scroll-note">이해를 돕기 위한 3D 일러스트(AI 생성 이미지)입니다. 실제 환자 사진이 아니며, 치료 단계·기간은 개인마다 다릅니다.</p></div></div><div class="implant-scroll-finale wrap"><p>빈자리가 고민이라면, 지금 상태부터 정확히 확인해 보세요.</p><div class="implant-scroll-actions"><a class="btn primary" href="/reservation#reservation-form">임플란트 상담 신청 ${icon('arrow')}</a><a class="btn outline" href="/treatments/implant-sedation">수면 임플란트 알아보기 ${icon('arrow')}</a></div></div></section>`
}

export function patientReviews(phone:string){
 const tel=phone.replaceAll('-','')
 return `<section class="patient-reviews" id="patient-reviews" aria-labelledby="patient-reviews-title"><div class="wrap"><header class="patient-reviews-head"><span class="eyebrow">PATIENT REVIEWS</span><h2 id="patient-reviews-title">환자 리뷰 확인</h2><p>더굿모닝치과를 다녀가신 분들의 이야기는 네이버·구글에서 원문 그대로 확인하실 수 있습니다. 홈페이지에는 후기 내용이나 별점을 옮겨 싣지 않습니다.</p></header><div class="review-platforms"><a class="review-platform review-naver" href="${reviewLinks.naver}" target="_blank" rel="noopener"><span class="review-logo" aria-hidden="true">N</span><span><strong>네이버 리뷰 보기</strong><small>네이버 플레이스 · 새 창</small></span>${icon('diagonal')}</a><a class="review-platform review-google" href="${reviewLinks.google}" target="_blank" rel="noopener"><span class="review-logo" aria-hidden="true">G</span><span><strong>구글 리뷰 보기</strong><small>Google 지도 · 새 창</small></span>${icon('diagonal')}</a></div><div class="review-cta"><div><h3>리뷰를 보셨다면,<br>이제 직접 확인하실 차례입니다.</h3><p>어디가 어떻게 불편하신지 들려주세요. 진단 후 가능한 방법과 한계를 함께 설명드립니다.</p></div><div class="review-cta-actions"><a class="btn primary" href="/reservation#reservation-form">상담 예약하기 ${icon('arrow')}</a><a class="btn outline review-call" href="tel:${esc(tel)}">${icon('phone')} ${esc(phone)}</a></div></div><p class="review-note">리뷰는 각 플랫폼 이용자가 작성한 개인 경험이며, 치료 결과는 개인에 따라 다를 수 있습니다.</p></div></section>`
}

// [ko,en] pairs for the English locale (fixed UI + clinic-written video titles). External column titles stay Korean (.external-title).
const videoTitlesEn:Record<string,string>={
 'o53wvjPJ1Qg':'Several implants at once with sedation?','cwNJ2_IogFU':'Before and after dental sedation: what to know','mZqm10JIhfw':'Sedation Q&A for patients afraid of the dentist','RSVRYuEfacc':'A dentist tries dental sedation himself','ImlxcyAs3k0':'Front-tooth implants: why the gum line matters','75lgqY1nhmo':'Why waiting long after an extraction makes implants harder','XnXHKpPDjBc':'Why implant revision is called “tissue reconstruction”','Ljh4gLCFs6Y':'Full-arch implant consultation when jawbone has shrunk','78XBXtwl4Xk':'A complex full-arch implant case story','wOKCIpMNS_E':'Diabetes: the number we check before implants','effNVLiFOAE':'Sinusitis and implants: can we still consult?','XqUOZH0f4Kk':'What to keep in mind while recovering from a bone graft','Hn0D-rWsq0o':'Is a bone graft always needed for implants?','DQdEDnEaN4c':'Is my implant okay? Points to check','zDSc0CTMpcc':'What to avoid after a sinus lift','59WYhK9pWe0':'Why fungal sinus infection can appear after treatment','f3C458akJog':'A patient the director remembers','iC81hsbbwtY':'Front-tooth treatment for a patient with dental phobia from abroad','lRyHXXwYDUk':'An option between dentures and full-arch implants','rmhnPcPgpLw':'A full-arch implant story under sedation','m3yEeCz3Gvc':'After sedation: precautions in a patient’s words','s4TwunMqPsw':'Why pain can continue after a root canal','rs4mZ8YrMhw':'Hit a front tooth? Treatment by symptom','Zz7ze1HBUC4':'Exposed tooth roots: can the gum be restored?','Q7FNkewqzbo':'Root coverage for receding gums','0f7lKi2tfL4':'What is a soft-tissue graft from the palate?','xW7k824_a_o':'Why a front tooth darkens after a root canal'}
export function mediaPairs(nameEn:(ko:string)=>string,treatmentNames:Record<string,string>):[string,string][]{
 const out:[string,string][]=[
  ['사진을 누르면 강도욱 대표원장의 칼럼 원문(인블로그)이 새 창으로 열립니다. 진단 과정과 치료 순서를 함께 확인하실 수 있습니다.','Tap a photo to open Dr. Kang Dowook’s original column (Inblog, Korean) in a new tab, including the diagnosis and treatment sequence.'],
  ['치료 전후 사진은 같은 부위를 같은 방식(구내 사진·방사선 사진)으로 기록한 진료 자료이며, 환자를 알아볼 수 있는 정보는 제외했습니다. 치료 방법·기간·결과는 개인의 구강 상태와 전신 건강에 따라 다르며, 같은 결과를 보장하지 않습니다.','Before/after images are clinical records of the same area taken the same way (intraoral photos and radiographs), with identifying information removed. Methods, duration and results vary with each person’s oral and general health and are not guaranteed.'],
  ['원장 칼럼','Director’s column'],['원문 보기','Read column'],['BEFORE · AFTER','BEFORE · AFTER'],
  ['원장님이 직접 설명하는 영상입니다. 누르면 이 페이지에서 바로 재생됩니다.','Videos explained by the director (Korean). Tap to play on this page.'],
  ['YouTube · 더굿모닝치과 공식 채널','YouTube · official clinic channel'],['YouTube에서 보기','Watch on YouTube'],['영상 더 보기','More videos'],['YouTube 채널 열기','Open YouTube channel'],
  ['잃어버린 치아가,','When a tooth is lost,'],['다시 일상으로 돌아오기까지.','the way back to everyday life.'],
  ['스크롤을 내리면 임플란트 치료의 흐름을 단계별로 보여드립니다.','Scroll down to follow the implant treatment step by step.'],
  ['이해를 돕기 위한 3D 일러스트(AI 생성 이미지)입니다. 실제 환자 사진이 아니며, 치료 단계·기간은 개인마다 다릅니다.','3D illustrations (AI-generated) for explanation only — not patient photos. Steps and duration differ for each person.'],
  ['빈자리가 고민이라면, 지금 상태부터 정확히 확인해 보세요.','If a missing tooth worries you, start by checking your current condition.'],
  ['임플란트 상담 신청','Request an implant consultation'],['수면 임플란트 알아보기','About sleep implants'],
  ['빈자리','Gap'],['잇몸뼈 확인','Bone check'],['식립','Placement'],['연결','Connection'],['보철','Crown'],
  ['치아 하나가 빠진 자리','Where a tooth is missing'],['빠진 자리를 오래 두면 씹는 힘이 한쪽으로 몰리고, 주변 치아와 잇몸뼈에도 변화가 생길 수 있습니다.','Left for long, chewing shifts to one side and neighbouring teeth and jawbone may change.'],
  ['시간이 지나면 잇몸뼈가 줄어들 수 있습니다','Over time the jawbone can shrink'],['뼈의 높이와 폭은 CT로 확인합니다. 부족하다면 뼈이식이나 상악동 거상술을 함께 검토합니다.','Bone height and width are checked on CT. If insufficient, bone grafting or a sinus lift is considered.'],
  ['잇몸뼈 안에 인공 치아 뿌리(픽스처)를 심습니다','An artificial root (fixture) is placed in the jawbone'],['긴장이 크다면 상담 후 수면치료(의식하진정)를 함께 계획할 수 있습니다. 뼈와 단단히 붙을 때까지 기다리는 기간이 필요합니다.','If you are very anxious, conscious sedation can be planned after consultation. Time is needed for the fixture to bond with bone.'],
  ['지대주(어버트먼트)로 보철과 연결합니다','An abutment connects it to the crown'],['잇몸 모양과 맞물림을 확인하며 연결 부품을 정합니다.','Connection parts are chosen while checking the gum shape and bite.'],
  ['보철(크라운)을 올려 씹는 기능을 회복합니다','A crown restores chewing'],['치료 후에도 정기 검진과 잇몸 관리가 오래 사용하는 데 중요합니다.','Regular check-ups and gum care matter for long-term use.'],
  ['환자 리뷰 확인','Patient reviews'],
  ['더굿모닝치과를 다녀가신 분들의 이야기는 네이버·구글에서 원문 그대로 확인하실 수 있습니다. 홈페이지에는 후기 내용이나 별점을 옮겨 싣지 않습니다.','Read patients’ own words on Naver and Google. This website does not copy review text or ratings.'],
  ['네이버 리뷰 보기','Naver reviews'],['네이버 플레이스 · 새 창','Naver Place · new tab'],['구글 리뷰 보기','Google reviews'],['Google 지도 · 새 창','Google Maps · new tab'],
  ['리뷰를 보셨다면,','Read the reviews?'],['이제 직접 확인하실 차례입니다.','Now see for yourself.'],
  ['어디가 어떻게 불편하신지 들려주세요. 진단 후 가능한 방법과 한계를 함께 설명드립니다.','Tell us what bothers you. After diagnosis we explain the options and their limits.'],
  ['상담 예약하기','Book a consultation'],
  ['리뷰는 각 플랫폼 이용자가 작성한 개인 경험이며, 치료 결과는 개인에 따라 다를 수 있습니다.','Reviews are personal experiences written by platform users; results vary by individual.'],
  ['치료 전후 사례','Before & after'],['관련 영상','Related videos']
 ]
 const stepEn:Record<string,string>={'빈자리':'Gap','잇몸뼈 확인':'Bone check','식립':'Placement','연결':'Connection','보철':'Crown'}
 for(const [,label] of implantSteps)out.push([`/ 05 · ${label}`,`/ 05 · ${stepEn[label]||label}`])
 for(const [slug,m] of Object.entries(treatmentMedia)){
  const ko=treatmentNames[slug];if(!ko)continue;const e=nameEn(ko)
  out.push([`${ko} 치료 전후 사례`,`${e}: before & after cases`],[`관련 ${ko} 영상`,`Related videos: ${e}`])
  m.videos.forEach((v,i)=>out.push([`${ko} / VIDEO ${String(i+1).padStart(2,'0')}`,`${e} / VIDEO ${String(i+1).padStart(2,'0')}`],[v.title,videoTitlesEn[v.id]||v.title]))
  if(m.cases.length>6)out.push([`사례 ${m.cases.length-6}건 더 보기`,`${m.cases.length-6} more cases`])
 }
 return out
}
