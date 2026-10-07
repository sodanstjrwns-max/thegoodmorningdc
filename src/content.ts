import * as source from './data'

export const nativeSections = ['hero-section','care-priorities','opening-films','sedation-story','inclusive-care','trust','philosophy','question-story','why-goodmorning','treatments','preservation-assembly','revision-story','physician-deck','clinic-space-story','language-reveal','journal','visit-story','visit']
export const officialSource = 'https://thegoodmorningdental.com/'
export const initialChannels = [
 {key:'blog-cheongnyangni',title:'청량리 공식 블로그',branch:'cheongnyangni',type:'naver',url:'https://blog.naver.com/thegoodmorningdent',feedId:'thegoodmorningdent',source:officialSource,enabled:true},
 {key:'blog-gwangmyeong',title:'광명 공식 블로그',branch:'gwangmyeong',type:'naver',url:'https://blog.naver.com/wa517396',feedId:'wa517396',source:officialSource,enabled:true},
 {key:'youtube',title:'더굿모닝치과 YouTube',branch:'all',type:'youtube',url:'https://www.youtube.com/channel/UCYLjg7-qpfI4ev-QkfpubFQ',feedId:'UCYLjg7-qpfI4ev-QkfpubFQ',source:officialSource,enabled:true},
 {key:'column',title:'강도욱 원장 칼럼 · 인블로그',branch:'cheongnyangni',type:'column',url:'https://thegoodmorningdental.com/blog/',feedId:'',source:officialSource,enabled:true}
]
const schedules = [
 ['10:00-14:00','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,15:30-18:30','09:30-13:00,14:30-18:30','09:30-13:00,14:30-18:30','09:30-14:00'],
 ['','09:30-13:00,14:00-20:30','09:30-13:00,14:00-18:30','09:30-13:00,14:00-18:30','09:30-13:00,14:00-18:30','09:30-13:00,14:00-18:30','09:30-14:00']
]
export const baseBranches = source.branches.map((b,i)=>({...b,booking:'https://booking.naver.com/booking/13/bizes/'+(i?'1551337':'1019716'),kakao:'https://pf.kakao.com/'+(i?'_XGQYn':'_npxibG'),parking:'주차 위치와 지원 조건은 예약 시 지점에 확인해 주세요.',accessibility:'휠체어 이동·엘리베이터·진료실 진입 가능 여부를 내원 전에 지점에 확인해 주세요.',schedule:schedules[i],exceptions:[] as {date:string;hours:string;note:string}[]}))
export const baseDoctors = source.doctors.map((d,i)=>({...d,copySource:i===0?'원장 제공 원문':'진료 분야를 설명하는 홈페이지 소개 문구 · 원장 직접 인용 아님',doubleBoard:i<2,schedule:'근무 지점과 진료 요일은 예약 시 확인해 주세요.'}))
export const defaults = {
 treatment:source.treatments,
 doctor:baseDoctors,
 video:source.videos.map((v,i)=>({...v,key:v.id,order:i})),
 faq:source.generalFaq.map(([question,answer],i)=>({key:'general-'+(i+1),question,answer,order:i})),
 section:nativeSections.map((key,order)=>({key,title:key,body:'',enabled:true,order})),
 branch:baseBranches,
 channel:initialChannels,
 site:[{key:'mission',story:source.missionStory,promises:source.missionPromises}],
 operation:[] as Operation[]
}
export type Operation = {key:string;category:string;branch:string;title:string;body:string;source:string;verified:boolean;effectiveDate:string;items:{name:string;amount:string;unit:string;note:string}[]}
export type Kind = keyof typeof defaults
export const kinds=Object.keys(defaults) as Kind[]
export const keyOf=(kind:Kind,value:any)=>kind==='treatment'||kind==='doctor'?value.slug:kind==='branch'?value.id:value.key
export const baseline=(kind:Kind,key:string)=>(defaults[kind] as any[]).find(x=>keyOf(kind,x)===key)
export const templates:Record<Kind,any>={
 treatment:{slug:'',name:'',group:0,tag:'',description:'',symptoms:[''],details:[''],steps:[''],risk:'',doctor:'kang-dowook',faq:[['','']],sections:[{title:'',paragraphs:['']}],strengths:[''],related:[''],sourceLines:''},
 doctor:{slug:'',name:'',role:'',image:'portrait-0',label:'MEDICAL TEAM',text:'',bio:[''],areas:[''],copySource:'홈페이지 소개 문구 · 원장 직접 인용 아님',doubleBoard:false,schedule:'근무 지점과 진료 요일 확인 필요'},
 video:{key:'',id:'',title:'',category:'',image:'',order:10},
 faq:{key:'',question:'',answer:'',order:10},
 section:{key:'',title:'',body:'',enabled:true,order:10},
 branch:baseBranches[0],channel:initialChannels[0],site:defaults.site[0],
 operation:{key:'',category:'parking',branch:'cheongnyangni',title:'',body:'',source:'',verified:false,effectiveDate:'',items:[{name:'',amount:'',unit:'',note:''}]}
}
// Explicit shape descriptions also drive the form editor. No HTML or executable config.
export type Shape = 'text'|'number'|'boolean'|{[key:string]:Shape}|[Shape]
const T:Shape='text', N:Shape='number', B:Shape='boolean'
export const shapes:Record<Kind,Shape>={
 treatment:{slug:T,name:T,group:N,tag:T,description:T,symptoms:[T],details:[T],steps:[T],risk:T,doctor:T,faq:[[T]],sections:[{title:T,paragraphs:[T]}],strengths:[T],related:[T],sourceLines:T},
 doctor:{slug:T,name:T,role:T,image:T,label:T,text:T,bio:[T],areas:[T],copySource:T,doubleBoard:B,schedule:T},
 video:{key:T,id:T,title:T,category:T,image:T,order:N},faq:{key:T,question:T,answer:T,order:N},section:{key:T,title:T,body:T,enabled:B,order:N},
 branch:{id:T,name:T,phone:T,address:T,station:T,hours:[[T]],note:T,booking:T,kakao:T,parking:T,accessibility:T,schedule:[T],exceptions:[{date:T,hours:T,note:T}]},
 channel:{key:T,title:T,branch:T,type:T,url:T,feedId:T,source:T,enabled:B},site:{key:T,story:[T],promises:[{title:T,text:T}]},
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
 shapeCheck(value,shapes[kind]);if(JSON.stringify(value).length>160000)throw Error('콘텐츠가 너무 큽니다.')
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
  if(!source.branches.some(b=>b.id===key)||!/^0[0-9-]{8,14}$/.test(value.phone)||value.schedule.length!==7||value.hours.some((x:any)=>x.length!==2))throw Error('지점·전화·7일 일정·시간표를 확인하세요.')
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
 for(const row of rows){if(!row.live_json||!kinds.includes(row.kind))continue;const value=JSON.parse(row.live_json);const a=sets[row.kind];const i=a.findIndex(x=>keyOf(row.kind,x)===row.key);if(i<0)a.push(value);else a[i]=value}
 const sort=(a:any[])=>a.sort((x,y)=>(x.order||0)-(y.order||0))
 const generalFaq=sort(sets.faq).map(x=>[x.question,x.answer] as [string,string]);const treatments=sets.treatment as source.Treatment[]
 return {treatments,doctors:sets.doctor as typeof baseDoctors,videos:sort(sets.video) as typeof defaults.video,branches:sets.branch as typeof baseBranches,generalFaq,allFaq:[...generalFaq,...treatments.flatMap(t=>t.faq)],sections:sort(sets.section) as typeof defaults.section,channels:sets.channel as typeof initialChannels,operations:sets.operation as Operation[],missionStory:sets.site[0].story as string[],missionPromises:sets.site[0].promises as typeof source.missionPromises}
}
export async function loadContent(db:any){if(!db)return assemble();const r=await db.prepare('SELECT kind,key,live_json FROM content_entries WHERE live_json IS NOT NULL').all();return assemble(r.results||[])}
export function validateReferences(content:Content){
 const ts=new Set(content.treatments.map(t=>t.slug)),ds=new Set(content.doctors.map(d=>d.slug))
 for(const t of content.treatments)if(!ds.has(t.doctor)||t.related.some(s=>!ts.has(s)))throw Error('담당 의료진 또는 관련 진료가 아직 공개되지 않았습니다.')
 for(const d of content.doctors)if(d.areas.some(s=>!ts.has(s)))throw Error('의료진의 관련 진료가 아직 공개되지 않았습니다.')
}
