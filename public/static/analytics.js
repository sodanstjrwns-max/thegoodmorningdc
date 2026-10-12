// GA4 + Microsoft Clarity loader. External file so the CSP keeps script-src without 'unsafe-inline'.
// Rendered only on the production origin's public pages. Honors Do Not Track / Global Privacy Control.
(function(){
 var tag=document.currentScript;if(!tag)return
 var ga=tag.getAttribute('data-ga')||'',clarity=tag.getAttribute('data-clarity')||''
 if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1')return
 function load(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
 if(/^G-[A-Z0-9]+$/.test(ga)){
  window.dataLayer=window.dataLayer||[]
  window.gtag=function(){window.dataLayer.push(arguments)}
  window.gtag('js',new Date())
  window.gtag('config',ga,{anonymize_ip:true})
  load('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga))
  // Conversion signals: contact channel clicks only (no form contents or personal data).
  document.addEventListener('click',function(e){
   var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return
   var h=a.getAttribute('href')||'',kind=h.indexOf('tel:')===0?'phone':/booking\.naver\.com/.test(h)?'naver_booking':/pf\.kakao\.com/.test(h)?'kakao':/talk\.naver\.com/.test(h)?'naver_talk':''
   if(kind)window.gtag('event','generate_lead',{method:kind})
  },{capture:true})
 }
 if(/^[a-z0-9]{6,20}$/.test(clarity)){
  window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)}
  load('https://www.clarity.ms/tag/'+encodeURIComponent(clarity))
 }
})()
