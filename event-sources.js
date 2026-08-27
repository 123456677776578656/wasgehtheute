(()=>{
if(window.__WGH_EVENT_SOURCES_LOADED)return;
window.__WGH_EVENT_SOURCES_LOADED=true;
const files=[
 'events-1.js',
 'events-2.js',
 'events-3.js',
 'events-nightlife.js',
 'events-nightlife-extra.js',
 'events-update-2026-08-24.js',
 'events-sargans-mels.js',
 'events-cantons-2026-08-25.js',
 'events-switzerland-2026-08-25.js',
 'event-health.js?v=4',
 'event-quality.js?v=3'
];
function tag(src){return `<script src="${src}"><\/script>`}
if(document.readyState==='loading'){
 document.write(files.map(tag).join(''));
 window.WGH_EVENTS_READY=Promise.resolve();
 return;
}
window.WGH_EVENTS_READY=files.reduce((p,src)=>p.then(()=>new Promise(resolve=>{
 const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=resolve;document.head.appendChild(s);
})),Promise.resolve()).then(()=>window.EVENTS||[]);
})();
