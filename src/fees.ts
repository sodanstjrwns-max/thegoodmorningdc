import {Hono} from 'hono'
import {promotionalFee,normalizeFeeItems} from './content'
import {audit} from './staff'
import {queueIndexNow} from './indexnow'

// 수가 관리: admin-only editor for the public non-covered fee table(s) plus the whole-page switch.
// Edits apply to both the published copy and the draft (other draft fields are preserved), with
// compare-and-swap on the entry revision and a content_history snapshot. Default stays ON.
export const feeRoutes=new Hono<any>()
type Item={name:string;amount:string;unit:string;note:string;hidden:boolean}
const limits={name:100,amount:60,unit:30,note:200}
async function pageSetting(db:any){const r=await db.prepare("SELECT value_json,revision FROM operation_settings WHERE key='fee_page'").first();return {enabled:r?JSON.parse(r.value_json).enabled!==false:true,revision:r?.revision||0}}
export function checkFeeItems(items:any):Item[]{
 if(!Array.isArray(items)||!items.length||items.length>100)throw Error('수가 항목은 1~100개입니다. 페이지 전체를 숨기려면 ‘수가 페이지 공개’를 끄세요.')
 return items.map((raw:any,i:number)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['name','amount','unit','note','hidden'].includes(k)))throw Error(`${i+1}번째 항목 형식을 확인하세요.`)
  const item:Item={name:'',amount:'',unit:'',note:'',hidden:raw.hidden===true}
  for(const k of ['name','amount','unit','note'] as const){const v=raw[k]??'';if(typeof v!=='string'||v.length>limits[k]||/[\u0000-\u001f<>]/.test(v))throw Error(`${i+1}번째 항목의 ${k==='name'?'항목명':k==='amount'?'금액':k==='unit'?'단위':'비고'}을 확인하세요.`);item[k]=v.trim()}
  if(!item.name||!item.amount)throw Error(`${i+1}번째 항목의 항목명과 금액을 입력하세요.`)
  if(promotionalFee.test([item.name,item.amount,item.unit,item.note].join(' ')))throw Error(`${i+1}번째 항목: 의료법상 할인·이벤트·특가 등 가격 홍보 문구는 게시하지 않습니다. 실제 금액만 입력하세요.`)
  return item
 })
}
feeRoutes.get('/fees',async c=>{
 const rows=(await c.env.DB.prepare("SELECT key,draft_json,live_json,revision,updated_at FROM content_entries WHERE kind='operation'").all()).results||[]
 const entries=rows.map((r:any)=>({r,live:r.live_json?JSON.parse(r.live_json):null,draft:JSON.parse(r.draft_json)})).filter((x:any)=>(x.live||x.draft).category==='pricing').map(({r,live,draft}:any)=>{const v=normalizeFeeItems(structuredClone(live||draft));return {key:r.key,title:v.title,published:!!live,verified:!!v.verified,revision:r.revision,updatedAt:r.updated_at,items:v.items,source:v.source,pdf:r.key==='fees-0324-review'?'/static/fees-0324.pdf':''}})
 return c.json({entries,page:await pageSetting(c.env.DB),note:'저장하면 공개 수가표에 바로 반영됩니다(최대 2분 캐시). 원본 PDF 링크는 그대로 유지되며, PDF 파일 교체는 제작 담당자와 진행합니다.'})
})
feeRoutes.post('/fees/:key',async c=>{
 const key=c.req.param('key'),p=await c.req.json().catch(()=>null);if(!p||!Number.isInteger(p.revision))return c.json({error:'수가표 버전을 확인하세요.'},400)
 let items:Item[];try{items=checkFeeItems(p.items)}catch(e){return c.json({error:(e as Error).message},400)}
 const row=await c.env.DB.prepare("SELECT draft_json,live_json,revision FROM content_entries WHERE kind='operation' AND key=?").bind(key).first();if(!row)return c.notFound()
 const draft=JSON.parse(row.draft_json),live=row.live_json?JSON.parse(row.live_json):null;if((live||draft).category!=='pricing')return c.json({error:'수가표 항목이 아닙니다.'},400)
 if(row.revision!==p.revision)return c.json({error:'다른 창에서 수가표가 변경되었습니다. 새로고침 후 다시 수정하세요.'},409)
 draft.items=items;if(live)live.items=items
 const now=new Date().toISOString(),draftJson=JSON.stringify(draft),liveJson=live?JSON.stringify(live):null
 const result=await c.env.DB.batch([c.env.DB.prepare("UPDATE content_entries SET draft_json=?,live_json=?,revision=revision+1,updated_at=? WHERE kind='operation' AND key=? AND revision=?").bind(draftJson,liveJson,now,key,p.revision),c.env.DB.prepare('INSERT INTO content_history(kind,key,action,snapshot,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind('operation',key,live?'publish':'draft',liveJson||draftJson,now)])
 if(!result[0].meta.changes)return c.json({error:'다른 창에서 수가표가 변경되었습니다. 새로고침 후 다시 수정하세요.'},409)
 await c.env.DB.prepare("UPDATE content_reviews SET state='stale',updated_at=? WHERE kind='operation' AND key=?").bind(now,key).run()
 await audit(c,'fees.update',key)
 if(live)queueIndexNow(c,['/pricing'],'fees.update')
 return c.json({ok:true,revision:p.revision+1,published:!!live,visible:items.filter(i=>!i.hidden).length,total:items.length})
})
feeRoutes.post('/fees-page',async c=>{
 const p=await c.req.json().catch(()=>null);if(!p||typeof p.enabled!=='boolean'||!Number.isInteger(p.revision))return c.json({error:'공개 설정과 버전을 확인하세요.'},400)
 const value=JSON.stringify({enabled:p.enabled}),r=p.revision===0?await c.env.DB.prepare("INSERT OR IGNORE INTO operation_settings(key,value_json) VALUES('fee_page',?)").bind(value).run():await c.env.DB.prepare("UPDATE operation_settings SET value_json=?,revision=revision+1 WHERE key='fee_page' AND revision=?").bind(value,p.revision).run()
 if(!r.meta.changes)return c.json({error:'설정 변경 충돌입니다. 새로고침하세요.'},409)
 await audit(c,'fees.page.'+(p.enabled?'on':'off'),'fee_page');queueIndexNow(c,['/pricing'],'fees.page')
 return c.json({ok:true,page:await pageSetting(c.env.DB)})
})
