(()=>{
const NS='wasgehtheute.ch';
function swissDate(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>p.find(x=>x.type===t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function weekKey(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>Number(p.find(x=>x.type===t)?.value);
  const d=new Date(Date.UTC(g('year'),g('month')-1,g('day')));
  const mondayOffset=(d.getUTCDay()+6)%7;
  d.setUTCDate(d.getUTCDate()-mondayOffset);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
async function count(action,key,opts=''){
  try{
    const url=`https://counterapi.com/api/${encodeURIComponent(NS)}/${encodeURIComponent(action)}/${encodeURIComponent(key)}${opts?`?${opts}`:''}`;
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error('counter');
    const d=await r.json();
    return Number(d.value)||0;
  }catch{return null;}
}
function show(id,n){const el=document.getElementById(id);if(el)el.textContent=n===null?'–':n.toLocaleString('de-CH');}
async function run(){
  const day=swissDate(),week=weekKey();
  const [viewsToday,viewsWeek,visitorsToday]=await Promise.all([
    count('pageview-day',day),
    count('pageview-week',week),
    count('visitor-day',day,'unique=true')
  ]);
  show('viewsToday',viewsToday);
  show('viewsWeek',viewsWeek);
  show('visitorsToday',visitorsToday);
}
run();
})();