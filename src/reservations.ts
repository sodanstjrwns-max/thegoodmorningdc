import type {Content} from './content'
import {esc} from './ui'
import {digest} from './staff'
import {recordEvent} from './metrics'
import {notifyNewRequest} from './push'
import {RESERVATION_RETENTION_DAYS,RESERVATION_WINDOW_DAYS,timeSlots} from './reservation-copy'
export {RESERVATION_RETENTION_DAYS,RESERVATION_WINDOW_DAYS,timeSlots,reservationPairs} from './reservation-copy'

// On-site reservation/consultation requests. Stored privately (reservation_requests), shown in the
// existing admin inbox with the same roles (관리자·접수 담당) and retention/expiry handling.
// A request is not a confirmed appointment; staff call back and record the outcome.
export const CONSENT_VERSION='2026-10-13-v4'
export const reservationStatuses=['new','contacted','confirmed','cancelled']
const kstToday=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10)
const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10)
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s

export function reservationForm(c:Content){
 const today=kstToday(),last=addDays(today,RESERVATION_WINDOW_DAYS),phone=c.branches[0]?.phone||'02-969-3776'
 return `<section class="request-section wrap reservation-request" id="reservation-form" aria-labelledby="reservation-form-title"><div class="request-intro"><span class="eyebrow">ONLINE RESERVATION REQUEST</span><h2 id="reservation-form-title">홈페이지 예약 상담 신청</h2><p>희망하시는 진료와 날짜·시간대를 남겨 주시면 병원에서 확인 후 전화로 연락드려 예약을 확정합니다. 신청만으로 예약이 확정되지는 않습니다.</p><p class="subtle">급한 통증·부기·출혈은 신청서 대신 <a href="tel:${esc(phone.replaceAll('-',''))}">${esc(phone)}</a>로 바로 전화해 주세요.</p></div><form class="service-form" data-request-kind="reservation" novalidate><input type="hidden" name="locale" value="ko"><label class="form-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><div class="field-row"><label>이름<input name="name" autocomplete="name" required maxlength="80"></label><label>연락처 (휴대전화)<input name="contact" type="tel" inputmode="tel" required maxlength="25" autocomplete="tel" placeholder="010-0000-0000"></label></div><label>희망 진료<select name="treatment" required><option value="consult">상담 후 결정 · 잘 모르겠어요</option>${c.treatments.map(t=>`<option value="${esc(t.slug)}">${esc(t.name)}</option>`).join('')}</select></label><div class="field-row"><label>희망 날짜<input name="preferredDate" type="date" required min="${today}" max="${last}"></label><label>희망 시간대<select name="timeSlot" required>${timeSlots.map(([v,ko])=>`<option value="${v}">${esc(ko)}</option>`).join('')}</select></label></div><p class="subtle">토·일요일은 오후 진료가 없습니다(토 09:30–14:00, 일 10:00–14:00). 휴진일·원장별 일정은 연락 시 조율합니다.</p><label>문의 내용·연락 가능 시간 (선택)<textarea name="message" maxlength="1000" rows="4" placeholder="예: 평일 오후 6시 이후 통화 가능합니다."></textarea></label><p class="subtle">진단명·복용 약·주민등록번호 등 민감한 정보는 적지 마시고 내원 상담에서 말씀해 주세요.</p><details class="request-privacy"><summary>수집 항목·목적·보유기간 확인</summary><p>처리 주체: 더굿모닝치과의원. 목적: 예약 상담 연락과 진료 일정 조율. 필수: 이름·연락처·희망 진료·희망 날짜·희망 시간대. 선택: 문의 내용. 접수 언어·동의 문안 버전·접수일시를 함께 저장합니다.</p><p>보유기간: 접수일로부터 ${RESERVATION_RETENTION_DAYS}일. 기간 경과 후 열람을 차단하고 이후 접수 또는 관리자 요청 시 삭제합니다. 권한 있는 관리자·접수 담당자만 열람하며 광고에 이용하지 않습니다. 새 신청 알림(병원 관리자 기기)에는 희망 진료·날짜만 표시하고 이름·연락처는 넣지 않습니다.</p><p>접수는 Cloudflare의 국외 인프라에서 처리·보관될 수 있습니다. 동의를 거부할 수 있으나 온라인 신청은 제한되며, 전화(${esc(phone)})·네이버 예약·카카오 상담은 그대로 이용할 수 있습니다. 만 14세 미만은 보호자와 함께 전화로 문의해 주세요.</p><a href="/privacy">개인정보처리방침</a></details><label class="consent-field"><input type="checkbox" name="consent" value="yes" required> 위 수집·이용 안내를 확인하고 동의합니다. (필수)</label><button type="submit" class="btn primary">예약 상담 신청하기</button><p class="request-result" role="status" aria-live="polite"></p><noscript>온라인 신청에는 JavaScript가 필요합니다. 전화·네이버 예약·카카오 상담을 이용해 주세요.</noscript></form></section>`
}

