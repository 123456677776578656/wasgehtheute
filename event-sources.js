(()=>{
if(window.__WGH_EVENT_SOURCES_LOADED)return;
window.__WGH_EVENT_SOURCES_LOADED=true;
const files=[
 'events-catalog.js?v=1',
 'event-health.js?v=5',
 'event-quality.js?v=4',
 'pro-event-experience.js?v=1'
];
function tag(src){return `<script src="${src}"><\/script>`}
if(document.readyState==='loading'){
 document.write(files.map(tag).join(''));
 window.WGH_EVENTS_READY=Promise.resolve().then(()=>window.EVENTS||[]);
 return;
}
window.WGH_EVENTS_READY=files.reduce((p,src)=>p.then(()=>new Promise((resolve,reject)=>{
 const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Eventquelle konnte nicht geladen werden: ${src}`));document.head.appendChild(s);
})),Promise.resolve()).then(()=>window.EVENTS||[]).catch(err=>{
 console.error(err);
 window.EVENTS=Array.isArray(window.EVENTS)?window.EVENTS:[];
 return window.EVENTS;
});
})();
