(()=>{
const NS='wasgehtheute.ch';
const panel=document.querySelector('.traffic-bottom');
if(!panel||getComputedStyle(panel).display==='none')return;
function swissDate(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t)?.value;return `${g('year')}-${g('month')}-${g('day')}`}
function weekKey(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const g=t=>Number(p.find(x=>x.type===t)?.value);const d=new Date(Date.UTC(g('year'),g('month')-1,g('day'))),m=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-m);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
async function hit(action,key,opts=''){try{const url=`https://counterapi.com/api/${encodeURIComponent(NS)}/${encodeURIComponent(action)}/${encodeURIComponent(key)}${opts?`?${opts}`:''}`;const r=await fetch(url,{cache:'no-store',keepalive:true});if(!r.ok)throw new Error('counter');const d=await r.json();return Number(d.value)||0}catch{return null}}
async function read(action,key,opts=''){try{const q=opts?`${opts}&readOnly=true`:'readOnly=true';const url=`https://counterapi.com/api/${encodeURIComponent(NS)}/${encodeURIComponent(action)}/${encodeURIComponent(key)}?${q}`;const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('counter');const d=await r.json();return Number(d.value)||0}catch{return null}}
function show(id,n){const el=document.getElementById(id);if(el)el.textContent=n===null?'–':n.toLocaleString('de-CH')}
async function run(){
 const day=swissDate(),week=weekKey();
 // Every new page visit increments these counters exactly once.
 const [viewsToday,viewsWeek,uniqueToday]=await Promise.all([
   hit('pageview-day',day),
   hit('pageview-week',week),
   hit('visitor-day',day,'unique=true')
 ]);
 show('viewsToday',viewsToday);
 show('viewsWeek',viewsWeek);
 show('visitorsToday',uniqueToday);
 const global=await read('pageview-day',day);
 show('globalViewCount',global);
}
run();
setInterval(run,60000);
})();