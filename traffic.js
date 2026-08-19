(()=>{
const NS='wasgehtheute-ch';
function swissDate(d=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function weekKey(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const y=Number(parts.find(p=>p.type==='year').value),m=Number(parts.find(p=>p.type==='month').value),d=Number(parts.find(p=>p.type==='day').value);
  const local=new Date(Date.UTC(y,m-1,d));
  const day=(local.getUTCDay()+6)%7;
  local.setUTCDate(local.getUTCDate()-day);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth()+1).padStart(2,'0')}-${String(local.getUTCDate()).padStart(2,'0')}`;
}
async function hit(name,up){
  try{
    const r=await fetch(`https://api.counterapi.dev/v1/${NS}/${encodeURIComponent(name)}/${up?'up':''}`,{cache:'no-store'});
    if(!r.ok)throw new Error('counter');
    const d=await r.json();
    return Number(d.count??d.value??d.result??0)||0;
  }catch{return null;}
}
function show(id,n){const el=document.getElementById(id);if(el)el.textContent=n===null?'–':n.toLocaleString('de-CH');}
async function run(){
  const day=swissDate();
  const week=weekKey();
  const viewsToday=await hit(`views-day-${day}`,true);
  const viewsWeek=await hit(`views-week-${week}`,true);
  const visitStorage=`wgh-visitor-counted-${day}`;
  let visitorsToday;
  if(localStorage.getItem(visitStorage)==='1') visitorsToday=await hit(`visitors-day-${day}`,false);
  else{
    visitorsToday=await hit(`visitors-day-${day}`,true);
    try{localStorage.setItem(visitStorage,'1')}catch{}
  }
  show('viewsToday',viewsToday);
  show('viewsWeek',viewsWeek);
  show('visitorsToday',visitorsToday);
}
run();
})();