(()=>{
const events=window.EVENTS;
if(!Array.isArray(events))return;
const key=e=>String(`${e.title||''}|${e.city||''}|${e.start||''}|${e.end||''}`).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
const seen=new Set();
for(let i=events.length-1;i>=0;i--){const e=events[i],k=key(e);if(!k||seen.has(k)){events.splice(i,1);continue}seen.add(k)}
const health=window.WGH_EVENT_HEALTH?.events||{};
for(const e of events){
 const id=String(`${e.title||''}-${e.city||''}-${e.start||''}`).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const h=health[id];
 if(h?.possible_cancelled)e.quality_status='cancelled-warning';
 else if(h?.possible_changed)e.quality_status='changed-warning';
}
window.WGH_APP?.render?.();
})();