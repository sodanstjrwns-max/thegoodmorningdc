import {XMLParser} from 'fast-xml-parser'
import {type Content,safeUrl} from './content'
export type FeedItem={title:string;url:string;date:string}
const array=(v:any)=>!v?[]:Array.isArray(v)?v:[v]
const text=(s:any)=>String(typeof s==='object'?s?.['#text']||'':s||'').replace(/<[^>]*>/g,'').slice(0,300)
export function parseFeed(xml:string,type:string):FeedItem[]{
 if(xml.length>(type==='column'?6000000:1000000)||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('허용되지 않은 피드 형식')
 if(type==='column'){let end=0;for(let i=0;i<12;i++){const next=xml.indexOf('</item>',end);if(next<0)break;end=next+7}if(end)xml=xml.slice(0,end)+'</channel></rss>'}
 const parsed=new XMLParser({ignoreAttributes:false,removeNSPrefix:true,processEntities:false}).parse(xml)
 const rows=type==='youtube'?array(parsed.feed?.entry):array(parsed.rss?.channel?.item)
 return rows.map((r:any)=>({title:text(r.title),url:type==='youtube'?array(r.link).find((l:any)=>l['@_rel']==='alternate')?.['@_href']||array(r.link)[0]?.['@_href']:text(r.link),date:text(r.published||r.pubDate)})).filter((r:FeedItem)=>r.title&&safeUrl(r.url,type==='youtube'?['www.youtube.com']:type==='column'?['thegoodmorningdental.com']:['blog.naver.com','m.blog.naver.com'])).slice(0,12)
}
export function feedUrl(channel:Content['channels'][number]){
 if(channel.type==='column')return 'https://inblog.ai/tgm-dental/rss'
 if(channel.type==='youtube'&&/^UC[\w-]{22}$/.test(channel.feedId))return 'https://www.youtube.com/feeds/videos.xml?channel_id='+channel.feedId
 if(channel.type==='naver'&&/^[a-zA-Z0-9_-]{1,50}$/.test(channel.feedId))return 'https://rss.blog.naver.com/'+channel.feedId+'.xml'
 return null
}
export async function refreshChannel(db:any,channel:Content['channels'][number],force=false){
 const url=feedUrl(channel);if(!url||!channel.enabled)return
 const key=channel.key+':'+channel.feedId,now=Date.now()
 await db.prepare('INSERT OR IGNORE INTO channel_cache(key) VALUES(?)').bind(key).run()
 // Atomic lease avoids refresh storms. Manual checks also honor cache/backoff.
 const lock=await db.prepare('UPDATE channel_cache SET next_attempt=? WHERE key=? AND next_attempt<?').bind(now+(force?60000:3600000),key,now).run()
 if(!lock.meta.changes)return
 try{
  const limit=channel.type==='column'?6000000:1000000;
  const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(channel.type==='column'?12000:6000)});if(!r.ok)throw Error('외부 응답 '+r.status)
  if(Number(r.headers.get('content-length'))>limit)throw Error('피드 크기 초과')
  const reader=r.body?.getReader();if(!reader)throw Error('빈 피드');let size=0;const chunks:Uint8Array[]=[]
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Error('피드 크기 초과')}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
  const items=parseFeed(new TextDecoder().decode(bytes),channel.type).filter(i=>channel.type!=='column'||new URL(i.url).pathname.startsWith('/blog/'));if(!items.length)throw Error('유효한 항목 없음')
  await db.prepare('UPDATE channel_cache SET items_json=?,fetched_at=?,error=?,next_attempt=? WHERE key=?').bind(JSON.stringify(items),now,'',now+3600000,key).run()
 }catch(e){await db.prepare('UPDATE channel_cache SET error=?,next_attempt=? WHERE key=?').bind(e instanceof Error?e.message:'연결 실패',now+300000,key).run()}
}
export async function channelListing(db:any,content:Content,waitUntil?:(promise:Promise<any>)=>void){
 const result=[]
 for(const ch of content.channels.filter(c=>c.enabled)){
  const cached=await db?.prepare('SELECT * FROM channel_cache WHERE key=?').bind(ch.key+':'+ch.feedId).first()
  if(db&&feedUrl(ch)&&(!cached||cached.next_attempt<Date.now())&&waitUntil)waitUntil(refreshChannel(db,ch))
  result.push({...ch,items:cached?JSON.parse(cached.items_json) as FeedItem[]:[],fetchedAt:cached?.fetched_at||0,stale:!!cached?.error})
 }
 return result
}
