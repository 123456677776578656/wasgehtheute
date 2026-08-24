const CACHE='wasgehtheute-v36';
const ASSETS=['./','./index.html','./style.css','./professional.css','./enhancements.css','./mobile-fix.css','./accessibility.css','./app-shell.css','./mockup.css','./compact-feed.css','./quick-regions.css','./performance.css','./quality.css','./mobile-polish.css','./site-config.js','./app.js','./smart-search.js','./traffic.js','./features.js','./event-images.js','./quality-ui.js','./event-quality.js','./event-health.js','./app-shell.js','./visitor-widget.js','./live-visitors.js','./mockup.js','./locations.js','./mobile-feed.js','./event-map.js','./events-1.js','./events-2.js','./events-3.js','./events-nightlife.js','./events-nightlife-extra.js','./events-update-2026-08-24.js','./events-sargans-mels.js','./manifest.webmanifest','./icon.svg','./event.html','./event-detail.js','./buchs.html','./sargans.html','./mels.html','./zuerich.html','./chur.html','./thurgau.html','./nightlife.html','./weekend.html','./winterthur.html','./uster.html','./landing.js','./veranstalter.html','./stats.html','./stats.js','./admin.html','./admin.js','./datenschutz.html','./impressum.html','./haftung.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request,{cache:'no-store'});
   if(response&&response.ok)cache.put(event.request,response.clone()).catch(()=>{});
   return response;
  }catch{
   const cached=await cache.match(event.request);
   if(cached)return cached;
   if(event.request.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
   return Response.error();
  }
 })());
});