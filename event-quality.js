(()=>{
const health=window.WGH_EVENT_HEALTH||{events:{},duplicates:[]};
const rows=Array.isArray(window.EVENTS)?window.EVENTS:[];
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const id=e=>norm(`${e.title}-${e.city}-${e.start}`);
const score=e=>[
  e.verified?5:0,e.source?3:0,e.ticket?2:0,e.image?2:0,e.venue?1:0,e.price?1:0,e.desc?Math.min(2,String(e.desc).length/120):0
].reduce((a,b)=>a+b,0);
const seen=new Map();
for(const e of rows){
  if(!e||!e.title||!e.city||!e.start)continue;
  const key=id(e),prev=seen.get(key);
  if(!prev||score(e)>score(prev))seen.set(key,e);
}
const clean=[...seen.values()];
for(const e of clean){
  const h=health.events?.[id(e)];
  if(!h)continue;
  e.health_checked_at=h.checked_at||health.checked_at||'';
  if(h.possible_cancelled){e.quality_status='cancelled-warning';e.quality_note=h.reason||'Mögliche Absage erkannt – Quelle prüfen.'}
  else if(h.possible_changed){e.quality_status='changed-warning';e.quality_note=h.reason||'Mögliche Terminänderung erkannt – Quelle prüfen.'}
  else if(h.source_ok===false){e.quality_status='source-warning';e.quality_note=h.reason||'Quelle ist momentan nicht erreichbar.'}
  else if(h.source_ok===true){e.quality_status='source-ok'}
}
window.EVENTS=clean;
window.WGH_EVENT_QUALITY={before:rows.length,after:clean.length,duplicatesRemoved:Math.max(0,rows.length-clean.length),health};
})();