(()=>{
const KEY='wgh-visitor-widget';
if(document.getElementById(KEY))return;
const style=document.createElement('style');
style.textContent=`.traffic-bottom{display:block!important;width:100%!important;max-width:1200px!important;margin:34px auto 0!important;padding:0 20px 32px!important;visibility:visible!important;opacity:1!important}.traffic-bottom-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;width:100%!important}.traffic-bottom-grid .stat{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;min-height:92px!important;padding:16px 10px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:16px!important;background:linear-gradient(145deg,#151a25,#0f131c)!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important;text-align:center!important}.traffic-bottom-grid .stat strong{display:block!important;font-size:28px!important;line-height:1!important;color:#fff!important;font-weight:950!important}.traffic-bottom-grid .stat span{display:block!important;margin-top:7px!important;font-size:10px!important;line-height:1.2!important;color:#9aa6b8!important;font-weight:800!important}@media(max-width:820px){.traffic-bottom{padding:0 14px 92px!important;margin-top:30px!important}.traffic-bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.traffic-bottom-grid .stat{min-height:80px!important;padding:12px 8px!important;border-radius:14px!important}.traffic-bottom-grid .stat strong{font-size:22px!important}.traffic-bottom-grid .stat span{font-size:9px!important;margin-top:5px!important}}`;
document.head.appendChild(style);
const panel=document.querySelector('.traffic-bottom');
if(!panel)return;
let grid=panel.querySelector('.traffic-bottom-grid');
if(!grid){grid=document.createElement('div');grid.className='traffic-bottom-grid';panel.appendChild(grid)}
if(!grid.querySelector('#visitorsToday'))grid.innerHTML='<div class="stat"><strong id="visitorsToday">…</strong><span>Besucher heute</span></div><div class="stat"><strong id="viewsToday">…</strong><span>Aufrufe heute</span></div><div class="stat"><strong id="viewsWeek">…</strong><span>Diese Woche</span></div><div class="stat"><strong id="viewsTotal">…</strong><span>Aufrufe insgesamt</span></div>';
const NS='wasgehtheute.ch';
function day(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
async function counter(action,key,opts=''){try{const q=opts?`${opts}&readOnly=true`:'readOnly=true';const r=await fetch(`https://counterapi.com/api/${encodeURIComponent(NS)}/${encodeURIComponent(action)}/${encodeURIComponent(key)}?${q}`,{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();return Number(j.value)||0}catch{return null}}
async function uniqueHit(){try{const d=day();const r=await fetch(`https://counterapi.com/api/${encodeURIComponent(NS)}/visitor-day/${encodeURIComponent(d)}?unique=true`,{cache:'no-store',keepalive:true});if(!r.ok)throw 0;const j=await r.json();return Number(j.value)||0}catch{return null}}
function show(id,n){const el=document.getElementById(id);if(el)el.textContent=n===null?'–':n.toLocaleString('de-CH')}
async function refresh(){const d=day();const [unique,today,week]=await Promise.all([uniqueHit(),counter('pageview-day',d),counter('pageview-week',d)]);show('visitorsToday',unique);show('viewsToday',today);show('viewsWeek',week);show('viewsTotal',today===null?null:today)}
async function hit(){try{const d=day();await fetch(`https://counterapi.com/api/${encodeURIComponent(NS)}/pageview-day/${encodeURIComponent(d)}`,{cache:'no-store',keepalive:true});await refresh()}catch{refresh()}}
hit();setInterval(refresh,60000);
})();