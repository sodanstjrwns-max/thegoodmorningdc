import * as source from './data'
import {readWithRetry as readQuery} from './reliability'
import {markdown,imagePath} from './markdown'

export const nativeSections = ['hero-section','care-priorities','director-story','opening-films','sedation-story','inclusive-care','trust','philosophy','question-story','why-goodmorning','treatments','preservation-assembly','revision-story','physician-deck','clinic-space-story','language-reveal','journal','visit-story','visit']
export const officialSource = 'https://thegoodmorningdental.com/'
// Official-site links, kept separate from clinic-owned player videos and RSS feeds.
// HTTPS GET follows to the same Talk account; no chat message is sent by this site.
export const officialTalkUrl = 'https://talk.naver.com/w4s3ry?frm=mnmb&frm=nmb_detail'
export const broadcastLinks = [
 {id:'EIBOfm2xcOM',publisher:'한국경제TV',title:'틀니를 오래 사용한 경우의 임플란트 · 기존 임플란트 문제 상담',description:'강도욱 원장이 출연한 건강 상담 방송입니다. 한국경제TV 공식 YouTube 채널의 원본 영상으로 연결됩니다.'},
 {id:'MPPSAHAajHc',publisher:'의학채널 비온뒤',title:'[치과] 무엇이든 물어보세요 / 굿모닝치과 강도욱',description:'강도욱 원장이 출연한 치과 질문·답변 영상입니다. 의학채널 비온뒤 공식 YouTube 채널의 원본 영상으로 연결됩니다.'}
]
// Single public clinic: Kang Do-wook, booking 1019716 / place 19524548.
export function branchPlaceUrl(b:{id:string;address:string}){const id:Record<string,string>={cheongnyangni:'19524548'};return id[b.id]?'https://map.naver.com/p/entry/place/'+id[b.id]:'https://map.naver.com/p/search/'+encodeURIComponent('더굿모닝치과 '+b.address)}
export const initialChannels = [
 {key:'blog-cheongnyangni',title:'공식 네이버 블로그',branch:'cheongnyangni',type:'naver',url:'https://blog.naver.com/thegoodmorningdent',feedId:'thegoodmorningdent',source:officialSource,enabled:true},
 {key:'youtube',title:'더굿모닝치과 YouTube',branch:'all',type:'youtube',url:'https://www.youtube.com/channel/UCYLjg7-qpfI4ev-QkfpubFQ',feedId:'UCYLjg7-qpfI4ev-QkfpubFQ',source:officialSource,enabled:true},
 {key:'column',title:'강도욱 원장 칼럼 · 인블로그',branch:'cheongnyangni',type:'column',url:'https://thegoodmorningdental.com/blog/',feedId:'',source:officialSource,enabled:true},
 // Profile name/location and indexed clinician posts match Cheongnyangni.
 // External link only: no Instagram scraping, embedded feed or inferred branch account.
 {key:'instagram-cheongnyangni',title:'더굿모닝치과 인스타그램',branch:'cheongnyangni',type:'instagram',url:'https://www.instagram.com/_thegoodmorning/',feedId:'',source:'https://www.instagram.com/_thegoodmorning/',enabled:true}
]
const schedules = [
 ['10:00-14:00','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,15:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-14:00'],
]
export const baseBranches = source.branches.map((b,i)=>({...b,booking:'https://booking.naver.com/booking/13/bizes/'+'1019716',kakao:'https://pf.kakao.com/'+'_npxibG',parking:'주차 위치와 지원 조건은 예약 시 병원에 확인해 주세요.',accessibility:'휠체어 이동·엘리베이터·진료실 진입 가능 여부를 내원 전에 병원에 확인해 주세요.',schedule:schedules[i],exceptions:[] as {date:string;hours:string;note:string}[]}))
export const baseDoctors = source.doctors.map((d,i)=>({...d,copySource:i===0?'원장 제공 원문':'진료 분야를 설명하는 홈페이지 소개 문구 · 원장 직접 인용 아님',doubleBoard:i<2,schedule:'진료 요일은 예약 시 확인해 주세요.'}))
export const defaults = {
 treatment:source.treatments,
 doctor:baseDoctors,
 video:source.videos.map((v,i)=>({...v,key:v.id,order:i})),
 faq:source.generalFaq.map(([question,answer],i)=>({key:'general-'+(i+1),question,answer,order:i})),
 section:nativeSections.map((key,order)=>({key,title:key,body:'',enabled:true,order})),
 branch:baseBranches,
 channel:initialChannels,
 site:[{key:'mission',story:source.missionStory,promises:source.missionPromises}],
 column:[] as Column[],
 showcase:[] as Showcase[],
 vacancy:[] as Vacancy[],
 operation:[] as Operation[]
}
export type Editorial={featured:boolean;summary:string;seoTitle:string;seoDescription:string;author:string;coverImage:string;coverAlt:string;faq:[string,string][];references:{label:string;url:string}[];publishedAt:string;modifiedAt:string}
export type Column=Editorial&{key:string;category:string;title:string;treatment:string;body:string;medicalReviewed:boolean;reviewedOn:string}
export type Showcase=Partial<Editorial>&{beforeAlt?:string;afterAlt?:string;duration?:string;visits?:string;key:string;category:string;title:string;treatment:string;body:string;beforeImage:string;afterImage:string;beforeDate:string;afterDate:string;caption:string;risks:string;consentConfirmed:boolean;consentRef:string;anonymized:boolean;medicalReviewed:boolean;reviewer:string;reviewedOn:string;sourceUrl:string}
export type Vacancy={key:string;title:string;branch:string;role:string;employmentType:string;schedule:string;salary:string;qualifications:string;benefits:string;body:string;deadline:string;accepting:boolean;verified:boolean;source:string}
export type Operation = {key:string;category:string;branch:string;title:string;body:string;source:string;verified:boolean;effectiveDate:string;items:{name:string;amount:string;unit:string;note:string}[]}
export type Kind = keyof typeof defaults
export const kinds=Object.keys(defaults) as Kind[]
export const keyOf=(kind:Kind,value:any)=>kind==='treatment'||kind==='doctor'?value.slug:kind==='branch'?value.id:value.key
export const baseline=(kind:Kind,key:string)=>(defaults[kind] as any[]).find(x=>keyOf(kind,x)===key)
const caseFields={beforeAlt:'',afterAlt:'',duration:'',visits:''}
const editorialFields={featured:false,summary:'',seoTitle:'',seoDescription:'',author:'',coverImage:'',coverAlt:'',faq:[],references:[],publishedAt:'',modifiedAt:''}
export const normalizeEditorial=(kind:string,value:any)=>['column','showcase'].includes(kind)?{...editorialFields,...(kind==='showcase'?caseFields:{}),...value}:value
export const templates:Record<Kind,any>={
 treatment:{slug:'',name:'',group:0,tag:'',description:'',symptoms:[''],details:[''],steps:[''],risk:'',doctor:'kang-dowook',faq:[['','']],sections:[{title:'',paragraphs:['']}],strengths:[''],related:[''],sourceLines:''},
 doctor:{slug:'',name:'',role:'',image:'portrait-0',label:'MEDICAL TEAM',text:'',bio:[''],areas:[''],copySource:'홈페이지 소개 문구 · 원장 직접 인용 아님',doubleBoard:false,schedule:'진료 요일 확인 필요'},
 video:{key:'',id:'',title:'',category:'',image:'',order:10},
 faq:{key:'',question:'',answer:'',order:10},
 section:{key:'',title:'',body:'',enabled:true,order:10},
 branch:baseBranches[0],channel:initialChannels[0],site:defaults.site[0],
 column:{...editorialFields,key:'',category:'general',title:'',treatment:'',body:'',medicalReviewed:false,reviewedOn:''},
 showcase:{...editorialFields,...caseFields,key:'',category:'case',title:'',treatment:'',body:'',beforeImage:'',afterImage:'',beforeDate:'',afterDate:'',caption:'',risks:'치료 결과와 회복 기간은 개인에 따라 다릅니다.',consentConfirmed:false,consentRef:'',anonymized:false,medicalReviewed:false,reviewer:'',reviewedOn:'',sourceUrl:''},
 vacancy:{key:'',title:'',branch:'cheongnyangni',role:'',employmentType:'',schedule:'',salary:'',qualifications:'',benefits:'',body:'',deadline:'',accepting:false,verified:false,source:''},
 operation:{key:'',category:'parking',branch:'cheongnyangni',title:'',body:'',source:'',verified:false,effectiveDate:'',items:[{name:'',amount:'',unit:'',note:''}]}
}
// Explicit shape descriptions also drive the form editor. No HTML or executable config.
export type Shape = 'text'|'number'|'boolean'|{[key:string]:Shape}|[Shape]
const T:Shape='text', N:Shape='number', B:Shape='boolean'
const editorialShape={featured:B,summary:T,seoTitle:T,seoDescription:T,author:T,coverImage:T,coverAlt:T,faq:[[T]] as Shape,references:[{label:T,url:T}] as Shape,publishedAt:T,modifiedAt:T}
export const shapes:Record<Kind,Shape>={
 treatment:{slug:T,name:T,group:N,tag:T,description:T,symptoms:[T],details:[T],steps:[T],risk:T,doctor:T,faq:[[T]],sections:[{title:T,paragraphs:[T]}],strengths:[T],related:[T],sourceLines:T},
 doctor:{slug:T,name:T,role:T,image:T,label:T,text:T,bio:[T],areas:[T],copySource:T,doubleBoard:B,schedule:T},
 video:{key:T,id:T,title:T,category:T,image:T,order:N},faq:{key:T,question:T,answer:T,order:N},section:{key:T,title:T,body:T,enabled:B,order:N},
 branch:{id:T,name:T,phone:T,address:T,station:T,hours:[[T]],note:T,booking:T,kakao:T,parking:T,accessibility:T,schedule:[T],exceptions:[{date:T,hours:T,note:T}]},
 channel:{key:T,title:T,branch:T,type:T,url:T,feedId:T,source:T,enabled:B},site:{key:T,story:[T],promises:[{title:T,text:T}]},
 column:{...editorialShape,key:T,category:T,title:T,treatment:T,body:T,medicalReviewed:B,reviewedOn:T},
 showcase:{...editorialShape,beforeAlt:T,afterAlt:T,duration:T,visits:T,key:T,category:T,title:T,treatment:T,body:T,beforeImage:T,afterImage:T,beforeDate:T,afterDate:T,caption:T,risks:T,consentConfirmed:B,consentRef:T,anonymized:B,medicalReviewed:B,reviewer:T,reviewedOn:T,sourceUrl:T},
 vacancy:{key:T,title:T,branch:T,role:T,employmentType:T,schedule:T,salary:T,qualifications:T,benefits:T,body:T,deadline:T,accepting:B,verified:B,source:T},
 operation:{key:T,category:T,branch:T,title:T,body:T,source:T,verified:B,effectiveDate:T,items:[{name:T,amount:T,unit:T,note:T}]}
}
export function safeUrl(value:string,hosts?:string[]){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(!hosts||hosts.includes(u.hostname))}catch{return false}}
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s
function shapeCheck(value:any,shape:Shape,path='본문'):void{
 if(shape==='text'){if(typeof value!=='string'||value.length>40000||/[\u0000-\u0008]/.test(value))throw Error(path+': 텍스트 길이 또는 형식을 확인하세요.');return}
 if(shape==='number'){if(!Number.isInteger(value)||value<0||value>10000)throw Error(path+': 0~10000 정수만 가능합니다.');return}
 if(shape==='boolean'){if(typeof value!=='boolean')throw Error(path+': 선택값을 확인하세요.');return}
 if(Array.isArray(shape)){if(!Array.isArray(value)||value.length>100)throw Error(path+': 목록은 최대 100개입니다.');value.forEach((x,i)=>shapeCheck(x,shape[0],path+'.'+i));return}
 if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!Object.hasOwn(shape,k)))throw Error(path+': 허용되지 않은 필드입니다.')
 for(const [key,s] of Object.entries(shape))shapeCheck(value[key],s,path+'.'+key)
}
export function validate(kind:Kind,key:string,value:any,publishing=false){
 if(!kinds.includes(kind)||!/^[-a-zA-Z0-9_]{1,75}$/.test(key))throw Error('콘텐츠 종류와 주소를 확인하세요.')
 if(['column','showcase'].includes(kind))Object.assign(value,normalizeEditorial(kind,value))
 shapeCheck(value,shapes[kind]);if(publishing&&typeof value.body==='string'&&value.body.includes('[작성 필요]'))throw Error('작성 틀의 미입력 항목을 확인하세요.');if(JSON.stringify(value).length>160000)throw Error('콘텐츠가 너무 큽니다.')
 if(keyOf(kind,value)!==key)throw Error('저장한 주소는 변경할 수 없습니다. 새 항목을 추가하세요.')
 if(['treatment','doctor'].includes(kind)&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key))throw Error('주소는 영문 소문자·숫자·하이픈만 가능합니다.')
 if(value.image&&!/^(?:[a-z0-9-]+|\/media\/[a-f0-9-]+\.(?:png|jpg|webp))$/.test(value.image))throw Error('이미지는 제공 사진 이름 또는 업로드 경로만 가능합니다.')
 if(kind==='treatment'){
  if(value.group>3||!value.name.trim()||!value.description.trim()||!value.risk.trim()||value.faq.some((x:any)=>x.length!==2||x.some((s:string)=>!s.trim())))throw Error('진료명·설명·주의사항·FAQ 질문/답변을 확인하세요.')
  if(['sedation','natural-tooth'].includes(key)&&value.steps.length!==4)throw Error('메인 과정에 연결된 이 진료는 4단계를 유지해 주세요.')
 }
 if(kind==='doctor'&&(!value.name.trim()||!value.role.trim()||!value.bio.length))throw Error('이름·자격·약력이 필요합니다.')
 if(kind==='video'&&(!/^[\w-]{11}$/.test(value.id)||!value.title.trim()))throw Error('YouTube 영상 ID 11자리와 제목이 필요합니다.')
 if(kind==='faq'&&(!value.question.trim()||!value.answer.trim()))throw Error('질문과 답변을 입력하세요.')
 if(kind==='section'&&key==='hero-section'&&(!value.enabled||value.order!==0||value.title!=='hero-section'||value.body!==''))throw Error('첫 화면 영상은 원본 구성·첫 번째 순서로 유지합니다. 다른 메인 섹션은 자유롭게 편집할 수 있습니다.')
 if(kind==='section'&&!nativeSections.includes(key)&&(!key.startsWith('custom-')||!value.title.trim()))throw Error('새 섹션 주소는 custom-으로 시작하고 제목이 필요합니다.')
 if(kind==='branch'){
  if(!source.branches.some(b=>b.id===key)||!/^0[0-9-]{8,14}$/.test(value.phone)||value.schedule.length!==7||value.hours.some((x:any)=>x.length!==2))throw Error('전화·7일 일정·시간표를 확인하세요.')
  const period=/^(?:|(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d(?:,(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d)*)$/
  for(const s of [...value.schedule,...value.exceptions.map((x:any)=>x.hours)])if(!period.test(s)||s.split(',').some((p:string)=>p&&p.split('-')[0]>=p.split('-')[1]))throw Error('일정은 09:30-13:00,14:00-18:30 형식입니다. 휴진은 빈칸입니다.')
  if(value.exceptions.some((x:any)=>!validDate(x.date))||new Set(value.exceptions.map((x:any)=>x.date)).size!==value.exceptions.length)throw Error('휴진/변경 날짜는 중복 없는 YYYY-MM-DD 형식입니다.')
  if(value.booking&&!safeUrl(value.booking,['booking.naver.com','m.booking.naver.com']))throw Error('공식 네이버 예약 주소를 입력하세요.')
  if(value.kakao&&!safeUrl(value.kakao,['pf.kakao.com']))throw Error('공식 카카오 채널 주소를 입력하세요.')
 }
 if(kind==='channel'){
  if(!['naver','youtube','column','instagram'].includes(value.type)||!['all',...source.branches.map(b=>b.id)].includes(value.branch))throw Error('채널 종류와 지점을 확인하세요.')
  const hosts:Record<string,string[]>={naver:['blog.naver.com'],youtube:['www.youtube.com'],column:['thegoodmorningdental.com'],instagram:['www.instagram.com']}
  if(!safeUrl(value.url,hosts[value.type])||!safeUrl(value.source))throw Error('공식 채널 URL과 확인 출처가 필요합니다.')
  if(value.type==='naver'&&!/^[a-zA-Z0-9_-]{1,50}$/.test(value.feedId))throw Error('네이버 블로그 ID를 확인하세요.')
  if(value.type==='youtube'&&!/^UC[\w-]{22}$/.test(value.feedId))throw Error('YouTube 채널 ID를 확인하세요.')
 }
 if(kind==='site'&&(key!=='mission'||value.promises.length!==3||!value.story.length))throw Error('미션은 세 가지 약속과 개원 스토리로 구성합니다.')
 if(['column','showcase'].includes(kind)){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key))throw Error('게시물 주소는 영문 소문자·숫자·하이픈만 사용하세요.')
  if(value.title.length>120||value.summary.length>500||value.seoTitle.length>100||value.seoDescription.length>220||value.faq.length>12||value.references.length>10)throw Error('제목120자·요약500자·검색제목100자·검색설명220자·FAQ12개·출처10개 이내로 작성하세요.')
  if(value.coverImage&&!imagePath(value.coverImage))throw Error('표지는 업로드 이미지 또는 병원 정적 이미지 경로만 사용하세요.')
  if(value.faq.some((x:any)=>x.length!==2||!x[0].trim()||!x[1].trim())||value.references.some((r:any)=>!r.label.trim()||!safeUrl(r.url)))throw Error('FAQ 질문/답변과 출처 제목/HTTPS 주소를 확인하세요.')
  if(publishing){
   if(value.body.includes('[작성 필요]'))throw Error('작성 틀의 미입력 항목을 실제 확인 내용으로 바꾸세요.')
   if(value.coverImage&&!value.coverAlt.trim())throw Error('표지의 대체 텍스트가 필요합니다.')
   if(markdown(value.body).images.some(i=>!imagePath(i.src)||!i.alt.trim()))throw Error('본문 이미지는 병원 이미지 경로와 대체 텍스트가 필요합니다.')
  }
 }
 if(kind==='column'){
  if(!['general','implant','sedation','prevention','clinic'].includes(value.category)||!value.title.trim()||!value.body.trim())throw Error('칼럼의 제목·본문·분류를 확인하세요.')
  if(publishing&&(!value.summary.trim()||!value.author||!value.medicalReviewed||!validDate(value.reviewedOn)))throw Error('칼럼 공개 전 핵심 요약·작성 의료진·의료진 검토와 검토일을 입력하세요.')
 }
 if(kind==='showcase'){
  if(!['case','review'].includes(value.category)||!value.title.trim()||!value.body.trim())throw Error('사례/후기 분류·제목·본문을 입력하세요.')
  for(const field of ['beforeImage','afterImage'])if(value[field]&&!/^\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(value[field]))throw Error('사례 이미지는 비식별 처리한 업로드 파일만 사용할 수 있습니다.')
  if(value.sourceUrl&&!safeUrl(value.sourceUrl))throw Error('출처 URL을 확인하세요.')
  if(publishing){
   if(!value.consentConfirmed||!value.consentRef.trim()||!value.anonymized||!value.medicalReviewed||!value.reviewer.trim()||!validDate(value.reviewedOn)||!value.risks.trim())throw Error('공개 동의 관리번호·비식별 확인·의료진 검토자/검토일·주의사항이 필요합니다. 동의서나 환자 이름은 입력하지 마세요.')
   if(value.category==='case'&&(!value.beforeImage||!value.afterImage||!validDate(value.beforeDate)||!validDate(value.afterDate)||value.beforeDate>value.afterDate||!value.caption.trim()))throw Error('전후 사진·촬영일·촬영 조건 및 치료 기간 설명을 확인하세요.')
  }
 }
 if(kind==='vacancy'){
  if(!['all',...source.branches.map(b=>b.id)].includes(value.branch)||!value.title.trim()||!value.role.trim())throw Error('채용 제목·직무·지점을 확인하세요.')
  if(value.deadline&&!validDate(value.deadline))throw Error('지원 마감일을 확인하세요.')
  if(publishing&&(!value.verified||!value.source.trim()||!value.employmentType.trim()||!value.schedule.trim()||!value.salary.trim()||!value.qualifications.trim()||!value.body.trim()))throw Error('확인된 고용형태·근무시간·급여·자격·내용 및 근거를 입력하세요.')
 }
 if(kind==='operation'){
  if(!['pricing','parking','accessibility','equipment','careers','legal','sedation','case','approval'].includes(value.category)||!['all',...source.branches.map(b=>b.id)].includes(value.branch))throw Error('운영정보 분류와 지점을 확인하세요.')
  if(publishing&&(!value.verified||!value.source.trim()))throw Error('공개 전 확인 체크와 승인 근거를 입력하세요.')
  if(publishing&&((value.effectiveDate&&!validDate(value.effectiveDate))||(!value.effectiveDate&&value.category!=='pricing')))throw Error('유효한 적용일을 입력하세요. 원본에 날짜가 없는 수가표만 빈칸을 허용합니다.')
  if(publishing&&['case','approval'].includes(value.category))throw Error('환자 사례와 원문 승인 자료는 현재 비공개 검토 전용입니다.')
  if(publishing&&value.category==='pricing'&&(!value.items.length||value.items.some((x:any)=>!x.name.trim()||!x.amount.trim())))throw Error('공개 수가표에 항목과 금액이 필요합니다.')
 }
}
export type Content = ReturnType<typeof assemble>
export function assemble(rows:any[]=[]){
 const sets:Record<string,any[]>=structuredClone(defaults)
 for(const row of rows){if(!row.live_json||!kinds.includes(row.kind))continue;const value=normalizeEditorial(row.kind,JSON.parse(row.live_json));const a=sets[row.kind];const i=a.findIndex(x=>keyOf(row.kind,x)===row.key);if(i<0)a.push(value);else a[i]=value}
 // Keep historical DB rows without exposing retired locations in public content.
 sets.branch=sets.branch.filter(b=>b.id==='cheongnyangni').map(b=>({...b,name:'더굿모닝치과'}));
 for(const kind of ['channel','operation','vacancy'])sets[kind]=sets[kind].filter(v=>!v.branch||['all','cheongnyangni'].includes(v.branch));
 const sort=(a:any[])=>a.sort((x,y)=>(x.order||0)-(y.order||0))
 const generalFaq=sort(sets.faq).map(x=>[x.question,x.answer] as [string,string]);const treatments=sets.treatment as source.Treatment[]
 return {treatments,doctors:sets.doctor as typeof baseDoctors,videos:sort(sets.video) as typeof defaults.video,branches:sets.branch as typeof baseBranches,generalFaq,allFaq:[...generalFaq,...treatments.flatMap(t=>t.faq)],sections:sort(sets.section) as typeof defaults.section,channels:sets.channel as typeof initialChannels,operations:sets.operation as Operation[],columns:sets.column as Column[],showcases:sets.showcase as Showcase[],vacancies:sets.vacancy as Vacancy[],missionStory:sets.site[0].story as string[],missionPromises:sets.site[0].promises as typeof source.missionPromises}
}
export async function loadContent(db:any){if(!db)return assemble();const r=await readQuery<any>(()=>db.prepare('SELECT kind,key,live_json FROM content_entries WHERE live_json IS NOT NULL').all(),'content_load');return assemble(r.results||[])}
export function validateReferences(content:Content){
 const ts=new Set(content.treatments.map(t=>t.slug)),ds=new Set(content.doctors.map(d=>d.slug))
 for(const t of content.treatments)if(!ds.has(t.doctor)||t.related.some(s=>!ts.has(s)))throw Error('담당 의료진 또는 관련 진료가 아직 공개되지 않았습니다.')
 for(const s of [...content.showcases,...content.columns]){
  if(s.treatment&&!ts.has(s.treatment))throw Error('게시물의 관련 진료가 공개되지 않았습니다.')
  if(s.author&&!ds.has(s.author))throw Error('작성 의료진이 공개되어 있지 않습니다.')
 }
 for(const d of content.doctors)if(d.areas.some(s=>!ts.has(s)))throw Error('의료진의 관련 진료가 아직 공개되지 않았습니다.')
}
