export function failureCode(error:unknown){
 const message=error instanceof Error?error.message:''
 if(/D1|SQLITE|database/i.test(message))return 'D1_FAILURE'
 if(error instanceof SyntaxError)return 'INVALID_DATA'
 return 'REQUEST_FAILURE'
}
// Retry only idempotent reads and only documented transient infrastructure errors.
// Never retry writes or replace authoritative CMS content with defaults on a DB failure.
export async function readWithRetry<T>(read:()=>Promise<T>,operation='public_read'):Promise<T>{
 try{return await read()}catch(error){
  const message=error instanceof Error?error.message:''
  if(!/D1_(?:ERROR|EXEC_ERROR).*?(?:reset|overload|temporar|timeout|timed out|unavailable|busy)|network connection lost|internal error; retry|database is locked/i.test(message))throw error
  console.warn(JSON.stringify({event:'read_retry',code:'D1_TRANSIENT',operation}))
  await new Promise(resolve=>setTimeout(resolve,80))
  return read()
 }
}
