import type {Content} from './content'
import {textSummary} from './markdown'
export const snippet=(text:string,max=180)=>{const value=textSummary(text);return value.length>max?value.slice(0,max-1).trimEnd()+'…':value}
export function listingQuery(search:URLSearchParams){const q=(search.get('q')||'').trim().slice(0,100),raw=search.get('page')||'1',page=Number(raw);return {q,page,valid:/^[1-9]\d*$/.test(raw)&&Number.isSafeInteger(page)}}
export function listingPath(base:string,q:string,page:number){const params=new URLSearchParams();if(q)params.set('q',q);if(page>1)params.set('page',String(page));return base+(params.size?'?'+params:'')}

// Indexing is enabled only on the explicitly configured production origin.
export function productionOrigin(value?:string){
 try { const u=new URL(value||'');return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'?u.origin:'' } catch { return '' }
}
export const siteOrigin=(configured:string|undefined,requestUrl:string)=>productionOrigin(configured)||new URL(requestUrl).origin
export const launchIndexable=(configured:string|undefined,requestUrl:string)=>!!productionOrigin(configured)&&productionOrigin(configured)===new URL(requestUrl).origin
export const privatePath=(path:string)=>/^\/(?:admin|api|media)(?:\/|$)/.test(path)
export const plain=(text:string)=>text.replace(/\s+/g,' ').trim()
const labels:Record<string,string>={'/':'홈','/treatments':'진료 안내','/doctors':'의료진','/mission':'더굿모닝 약속','/tour':'공간·장비','/directions':'오시는 길','/reservation':'상담·예약','/contents':'치과 콘텐츠','/video':'원장 설명 영상','/faq':'자주 묻는 질문','/symptom-checker':'증상별 정보','/cases':'치료사례 안내','/pricing':'비급여 진료비','/careers':'채용 안내','/privacy':'개인정보 안내','/terms':'이용 안내','/blog':'건강정보','/notice':'병원 소식','/encyclopedia':'치과 백과사전','/visiting':'해외·타지역 내원','/column':'원장 칼럼'}
export function breadcrumbs(path:string,title:string){
 const items=[{name:'홈',path:'/'}];if(path==='/')return items
 const parent='/'+path.split('/')[1];if(parent!==path&&labels[parent])items.push({name:labels[parent],path:parent})
 items.push({name:labels[path]||title,path});return items
}
export function pageDescription(path:string,title:string,c:Content,override=''){
 const treatment=c.treatments.find(t=>path==='/treatments/'+t.slug),doctor=c.doctors.find(d=>path==='/doctors/'+d.slug)
 const descriptions:Record<string,string>={
  '/':'1990년부터 이어온 더굿모닝치과. 수면치료·임플란트 재수술·앞니 치료·장애인 진료를 중심으로 환자의 불편함을 한 번 더 듣습니다.',
  '/treatments':'임플란트·수면센터·일반 보존·잇몸 구강외과 진료를 증상별로 찾아보세요. 각 진료의 과정, 주의사항, 관련 의료진과 질문답변을 안내합니다.',
  '/doctors':c.doctors.map(d=>d.name).join('·')+' 원장의 제공 프로필, 전체 학력과 경력, 전문과목 및 관련 진료를 확인하세요.',
  '/mission':'아버지가 시작한 치과를 이어온 강도욱 원장의 이야기. 충분히 듣는 진료, 지역 내 폭넓은 치료, 치과 공포를 덜어내는 세 가지 약속입니다.',
  '/directions':c.branches.map(b=>b.name+' '+b.address+' · '+b.station).join(' / '),
  '/reservation':'청량리 본점·광명사거리점의 전화, 공식 네이버 예약, 카카오 상담을 지점별로 안내합니다. 진료시간과 내원 전 준비사항을 확인하세요.',
  '/pricing':'병원 제공 비급여 수가표입니다. 레진·인레이·크라운·임플란트·틀니·미백·제증명 항목별 금액과 원본 PDF를 확인하세요.',
  '/video':'강도욱 원장이 설명하는 수면치료·앞니·임플란트 재수술·장애인 진료·상악동·치료비 영상과 공식 YouTube 최신 목록입니다.',
  '/faq':'예약·내원 준비와 진료별 질문답변. 수면치료, 임플란트, 보존치료, 잇몸치료의 과정과 한계를 읽고 관련 진료로 이동하세요.',
  '/encyclopedia':'치은·치조골·교합·지대주 등 치과 용어를 가나다 색인과 검색으로 찾고 쉬운 설명 및 관련 진료를 확인하세요.',
  '/visiting':'해외·타지역에서 방문하기 전 예약, 이전 진료기록, 복용 약, 회복 일정과 귀국 후 관리 준비를 안내합니다.',
  '/tour':'제공받은 더굿모닝치과 실제 공간 사진, CT·구강스캐너·원내 기공소와 환자 상태 관찰 장비를 소개합니다.',
  '/contents':'원장 칼럼·설명 영상·건강정보·백과사전·증상별 안내·FAQ를 한곳에서 찾아보세요.',
  '/blog':'병원이 게시한 건강정보와 청량리·광명 공식 네이버 블로그의 최신 글을 구분하여 안내합니다.',
  '/column':'더굿모닝치과의 공개 칼럼과 공식 인블로그 글을 출처·주제별로 검색하세요. 진료 과정, 주의사항과 의료진의 설명을 읽어보세요.',
  '/notice':'더굿모닝치과의 진료·내원 안내와 병원 소식을 확인하세요.',
  '/symptom-checker':'불편한 증상에 맞는 진료 정보를 4단계 선택형 안내로 찾아보세요. 의료 진단이 아니며 응답은 서버에 저장하지 않습니다.',
  '/cases':'치료사례의 환자 동의·비식별화·개인차 고지 기준을 안내합니다. 승인되지 않은 환자사진은 공개하지 않습니다.',
  '/careers':'치과위생사·진료 지원·데스크·치과기공 관련 채용 문의 방법입니다. 모집 여부와 근무 조건은 희망 지점에서 안내합니다.',
  '/privacy':'사이트 정보 입력, 관리자 보안 세션 및 외부 서비스에 관한 개인정보 안내입니다.',
  '/terms':'홈페이지 의료정보의 이용 범위, 진료 예약, 저작권과 콘텐츠 이용 안내입니다.'
 }
 const text=override||(treatment?`${treatment.name}: ${treatment.description} 치료 과정·주의사항·자주 묻는 질문과 관련 의료진을 확인하세요.`:doctor?`${doctor.name} 원장 · ${doctor.role}. ${doctor.bio.slice(0,2).join(' · ')}. 전체 약력과 진료 분야를 확인하세요.`:descriptions[path]||title)
 return snippet(text)
}
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export function clinicSchemas(c:Content,origin:string){
 const org=origin+'/#organization'
 return [
  {'@context':'https://schema.org','@type':'MedicalOrganization','@id':org,name:'더굿모닝치과',url:origin+'/',logo:origin+'/static/images/logo-mark.png',sameAs:c.channels.filter(x=>x.enabled).map(x=>x.url),department:c.branches.map(b=>({'@id':origin+'/#'+b.id}))},
  ...c.branches.map(b=>({'@context':'https://schema.org','@type':'Dentist','@id':origin+'/#'+b.id,name:'더굿모닝치과 '+b.name,url:origin+'/directions?branch='+b.id,telephone:b.phone,image:origin+'/static/images/hero.webp',parentOrganization:{'@id':org},address:{'@type':'PostalAddress',streetAddress:b.address,addressCountry:'KR'},hasMap:'https://map.naver.com/p/search/'+encodeURIComponent('더굿모닝치과 '+b.address),sameAs:[b.booking,b.kakao,...c.channels.filter(x=>x.enabled&&x.branch===b.id).map(x=>x.url)].filter(Boolean),openingHoursSpecification:b.schedule.flatMap((s,i)=>s.split(',').filter(Boolean).map(period=>{const [opens,closes]=period.split('-');return {'@type':'OpeningHoursSpecification',dayOfWeek:'https://schema.org/'+days[i],opens,closes}})),...(b.exceptions.length?{specialOpeningHoursSpecification:b.exceptions.flatMap(e=>(e.hours||'00:00-00:00').split(',').map(period=>{const [opens,closes]=period.split('-');return {'@type':'OpeningHoursSpecification',validFrom:e.date,validThrough:e.date,opens,closes}}))}:{})})),
  {'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#website',name:'더굿모닝치과',alternateName:'THE GOOD MORNING DENTAL',url:origin+'/',inLanguage:'ko-KR',publisher:{'@id':org}}
 ]
}
export function pageSchemas(c:Content,origin:string,path:string,title:string,description:string,extra:object[]){
 const url=origin+path,medical=path.startsWith('/treatments/')
 return [...clinicSchemas(c,origin),{'@context':'https://schema.org','@type':medical?'MedicalWebPage':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'ko-KR',isPartOf:{'@id':origin+'/#website'},publisher:{'@id':origin+'/#organization'},...(medical?{about:{'@type':'MedicalProcedure',name:c.treatments.find(t=>path.endsWith('/'+t.slug))?.name}}:{})},
 {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:breadcrumbs(path.split('?')[0],title).map((b,i,a)=>({'@type':'ListItem',position:i+1,name:b.name,item:i===a.length-1?url:origin+b.path}))},...extra]
}
export function llmIndex(c:Content,origin:string,preview:boolean){
 return `# 더굿모닝치과\n\n> 환자의 불편함을 한 번 더 듣는 치과. 1990년부터 이어온 진료의 마음.\n\n${preview?'제작 미리보기이며 검색 색인 대상이 아닙니다.\n\n':''}의료정보는 개인의 진단을 대신하지 않습니다. 상담·검사 후 치료 적합성과 비용을 안내합니다.\n\n## 공식 안내\n`+
 Object.entries(labels).filter(([p])=>!['/','/privacy','/terms','/cases','/careers'].includes(p)).map(([p,n])=>`- [${n}](${origin+p})`).join('\n')+'\n\n## 지점\n'+c.branches.map(b=>`- [${b.name}](${origin}/directions?branch=${b.id}): ${b.address} · ${b.phone} · ${b.station}`).join('\n')+'\n\n## 진료별 설명·과정·FAQ\n'+c.treatments.map(t=>`- [${t.name}](${origin}/treatments/${t.slug}): ${plain(t.description)}`).join('\n')+'\n\n## 의료진 제공 프로필\n'+c.doctors.map(d=>`- [${d.name} 원장](${origin}/doctors/${d.slug}): ${d.role}`).join('\n')+'\n\n## 공식 외부 채널\n'+c.channels.filter(x=>x.enabled).map(x=>`- [${x.title}](${x.url})`).join('\n')+'\n'
}
