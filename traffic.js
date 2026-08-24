(()=>{
const NS='wasgehtheute.ch';
const panel=document.querySelector('.traffic-bottom');
if(!panel)return;

// Alte Besucheranzeige oben entfernen. Gewuenscht sind nur die vier Werte unten.
document.getElementById('wgh-visitor-widget')?.remove();

// Das Mockup-Layout hatte die Besucherstatistik absichtlich ausgeblendet.
// Hier wird sie am Seitenende sichtbar erzwungen.
const style=document.createElement('style');
style.id='traffic-bottom-visible-style';
style.textContent=`
.traffic-bottom{display:block!important;width:min(1180px,calc(100% - 28px))!important;margin:28px auto 18px!important;padding:0!important;visibility:visible!important;opacity:1!important}
.traffic-bottom-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
.traffic-bottom .stat{display:block!important;min-width:0!important;padding:18px 12px!important;text-align:center!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:16px!important;background:linear-gradient(180deg,#111a27,#0b121d)!important;box-shadow:0 10px 28px rgba(0,0,0,.2)!important}
.traffic-bottom .stat strong{display:block!important;font-size:25px!important;line-height:1.05!important;color:#fff!important;font-weight:950!important;letter-spacing:-.04em!important}
.traffic-bottom .stat span{display:block!important;margin-top:6px!important;font-size:10px!important;line-height:1.25!important;color:#929dad!important}
.traffic-bottom .stat:first-child{border-color:rgba(74,222,128,.20)!important}
@media(max-width:820px){.traffic-bottom{width:calc(100% - 28px)!important;margin:22px 14px 90px!important}.traffic-bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.traffic-bottom .stat{padding:15px 8px!important}.traffic-bottom .stat strong{font-size:22px!important}.traffic-bottom .stat span{font-size:9px!important}}
`;
document.head.appendChild(style);

const grid=panel.querySelector('.traffic-bottom-grid');
if(grid&&!document.getElementById('viewsTotal')){
 const box=document.createElement('div');
 box.className='stat';
 box.innerHTML='<strong id="viewsTotal">…</strong><span>Aufrufe insgesamt</span>';
 grid.appendChild(box);
}

// Sicherstellen, dass die Statistik wirklich am Ende der sichtbaren Seite liegt.
const footer=document.querySelector('body.mockup-ui > footer');
if(footer&&panel.nextElementSibling!==footer)footer.before(panel);

function swissDate(){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const g=t=>p.find(x=>x.type===t)?.value;
 return `${g('year')}-${g('month')}-${g('day')}`;
}
function weekKey(){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const g=t=>Number(p.find(x=>x.type===t)?.value);
 const d=new Date(Date.UTC(g('year'),g('month')-1,g('day'))),m=(d.getUTCDay()+6)%7;
 d.setUTCDate(d.getUTCDate()-m);
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
async function counter(action,key,params={}){
 try{
  const qs=new URLSearchParams(params);
  const url=`https://counterapi.com/api/${encodeURIComponent(NS)}/${encodeURIComponent(action)}/${encodeURIComponent(key)}${qs.size?'?'+qs.toString():''}`;
  const r=await fetch(url,{cache:'no-store',keepalive:true});
  if(!r.ok)throw new Error('counter');
  const d=await r.json();
  return Number(d.value)||0;
 }catch{return null}
}
function show(id,n){
 const el=document.getElementById(id);
 if(el)el.textContent=n===null?'–':n.toLocaleString('de-CH');
}
async function refresh(){
 const day=swissDate(),week=weekKey();
 const [visitorsToday,viewsToday,viewsWeek,total]=await Promise.all([
  counter('visitor-day',day,{unique:'true',readOnly:'true'}),
  counter('pageview-day',day,{readOnly:'true'}),
  counter('pageview-week',week,{readOnly:'true'}),
  counter('pageview-total','all',{readOnly:'true'})
 ]);
 show('visitorsToday',visitorsToday);
 show('viewsToday',viewsToday);
 show('viewsWeek',viewsWeek);
 show('viewsTotal',total);
 show('globalViewCount',viewsToday);
}
async function registerVisit(){
 const day=swissDate(),week=weekKey();
 // Ein Seitenaufruf wird nur beim echten Laden der Seite registriert.
 await Promise.all([
  counter('visitor-day',day,{unique:'true'}),
  counter('pageview-day',day),
  counter('pageview-week',week),
  counter('pageview-total','all')
 ]);
 await refresh();
}

registerVisit();
// So sieht ein bereits geoeffneter Browser neue Besucher ebenfalls zeitnah.
setInterval(refresh,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();