const CACHE='wasgehtheute-v44';
const CORE=[
 './','./index.html','./offline.html','./manifest.webmanifest','./icon.svg',
 './style.css','./professional.css','./enhancements.css','./mobile-fix.css','./accessibility.css','./app-shell.css','./mockup.css','./compact-feed.css','./quick-regions.css','./performance.css','./quality.css','./mobile-polish.css','./professional-upgrade.css','./nightlife.css',
 './site-config.js','./event-sources.js','./event-quality.js','./event-health.js','./locations.js','./app.js','./smart-search.js','./features.js','./event-images.js','./quality-ui.js','./app-shell.js','./mobile-feed.js','./event-map.js','./professional-upgrade.js','./mockup.js','./traffic.js',
 './events-1.js','./events-2.js','./events-3.js','./events-nightlife.js','./events-nightlife-extra.js','./events-update-2026-08-24.js','./events-cantons-2026-08-25.js','./events-switzerland-2026-08-25.js','./events-sargans-mels.js',
 './event.html','./event-detail.js','./nightlife.html','./nightlife.js','./buchs.html','./sargans.html','./mels.html','./zuerich.html','./chur.html','./thurgau.html','./weekend.html','./landing.js','./veranstalter.html','./organizer.js','./admin.html','./admin.js','./kantone.html','./kanton.html','./ort.html'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 // Sehr große generierte Ortsdateien werden nie in den PWA-Cache geschrieben.
 if(/events-localcities|municipalities-2026|localities-2026/.test(url.pathname)){event.respondWith(fetch(event.request));return}
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request,{cache:'no-store'});
   if(response&&response.ok)cache.put(event.request,response.clone()).catch(()=>{});
   return response;
  }catch{
   const cached=await cache.match(event.request);
   if(cached)return cached;
   if(event.request.mode==='navigate')return (await cache.match('./offline.html'))||(await cache.match('./index.html'))||Response.error();
   return Response.error();
  }
 })());
});
