// Retry only idempotent reads for known transient D1 failures. Never retry mutations.
export function failureCode(error:unknown){
 const text=error instanceof Error?error.message:String(error)
 if(/D1|SQLITE|database/i.test(text))return /overload|busy|locked|reset|timeout|temporar|internal error/i.test(text)?'D1_TRANSIENT':'D1_FAILURE'
 if(error instanceof SyntaxError)return 'INVALID_DATA'
 return 'REQUEST_FAILURE'
}
export async function readQuery<T>(query:()=>Promise<T>,label:string):Promise<T>{
 try{return await query()}catch(error){
  if(failureCode(error)!=='D1_TRANSIENT')throw error
  console.warn(JSON.stringify({event:'read_retry',code:'D1_TRANSIENT',operation:label}))
  await new Promise(resolve=>setTimeout(resolve,75))
  return query()
 }
}
