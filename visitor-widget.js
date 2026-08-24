(()=>{
const KEY='wgh-visitor-widget';
if(document.getElementById(KEY))return;
const style=document.createElement('style');
style.textContent=`.visitor-live-widget{margin:0 14px 14px;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:linear-gradient(135deg,rgba(20,27,39,.96),rgba(14,18,28,.96));display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.16)}.visitor-live-main{display:flex;align-items:center;gap:9px;min-width:0}.visitor-live-dot{width:9px;height:9px;border-radius:50%;background:#50e991;box-shadow:0 0 0 5px rgba(80,233,145,.08);flex:0 0 auto}.visitor-live-title{font-size:10px;font-weight:900;color:#fff}.visitor-live-sub{font-size:8px;color:#9aa6b8;margin-top:2px}.visitor-live-number{font-size:20px;font-weight:950;color:#fff;white-space:nowrap}.visitor-live-number small{font-size:8px;color:#9aa6b8;font-weight:800;margin-left:4px}@media(max-width:820px){.visitor-live-widget{margin:0 14px 12px;padding:11px 12px}.visitor-live-number{font-size:18px}}`;
document.head.appendChild(style);
const wrap=document.createElement('section');wrap.id=KEY;wrap.className='visitor-live-widget';wrap.setAttribute('aria-label','Besucherstatistik');wrap.innerHTML='<div class="visitor-live-main"><span class="visitor-live-dot"></span><div><div class="visitor-live-title">Gerade auf der Seite</div><div class="visitor-live-sub">Besucher und Aufrufe werden automatisch aktualisiert</div></div></div><div class="visitor-live-number" id="liveVisitors">…<small>heute</small></div>';
const anchor=document.querySelector('.feature-toolbar')||document.querySelector('.quick-region-wrap')||document.querySelector('.highlights-section');
anchor?.insertAdjacentElement('afterend',wrap);
function day(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
async function getCounter(){try{const d=day();const r=await fetch(`https://counterapi.com/api/wasgehtheute.ch/pageview-day/${d}`,{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();return Number(j.value)||0}catch{return null}}
async function refresh(){const n=await getCounter();const el=document.getElementById('liveVisitors');if(el)el.innerHTML=`${n===null?'–':n.toLocaleString('de-CH')}<small>heute</small>`}
refresh();setInterval(refresh,60000);
})();