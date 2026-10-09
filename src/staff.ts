import {Hono} from 'hono'
import {getCookie} from 'hono/cookie'
export type Actor={id:string;username:string;name:string;role:'admin'|'editor'|'reviewer'|'coordinator'}
export const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('')
export const equal=(a:string,b:string)=>{let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256);return Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function getActor(c:any):Promise<Actor|null>{
 if(c.get('actorResolved'))return c.get('actor')||null
 c.set('actorResolved',true);const token=getCookie(c,'gm_session');if(!token||!c.env.DB)return null
 const row=await c.env.DB.prepare('SELECT s.user_id,u.username,u.name,u.role,u.enabled FROM admin_sessions s LEFT JOIN staff_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await digest(token),Date.now()).first()
 const actor=row?row.user_id?row.enabled?{id:row.user_id,username:row.username,name:row.name,role:row.role}:null:{id:'bootstrap',username:'',name:'소유자 관리자',role:'admin'}:null
 c.set('actor',actor);return actor
}
export async function verifyStaff(c:any,username:string,password:string):Promise<string|null>{
 const user=await c.env.DB.prepare('SELECT * FROM staff_users WHERE username=? AND enabled=1').bind(username.toLowerCase()).first();const hash=await passwordHash(password,user?.salt||'unregistered-account-timing-salt');return user&&equal(hash,user.password_hash)?user.id:null
}
export async function audit(c:any,action:string,target:string){const actor=await getActor(c);await c.env.DB.prepare('INSERT INTO audit_events(actor_id,action,target,created_at) VALUES(?,?,?,?)').bind(actor?.id||'system',action,target.slice(0,180),new Date().toISOString()).run()}
export function can(actor:Actor,path:string,method:string){
 if(actor.role==='admin')return true
 if(['/me','/logout','/password'].includes(path))return true
 if(actor.role==='coordinator')return method==='GET'&&(/^\/requests(?:\/|$)/.test(path)||path==='/assignees'||path==='/notifications')||method==='POST'&&/^\/requests\/[a-f0-9-]+$/.test(path)
 if(method==='GET')return ['/content','/review-queue','/media-library','/content-audit','/link-options'].includes(path)||/^\/history\/(column|showcase|vacancy)\//.test(path)
 if(method==='POST')return path==='/upload'||/^\/content-preview\/(column|showcase|vacancy)\//.test(path)||/^\/content\/(column|showcase|vacancy)\/[-a-z0-9]+$/.test(path)||/^\/reviews\/(column|showcase|vacancy)\/[-a-z0-9]+$/.test(path)||(actor.role==='reviewer'&&/^\/content\/(column|showcase|vacancy)\/[-a-z0-9]+\/withdraw$/.test(path))
 return false
}
export const staffRoutes=new Hono<any>()
staffRoutes.get('/me',async c=>c.json({actor:await getActor(c)}))
staffRoutes.get('/users',async c=>c.json({users:(await c.env.DB.prepare('SELECT id,username,name,role,enabled,revision,created_at FROM staff_users ORDER BY created_at').all()).results}))
staffRoutes.get('/assignees',async c=>c.json({users:(await c.env.DB.prepare("SELECT id,name FROM staff_users WHERE enabled=1 AND role IN ('admin','coordinator') ORDER BY name").all()).results}))
staffRoutes.post('/users',async c=>{
 const p=await c.req.json().catch(()=>null);if(!p||typeof p.username!=='string'||!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(p.username)||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!['admin','editor','reviewer','coordinator'].includes(p.role))return c.json({error:'아이디3~40자·이름·역할을 확인하세요.'},400)
 if((await c.env.DB.prepare('SELECT COUNT(*) n FROM staff_users').first()).n>=50)return c.json({error:'계정은 최대50개입니다.'},400)
 const id=crypto.randomUUID(),password=crypto.randomUUID()+crypto.randomUUID().slice(0,8),salt=crypto.randomUUID()
 try{await c.env.DB.prepare('INSERT INTO staff_users(id,username,name,role,password_hash,salt,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,p.username,p.name.trim(),p.role,await passwordHash(password,salt),salt,new Date().toISOString()).run()}catch{return c.json({error:'사용 중인 아이디입니다.'},409)}
 await audit(c,'staff.create',id);return c.json({ok:true,id,initialPassword:password},201)
})
staffRoutes.post('/users/:id',async c=>{
 const p=await c.req.json().catch(()=>null),actor=await getActor(c);if(!p||!Number.isInteger(p.revision)||!['admin','editor','reviewer','coordinator'].includes(p.role)||typeof p.enabled!=='boolean'||typeof p.name!=='string'||!p.name.trim()||p.name.length>80)return c.json({error:'계정 정보를 확인하세요.'},400)
 if(actor?.id===c.req.param('id')&&(!p.enabled||p.role!=='admin'))return c.json({error:'현재 관리자 본인의 권한을 해제할 수 없습니다.'},400)
 const r=await c.env.DB.batch([c.env.DB.prepare('UPDATE staff_users SET name=?,role=?,enabled=?,revision=revision+1 WHERE id=? AND revision=?').bind(p.name,p.role,p.enabled?1:0,c.req.param('id'),p.revision),c.env.DB.prepare('DELETE FROM admin_sessions WHERE user_id=? AND changes()>0').bind(c.req.param('id'))]);if(!r[0].meta.changes)return c.json({error:'변경 충돌입니다.'},409);await audit(c,'staff.update',c.req.param('id'));return c.json({ok:true})
})
staffRoutes.post('/users/:id/reset',async c=>{
 const id=c.req.param('id'),password=crypto.randomUUID()+crypto.randomUUID().slice(0,8),salt=crypto.randomUUID();const r=await c.env.DB.batch([c.env.DB.prepare('UPDATE staff_users SET password_hash=?,salt=?,revision=revision+1 WHERE id=?').bind(await passwordHash(password,salt),salt,id),c.env.DB.prepare('DELETE FROM admin_sessions WHERE user_id=?').bind(id)]);if(!r[0].meta.changes)return c.notFound();await audit(c,'staff.reset',id);return c.json({initialPassword:password})
})
staffRoutes.post('/password',async c=>{
 const actor=await getActor(c),p=await c.req.json().catch(()=>null);if(!actor||actor.id==='bootstrap')return c.json({error:'소유자 비밀번호는 Cloudflare 시크릿으로 관리합니다.'},400)
 if(typeof p?.current!=='string'||p.current.length>256||typeof p.password!=='string'||p.password.length<14||p.password.length>256)return c.json({error:'새 비밀번호는14~256자입니다.'},400)
 const u=await c.env.DB.prepare('SELECT * FROM staff_users WHERE id=?').bind(actor.id).first();if(!equal(await passwordHash(p.current,u.salt),u.password_hash))return c.json({error:'현재 비밀번호가 다릅니다.'},400)
 const salt=crypto.randomUUID();await c.env.DB.batch([c.env.DB.prepare('UPDATE staff_users SET salt=?,password_hash=?,revision=revision+1 WHERE id=?').bind(salt,await passwordHash(p.password,salt),actor.id),c.env.DB.prepare('DELETE FROM admin_sessions WHERE user_id=?').bind(actor.id)]);await audit(c,'staff.password',actor.id);return c.json({ok:true,relogin:true})
})