// Weekday availability from the clinic schedule (index 0=Sunday) and dated exceptions.
export function slotAvailable(branch:{schedule:string[];exceptions:{date:string;hours:string}[]},day:string,slot:string){
 const exception=branch.exceptions.find(e=>e.date===day),hours=exception?exception.hours:branch.schedule[new Date(day+'T00:00:00Z').getUTCDay()]||''
 if(!hours)return false
 if(slot==='any')return true
 const periods=hours.split(',').filter(Boolean).map(p=>p.split('-'))
 return slot==='morning'?periods.some(([s])=>s<'13:00'):periods.some(([,e])=>e>'14:30')
}

const messages={
 ko:{invalid:'이름·연락처(전화번호)·개인정보 동의를 확인하세요.',treatment:'희망 진료를 선택하세요.',date:`희망 날짜는 오늘부터 ${RESERVATION_WINDOW_DAYS}일 이내로 선택하세요.`,slot:'선택한 날짜에는 해당 시간대 진료가 없습니다. 다른 날짜나 시간대를 선택해 주세요.',limit:'신청이 많습니다. 한 시간 후 다시 시도하거나 전화해 주세요.',ok:'예약 상담 신청이 접수되었습니다. 병원에서 확인 후 전화로 연락드립니다. 연락을 받기 전까지 예약은 확정되지 않습니다.'},
 en:{invalid:'Please check your name, telephone number and privacy consent.',treatment:'Please choose the treatment you are interested in.',date:`Please choose a preferred date within ${RESERVATION_WINDOW_DAYS} days from today.`,slot:'The clinic is not open for that time slot on the selected date. Please choose another date or time.',limit:'Too many requests. Please try again in an hour or call the clinic.',ok:'Your reservation request has been received. The clinic will call you to confirm. The appointment is not confirmed until we contact you.'}
}

export async function createReservation(c:any,content:Content,data:FormData,cleanup:(env:any)=>Promise<void>){
 const get=(k:string)=>typeof data.get(k)==='string'?String(data.get(k)).trim():''
 const locale=get('locale')==='en'?'en':'ko',m=messages[locale]
 if(get('website'))return c.json({error:locale==='en'?'Unable to verify the request.':'요청을 확인할 수 없습니다.'},400)
 const name=get('name'),contact=get('contact'),treatment=get('treatment'),preferredDate=get('preferredDate'),timeSlot=get('timeSlot'),message=get('message')
 if(!name||name.length>80||!/^\+?[\d ()-]{8,25}$/.test(contact)||contact.replace(/\D/g,'').length<9||message.length>1000||get('consent')!=='yes')return c.json({error:m.invalid},400)
 const t=content.treatments.find(x=>x.slug===treatment);if(treatment!=='consult'&&!t)return c.json({error:m.treatment},400)
 const now=Date.now(),today=kstToday(now)
 if(!validDate(preferredDate)||preferredDate<today||preferredDate>addDays(today,RESERVATION_WINDOW_DAYS)||!timeSlots.some(([v])=>v===timeSlot))return c.json({error:m.date},400)
 const branch=content.branches[0];if(branch&&!slotAvailable(branch,preferredDate,timeSlot))return c.json({error:m.slot},400)
 await cleanup(c.env)
 const key=await digest('rsv:'+(c.req.header('cf-connecting-ip')||'local')+':'+c.env.ADMIN_PASSWORD+':'+Math.floor(now/3600000))
 const limit=await c.env.DB.prepare('INSERT INTO request_limits(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 WHERE attempts<5').bind(key,now+3600000).run()
 if(!limit.meta.changes)return c.json({error:m.limit},429)
 const id=crypto.randomUUID(),payload={name,contact,treatment,treatmentName:t?.name||'상담 후 결정',preferredDate,timeSlot,message,locale,consentVersion:CONSENT_VERSION}
 await c.env.DB.prepare('INSERT INTO reservation_requests(id,data_json,created_at,expires_at) VALUES(?,?,?,?)').bind(id,JSON.stringify(payload),now,now+RESERVATION_RETENTION_DAYS*86400000).run()
 const slot=timeSlots.find(([v])=>v===timeSlot)![1].replace(/ \(.*$/,'')
 c.executionCtx.waitUntil(notifyNewRequest(c.env,{title:`새 예약 신청 – ${payload.treatmentName}`,body:`희망 ${preferredDate.slice(5).replace('-','/')} ${slot} · 눌러서 예약 접수함에서 확인하세요.`,url:'/admin#request-inbox',tag:'reservation-'+id}))
 if(c.req.header('DNT')!=='1'&&c.req.header('Sec-GPC')!=='1')c.executionCtx.waitUntil(recordEvent(c.env,'/reservation','form_success','cheongnyangni').catch(()=>{}))
 return c.json({ok:true,id,message:m.ok},201)
}

export async function cleanupReservations(env:any){await env.DB.prepare('DELETE FROM reservation_requests WHERE expires_at<=?').bind(Date.now()).run()}

