(()=>{
const NS='wasgehtheute.ch';
const panel=document.querySelector('.traffic-bottom');
if(!panel)return;

document.getElementById('wgh-visitor-widget')?.remove();

const style=document.createElement('style');
style.id='traffic-bottom-visible-style';
style.textContent=`
.traffic-bottom{
 display:block!important;
 width:min(1180px,calc(100% - 28px))!important;
 margin:34px auto 20px!important;
 padding:0!important;
 visibility:visible!important;
 opacity:1!important;
}
.traffic-shell{
 position:relative;
 overflow:hidden;
 padding:20px!important;
 border:1px solid rgba(255,255,255,.09)!important;
 border-radius:24px!important;
 background:
   radial-gradient(circle at 8% 0%,rgba(236,59,147,.15),transparent 28%),
   radial-gradient(circle at 92% 100%,rgba(139,92,246,.13),transparent 30%),
   linear-gradient(145deg,#0f1723,#090f18)!important;
 box-shadow:0 24px 60px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035)!important;
}
.traffic-head{
 display:flex!important;
 align-items:center!important;
 justify-content:space-between!important;
 gap:14px!important;
 margin:0 0 16px!important;
 padding:0 2px!important;
}
.traffic-head-copy{min-width:0!important}
.traffic-kicker{
 display:flex!important;
 align-items:center!important;
 gap:7px!important;
 margin-bottom:4px!important;
 color:#ff67b1!important;
 font-size:9px!important;
 font-weight:950!important;
 letter-spacing:.14em!important;
 text-transform:uppercase!important;
}
.traffic-live-dot{
 width:8px!important;
 height:8px!important;
 border-radius:999px!important;
 background:#4ade80!important;
 box-shadow:0 0 0 5px rgba(74,222,128,.09),0 0 18px rgba(74,222,128,.42)!important;
 animation:trafficPulse 1.8s ease-in-out infinite!important;
}
@keyframes trafficPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.82)}}
.traffic-head h3{
 margin:0!important;
 color:#f7f9fc!important;
 font-size:20px!important;
 line-height:1.1!important;
 letter-spacing:-.035em!important;
}
.traffic-head p{
 margin:4px 0 0!important;
 color:#7f8b9d!important;
 font-size:10px!important;
}
.traffic-auto{
 flex:0 0 auto!important;
 min-height:34px!important;
 padding:7px 12px!important;
 border:1px solid rgba(255,255,255,.10)!important;
 border-radius:999px!important;
 background:rgba(255,255,255,.045)!important;
 color:#cbd5e1!important;
 font-size:9px!important;
 font-weight:900!important;
 white-space:nowrap!important;
 cursor:pointer!important;
 transition:transform .16s ease,background .16s ease,border-color .16s ease,color .16s ease!important;
}
.traffic-auto:hover{background:rgba(236,59,147,.10)!important;border-color:rgba(236,59,147,.26)!important;color:#fff!important;transform:translateY(-1px)!important}
.traffic-auto:active{transform:translateY(0)!important}
.traffic-auto:disabled{cursor:wait!important;opacity:.72!important;transform:none!important}
.traffic-bottom-grid{
 display:grid!important;
 grid-template-columns:repeat(4,minmax(0,1fr))!important;
 gap:10px!important;
 width:100%!important;
}
.traffic-bottom .stat{
 position:relative!important;
 display:grid!important;
 grid-template-columns:42px minmax(0,1fr)!important;
 align-items:center!important;
 gap:11px!important;
 min-width:0!important;
 min-height:92px!important;
 padding:15px!important;
 text-align:left!important;
 overflow:hidden!important;
 border:1px solid rgba(255,255,255,.075)!important;
 border-radius:17px!important;
 background:linear-gradient(180deg,rgba(21,30,43,.96),rgba(13,20,31,.96))!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
 transition:transform .18s ease,border-color .18s ease,background .18s ease!important;
}
.traffic-bottom .stat:hover{
 transform:translateY(-2px)!important;
 border-color:rgba(255,255,255,.14)!important;
 background:linear-gradient(180deg,#182333,#101824)!important;
}
.traffic-bottom .stat:after{
 content:""!important;
 position:absolute!important;
 left:0!important;
 top:0!important;
 bottom:0!important;
 width:3px!important;
 border-radius:4px!important;
 background:linear-gradient(#ec3b93,#8b5cf6)!important;
 opacity:.9!important;
}
.traffic-bottom .stat:nth-child(1):after{background:linear-gradient(#4ade80,#22c55e)!important}
.traffic-bottom .stat:nth-child(2):after{background:linear-gradient(#38bdf8,#6366f1)!important}
.traffic-bottom .stat:nth-child(3):after{background:linear-gradient(#a78bfa,#ec4899)!important}
.traffic-bottom .stat:nth-child(4):after{background:linear-gradient(#f59e0b,#ec4899)!important}
.traffic-icon{
 display:grid!important;
 place-items:center!important;
 width:42px!important;
 height:42px!important;
 border-radius:13px!important;
 background:rgba(255,255,255,.045)!important;
 border:1px solid rgba(255,255,255,.065)!important;
 font-size:18px!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
}
.traffic-value{min-width:0!important}
.traffic-bottom .stat strong{
 display:block!important;
 margin:0!important;
 font-size:27px!important;
 line-height:1!important;
 color:#fff!important;
 font-weight:950!important;
 letter-spacing:-.05em!important;
 white-space:nowrap!important;
}
.traffic-bottom .stat .traffic-label{
 display:block!important;
 margin-top:6px!important;
 color:#8894a5!important;
 font-size:9px!important;
 line-height:1.2!important;
 font-weight:800!important;
 white-space:nowrap!important;
}
@media(max-width:820px){
 .traffic-bottom{width:calc(100% - 24px)!important;margin:26px 12px 92px!important}
 .traffic-shell{padding:14px!important;border-radius:20px!important}
 .traffic-head{margin-bottom:12px!important}
 .traffic-head h3{font-size:17px!important}
 .traffic-head p{font-size:9px!important}
 .traffic-auto{min-height:32px!important;padding:6px 10px!important;font-size:8px!important}
 .traffic-bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 .traffic-bottom .stat{grid-template-columns:36px minmax(0,1fr)!important;gap:9px!important;min-height:78px!important;padding:12px!important;border-radius:14px!important}
 .traffic-icon{width:36px!important;height:36px!important;border-radius:11px!important;font-size:16px!important}
 .traffic-bottom .stat strong{font-size:22px!important}
 .traffic-bottom .stat .traffic-label{font-size:8px!important;margin-top:5px!important}
}
@media(max-width:430px){
 .traffic-head{align-items:flex-start!important}
 .traffic-auto{margin-top:1px!important}
}
@media(max-width:380px){
 .traffic-bottom .stat{grid-template-columns:1fr!important;text-align:center!important;gap:7px!important}
 .traffic-icon{margin:auto!important}
 .traffic-bottom .stat .traffic-label{white-space:normal!important}
}
`;
document.head.appendChild(style);

let shell=panel.querySelector('.traffic-shell');
if(!shell){
 shell=document.createElement('div');
 shell.className='traffic-shell';
 panel.replaceChildren(shell);
}

shell.innerHTML=`
 <div class="traffic-head">
  <div class="traffic-head-copy">
   <div class="traffic-kicker"><span class="traffic-live-dot"></span>Live Statistik</div>
   <h3>WasGehtHeute.ch wird entdeckt</h3>
   <p>Die Zahlen aktualisieren sich automatisch.</p>
  </div>
  <button type="button" class="traffic-auto" id="trafficRefreshBtn" aria-label="Statistik jetzt aktualisieren">↻ Aktualisieren</button>
 </div>
 <div class="traffic-bottom-grid">
  <div class="stat"><div class="traffic-icon">👤</div><div class="traffic-value"><strong id="visitorsToday">…</strong><span class="traffic-label">Besucher heute</span></div></div>
  <div class="stat"><div class="traffic-icon">👁</div><div class="traffic-value"><strong id="viewsToday">…</strong><span class="traffic-label">Aufrufe heute</span></div></div>
  <div class="stat"><div class="traffic-icon">📅</div><div class="traffic-value"><strong id="viewsWeek">…</strong><span class="traffic-label">Diese Woche</span></div></div>
  <div class="stat"><div class="traffic-icon">🌍</div><div class="traffic-value"><strong id="viewsTotal">…</strong><span class="traffic-label">Aufrufe insgesamt</span></div></div>
 </div>`;

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
 await Promise.all([
  counter('visitor-day',day,{unique:'true'}),
  counter('pageview-day',day),
  counter('pageview-week',week),
  counter('pageview-total','all')
 ]);
 await refresh();
}

const refreshBtn=document.getElementById('trafficRefreshBtn');
refreshBtn?.addEventListener('click',async()=>{
 if(refreshBtn.disabled)return;
 refreshBtn.disabled=true;
 refreshBtn.textContent='↻ Aktualisiere…';
 await refresh();
 refreshBtn.textContent='✓ Aktualisiert';
 setTimeout(()=>{
  refreshBtn.textContent='↻ Aktualisieren';
  refreshBtn.disabled=false;
 },900);
});

registerVisit();
setInterval(refresh,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();