import {marked,type Token} from 'marked'
// Never emit input HTML. Render a small explicit token allowlist instead of sanitizing arbitrary HTML.
const escape=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export const imagePath=(s:string)=>/^\/media\/[a-f0-9-]+\.(?:png|jpg|webp)$/.test(s)||/^\/static\/images\/[a-zA-Z0-9_-]+\.(?:png|jpg|webp)$/.test(s)
export const linkPath=(s:string)=>/^\/(?!\/)[^\s\\<>]*$/.test(s)||/^#[\w-]+$/.test(s)||(()=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}})()
export function markdown(text:string){
 const headings:{id:string;text:string}[]=[],images:{src:string;alt:string}[]=[]
 let number=0
 const render=(tokens:Token[],depth=0):string=>depth>24?'':tokens.map((t:any)=>{
  const nested=()=>render(t.tokens||[],depth+1)
  switch(t.type){
   case 'space':return ''
   case 'html':return escape(t.text)
   case 'heading':{const id='section-'+(++number),label=t.text.replace(/[*_`\[\]]/g,'');headings.push({id,text:label});return `<h${Math.min(3,Math.max(2,t.depth))} id="${id}">${nested()}</h${Math.min(3,Math.max(2,t.depth))}>`}
   case 'paragraph':return `<p>${nested()}</p>`
   case 'text':return t.tokens?nested():escape(t.text)
   case 'escape':return escape(t.text)
   case 'strong':return `<strong>${nested()}</strong>`
   case 'em':return `<em>${nested()}</em>`
   case 'del':return `<s>${nested()}</s>`
   case 'codespan':return `<code>${escape(t.text)}</code>`
   case 'code':return `<pre><code>${escape(t.text)}</code></pre>`
   case 'blockquote':return `<blockquote>${nested()}</blockquote>`
   case 'hr':return '<hr>'
   case 'br':return '<br>'
   case 'link':return linkPath(t.href)?`<a href="${escape(t.href)}"${t.href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${nested()}</a>`:nested()
   case 'image':{images.push({src:t.href,alt:t.text});return imagePath(t.href)?`<img src="${escape(t.href)}" alt="${escape(t.text)}" loading="lazy" decoding="async" width="1200" height="800">`:escape(t.text)}
   case 'list':{const tag=t.ordered?'ol':'ul';return `<${tag}>${t.items.map((i:any)=>`<li>${render(i.tokens||[],depth+1)}</li>`).join('')}</${tag}>`}
   case 'table':return `<div class="editorial-table" role="region" aria-label="본문 표 · 가로로 스크롤할 수 있습니다" tabindex="0"><table><caption class="sr-only">본문 표</caption><thead><tr>${t.header.map((v:any)=>`<th scope="col">${render(v.tokens,depth+1)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r:any[])=>`<tr>${r.map(v=>`<td>${render(v.tokens,depth+1)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
   default:return escape(t.raw||t.text||'')
  }
 }).join('')
 const html=render(marked.lexer(text.slice(0,40000),{gfm:true}))
 return {html,headings,images}
}
export const textSummary=(s:string)=>s.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/<[^>]*>/g,'').replace(/[#*_`>|~]/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/\s+/g,' ').trim()
export const bodyMedia=(s:string)=>markdown(s).images.map(i=>i.src)
