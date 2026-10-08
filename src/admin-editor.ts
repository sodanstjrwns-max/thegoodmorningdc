/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {TableKit} from '@tiptap/extension-table'
import Placeholder from '@tiptap/extension-placeholder'
import {Markdown} from '@tiptap/markdown'
const instances=new Map<HTMLTextAreaElement,{editor:Editor;host:HTMLElement}>()
const safeImage=(url:string)=>/^\/(media|static\/images)\/[\w-]+\.(png|jpg|webp)$/.test(url)
const SafeImage=Image.extend({parseHTML(){return[{tag:'img[src]',getAttrs:(element:any)=>safeImage(element.getAttribute('src')||'')?null:false}]}})
async function prepareImage(file:File){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('5MB 이하 JPG·PNG·WebP 이미지만 업로드할 수 있습니다.')
 const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000){bitmap.close();throw Error('이미지 해상도를 4천만 픽셀 이하로 줄여 주세요.')}
 const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio)
 canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close()
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('이미지 변환 실패')),'image/webp',.86))
 return blob
}
function mount(textarea:HTMLTextAreaElement){
 if(instances.has(textarea))return instances.get(textarea)!.editor
 const host=document.createElement('section');host.className='rich-composer';host.setAttribute('aria-label','본문 서식 편집기')
 const toolbar=document.createElement('div');toolbar.className='rich-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','본문 서식')
 const area=document.createElement('div'),status=document.createElement('p');status.className='rich-editor-status';status.setAttribute('role','status')
 const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.hidden=true
 textarea.after(host);host.append(toolbar,area,status,file);textarea.classList.add('rich-source');textarea.hidden=true
 const setStatus=(text:string)=>status.textContent=text
 let uploading=false
 const editor=new Editor({element:area,extensions:[StarterKit.configure({heading:{levels:[2,3]},underline:false,link:{openOnClick:false,defaultProtocol:'https',protocols:['https']}}),SafeImage.configure({allowBase64:false}),TableKit.configure({table:{resizable:false}}),Placeholder.configure({placeholder:'제목은 위에서, 본문은 여기서 작성하세요. / 대신 상단 도구로 소제목·표·이미지를 넣을 수 있습니다.'}),Markdown],content:textarea.value,contentType:'markdown',editorProps:{attributes:{'aria-label':'본문 시각 편집','role':'textbox','aria-multiline':'true'},handleDrop:(_v,event)=>{if(event.dataTransfer?.files.length){event.preventDefault();upload(event.dataTransfer.files[0]);return true}return false},handlePaste:(_v,event)=>{const image=[...(event.clipboardData?.files||[])].find(f=>f.type.startsWith('image/'));if(image){event.preventDefault();upload(image);return true}return false}},onUpdate:()=>{textarea.value=editor.getMarkdown();textarea.dispatchEvent(new Event('input',{bubbles:true}));stats()},onSelectionUpdate:()=>updateButtons()})
 const commands:{button:HTMLButtonElement;active?:()=>boolean}[]=[]
 function stats(){const n=editor.getText().length;setStatus(`${n.toLocaleString()}자 · 약 ${Math.max(1,Math.ceil(n/500))}분 읽기 · 이미지 업로드 시 최대1600px로 최적화`);updateButtons()}
 function updateButtons(){for(const c of commands)if(c.active)c.button.setAttribute('aria-pressed',String(c.active()))}
 function button(label:string,action:()=>void,active?:()=>boolean){const b=document.createElement('button');b.type='button';b.textContent=label;b.title=label;b.setAttribute('aria-label',label);b.onmousedown=e=>e.preventDefault();b.onclick=action;toolbar.append(b);commands.push({button:b,active});return b}
 button('실행 취소',()=>{editor.chain().focus().undo().run()});button('다시 실행',()=>{editor.chain().focus().redo().run()})
 button('본문',()=>{editor.chain().focus().setParagraph().run()},()=>editor.isActive('paragraph'))
 button('소제목 H2',()=>{editor.chain().focus().toggleHeading({level:2}).run()},()=>editor.isActive('heading',{level:2}))
 button('소제목 H3',()=>{editor.chain().focus().toggleHeading({level:3}).run()},()=>editor.isActive('heading',{level:3}))
 button('굵게',()=>{editor.chain().focus().toggleBold().run()},()=>editor.isActive('bold'))
 button('기울임',()=>{editor.chain().focus().toggleItalic().run()},()=>editor.isActive('italic'))
 button('취소선',()=>{editor.chain().focus().toggleStrike().run()},()=>editor.isActive('strike'))
 button('글머리 목록',()=>{editor.chain().focus().toggleBulletList().run()},()=>editor.isActive('bulletList'))
 button('번호 목록',()=>{editor.chain().focus().toggleOrderedList().run()},()=>editor.isActive('orderedList'))
 button('인용',()=>{editor.chain().focus().toggleBlockquote().run()},()=>editor.isActive('blockquote'))
 button('구분선',()=>{editor.chain().focus().setHorizontalRule().run()})
 const dialog=document.createElement('dialog');dialog.className='rich-link-dialog';dialog.innerHTML='<form method="dialog"><h3>링크 또는 이미지 설명</h3><label>HTTPS 주소 또는 /내부경로<input name="url" type="text" maxlength="1500"></label><label>설명·대체 텍스트<input name="label" type="text" maxlength="250" required></label><p role="alert"></p><div><button value="cancel" formnovalidate>취소</button><button value="apply">적용</button></div></form>';host.append(dialog)
 const form=dialog.querySelector('form')!,urlInput=form.elements.namedItem('url') as HTMLInputElement,labelInput=form.elements.namedItem('label') as HTMLInputElement
 let onApply:(url:string,label:string)=>void=()=>{}
 form.addEventListener('submit',event=>{event.stopPropagation();if((event.submitter as HTMLButtonElement).value==='cancel')return;const u=urlInput.value.trim();if(!urlInput.disabled&&!/^https:\/\/[^\s]+$|^\/(?!\/)[^\s\\]*$/.test(u)){event.preventDefault();form.querySelector('p')!.textContent='HTTPS 주소 또는 /로 시작하는 병원 경로를 입력하세요.';return}event.preventDefault();dialog.close();onApply(u,labelInput.value.trim())})
 function ask(title:string,src:string,alt:string,callback:(url:string,label:string)=>void,altOnly=false){form.querySelector('h3')!.textContent=title;form.querySelector('p')!.textContent='';urlInput.value=src;urlInput.disabled=altOnly;labelInput.value=alt;onApply=callback;dialog.showModal();(altOnly?labelInput:urlInput).focus()}
 button('링크',()=>ask('링크 삽입',editor.getAttributes('link').href||'',editor.state.doc.textBetween(editor.state.selection.from,editor.state.selection.to),(href,label)=>{if(editor.state.selection.empty)editor.chain().focus().insertContent({type:'text',text:label,marks:[{type:'link',attrs:{href}}]}).run();else editor.chain().focus().extendMarkRange('link').setLink({href}).run()}))
 button('링크 해제',()=>{editor.chain().focus().unsetLink().run()})
 button('표 3×3',()=>{editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()})
 button('행 추가',()=>{editor.chain().focus().addRowAfter().run()});button('열 추가',()=>{editor.chain().focus().addColumnAfter().run()});button('행 삭제',()=>{editor.chain().focus().deleteRow().run()});button('열 삭제',()=>{editor.chain().focus().deleteColumn().run()});button('표 삭제',()=>{editor.chain().focus().deleteTable().run()})
 button('이미지 업로드',()=>file.click())
 button('이미지 설명',()=>{if(!editor.isActive('image')){setStatus('이미지를 먼저 선택하세요.');return}const attrs=editor.getAttributes('image');ask('이미지 대체 텍스트',attrs.src,attrs.alt||'',(_src,alt)=>{editor.chain().focus().updateAttributes('image',{alt}).run()},true)})
 button('마크다운 보기',()=>{textarea.hidden=!textarea.hidden;area.hidden=!textarea.hidden;if(!textarea.hidden)textarea.focus();else editor.commands.setContent(textarea.value,{contentType:'markdown'});})
 button('집중 모드',()=>{host.classList.toggle('rich-focus');document.body.classList.toggle('rich-focus-open',host.classList.contains('rich-focus'));editor.commands.focus()})
 async function upload(input:File){if(uploading)return;uploading=true;setStatus('이미지를 최적화해 비공개 저장소에 업로드 중입니다…');try{const blob=await prepareImage(input),r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':blob.type},body:blob}),d:any=await r.json();if(!r.ok)throw Error(d.error||'업로드 실패');if(!host.isConnected)return;ask('이미지 대체 텍스트 (환자 이름 금지)',d.url,'',(_src,alt)=>{editor.chain().focus().setImage({src:d.url,alt}).run();stats()},true)}catch(e){setStatus((e as Error).message)}finally{uploading=false;file.value=''}}
 file.onchange=()=>{if(file.files?.[0])upload(file.files[0])}
 textarea.addEventListener('input',()=>{if(!textarea.hidden)editor.commands.setContent(textarea.value,{contentType:'markdown',emitUpdate:false})})
 host.addEventListener('keydown',e=>{if(e.key==='Escape'&&host.classList.contains('rich-focus')){host.classList.remove('rich-focus');document.body.classList.remove('rich-focus-open')}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();textarea.closest('form')?.requestSubmit()}})
 instances.set(textarea,{editor,host});stats();return editor
}
function destroy(root:HTMLElement){for(const [ta,instance]of instances)if(root.contains(ta)){instance.editor.destroy();instance.host.remove();ta.hidden=false;instances.delete(ta);document.body.classList.remove('rich-focus-open')}}
function sync(textarea:HTMLTextAreaElement){const e=instances.get(textarea)?.editor;if(e)e.commands.setContent(textarea.value,{contentType:'markdown',emitUpdate:false})}
;(window as any).GMRichEditor={mount,destroy,sync,prepareImage,setEditable:(root:HTMLElement,editable:boolean)=>{for(const [ta,i]of instances)if(root.contains(ta))i.editor.setEditable(editable,false)}}
// The legacy announcement editor shares the same safe visual editing surface.
const form=document.querySelector<HTMLFormElement>('#post-editor')
if(form){const refresh=()=>{const ta=form.elements.namedItem('body') as HTMLTextAreaElement;if(form.hidden)destroy(form);else{mount(ta);sync(ta)}};new MutationObserver(refresh).observe(form,{attributes:true,attributeFilter:['hidden']});refresh()}
