// Public measurement and search-tool identifiers (not secrets). Empty value = not rendered.
// Values: reports/2026-10-12-thegoodmorningdc-gap-audit.md §8 (PF Web Engine console setup).
// Amplitude is permanently excluded (agency decision 2026-09-08). Use GA4 + Clarity only.
export const GA_MEASUREMENT_ID='G-CNEEQ5VCH0'
export const CLARITY_PROJECT_ID='ywkymprujk'
// Naver Search Advisor HTML-tag value. Pending from the owner; env NAVER_SITE_VERIFICATION overrides.
export const NAVER_SITE_VERIFICATION='f785841c2e30468ae35aa3553ae334175a084986'
// IndexNow key file: https://thegoodmorningdc.kr/<key>.txt returns the key itself as text/plain.
export const INDEXNOW_KEY='98fd1c7b41dc3340ee91b700aef8397d'
// Central PF dashboard stats endpoint. Bearer token is the Pages secret STATS_API_TOKEN only.
export const STATS_API_URL='https://pf-dashboard-2nt.pages.dev/api/stats/thegoodmorningdc.kr'
export const CLARITY_DASHBOARD_URL='https://clarity.microsoft.com/projects/view/'+CLARITY_PROJECT_ID+'/dashboard'
const idPattern=/^[A-Za-z0-9_-]{1,80}$/
export type Measurement={ga:string;clarity:string;naver:string}
// Analytics run only on the configured production origin's public pages (never admin/handover/previews).
export function measurement(enabled:boolean,env:{NAVER_SITE_VERIFICATION?:string}={}):Measurement{
 const naver=(env.NAVER_SITE_VERIFICATION||NAVER_SITE_VERIFICATION).trim()
 return {ga:enabled&&idPattern.test(GA_MEASUREMENT_ID)?GA_MEASUREMENT_ID:'',clarity:enabled&&idPattern.test(CLARITY_PROJECT_ID)?CLARITY_PROJECT_ID:'',naver:enabled&&idPattern.test(naver)?naver:''}
}
// CSP additions for GA4 and Clarity (Clarity's tag loads scripts.clarity.ms and reports to *.clarity.ms / c.bing.com).
export const analyticsCsp={
 script:['https://www.googletagmanager.com','https://www.clarity.ms','https://*.clarity.ms'],
 connect:['https://*.google-analytics.com','https://*.analytics.google.com','https://*.googletagmanager.com','https://www.clarity.ms','https://*.clarity.ms','https://c.bing.com'],
 img:['https://*.google-analytics.com','https://*.googletagmanager.com','https://*.clarity.ms','https://c.bing.com']
}
