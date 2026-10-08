import en from '../public/static/locales-en.json'
import ja from '../public/static/locales-ja.json'
import zh from '../public/static/locales-zh.json'
import {esc} from './ui'
export type Locale='en'|'ja'|'zh'
// Only complete, checked languages are advertised. JA/ZH generation was rate-limited.
export const locales:Locale[]=['en']
export const dictionaries:Record<Locale,Record<string,string>>={en,ja,zh}
export const normalize=(s:string)=>s.replace(/\s+/g,' ').trim()
const decode=(s:string)=>s.replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/g,c=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&#x27;':"'",'&nbsp;':' '}[c]||c))
export function translate(s:string,locale:Locale){const key=normalize(decode(s));return dictionaries[locale][key]||s}
export const localPath=(path:string,locale:string)=>path==='/'?'/'+locale:'/'+locale+path
export function languageLinks(path:string,origin:string){return ['ko',...locales].map(l=>`<link rel="alternate" hreflang="${l==='zh'?'zh-Hans':l}" href="${esc(origin+(l==='ko'?path:localPath(path,l)))}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${esc(origin+path)}">`}
export const languageSwitch=(path:string,current='ko')=>`<nav class="locale-switch" aria-label="Language">${[['ko','한국어'],['en','English'],['ja','日本語'],['zh','中文']].filter(([l])=>l==='ko'||locales.includes(l as Locale)).map(([l,name])=>`<a href="${l==='ko'?path:localPath(path,l)}" lang="${l}" hreflang="${l==='zh'?'zh-Hans':l}" ${l===current?'aria-current="page"':''}>${name}</a>`).join('')}</nav>`
const notices={en:'Machine-assisted translation of the Korean source. New posts may remain in Korean. Please contact the clinic to confirm medical information, appointments and interpreter availability.',ja:'韓国語原文の機械翻訳です。新規記事は韓国語のまま表示される場合があります。医療情報・予約・通訳の手配は医院にご確認ください。',zh:'本页由韩文原文机器辅助翻译。新内容可能仍显示为韩文。医疗信息、预约及口译安排请向诊所确认。'}
export function localizeHTML(html:string,locale:Locale,path:string,origin:string){
 const localizedUrl=origin+localPath(path,locale)
 // Generated HTML only. Preserve scripts as raw text; translate JSON values separately.
 const blocks=html.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>)/gi)
 const output=blocks.map(block=>{
  if(/^<script\b/i.test(block)){
   if(/type="application\/(?:ld\+json|json)"/.test(block))try{const open=block.indexOf('>'),close=block.lastIndexOf('</script>');const walk=(x:any):any=>typeof x==='string'?translate(x,locale):Array.isArray(x)?x.map(walk):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,walk(v)])):x;const data=walk(JSON.parse(block.slice(open+1,close)));if(Array.isArray(data)&&/ld\+json/.test(block.slice(0,open))){for(const entity of data){if(['WebPage','MedicalWebPage'].includes(entity['@type'])){entity.url=localizedUrl;entity['@id']=localizedUrl+'#webpage';entity.inLanguage=locale==='zh'?'zh-Hans':locale}if(entity['@type']==='BreadcrumbList')for(const item of entity.itemListElement||[])if(item.item?.startsWith(origin+'/'))item.item=origin+localPath(item.item.slice(origin.length),locale)}}return block.slice(0,open+1)+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>'}catch{return block}
   return block
  }
  if(/^<style\b/i.test(block))return block
  return block.split(/(<[^>]+>)/g).map(token=>{
   if(token.startsWith('<'))return token.replace(/(alt|title|aria-label|placeholder|content)="([^"]*)"/g,(_m,a,v)=>`${a}="${esc(translate(decode(v),locale))}"`).replace(/href="(\/[^"#]*)"/g,(m,p)=>/^\/(?:static|media|films|api|admin|en|ja|zh)(?:\/|\?|$)/.test(p)?m:`href="${localPath(p,locale)}"`)
   const translated=translate(decode(token),locale);return translated===decode(token)?token:esc(translated)
  }).join('')
 }).join('')
 return output.replace('<html lang="ko">',`<html lang="${locale==='zh'?'zh-Hans':locale}" data-locale="${locale}">`).replace(/<nav class="locale-switch"[\s\S]*?<\/nav>/,languageSwitch(path,locale)).replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${esc(localizedUrl)}">`).replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${esc(localizedUrl)}">`).replace(/<meta property="og:locale" content="[^"]*">/,`<meta property="og:locale" content="${{en:'en_US',ja:'ja_JP',zh:'zh_CN'}[locale]}">`).replace('id="main">',`id="main"><aside class="translation-notice wrap">${notices[locale]}</aside>`).replace('</body>',`<script src="/static/locale.js?v=13" defer></script></body>`)
}
