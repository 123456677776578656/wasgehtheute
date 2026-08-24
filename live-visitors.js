(()=>{
const host=document.querySelector('.traffic-bottom');
if(!host)return;
let box=document.getElementById('liveVisitorsBox');
if(!box){box=document.createElement('div');box.id='liveVisitorsBox';box.className='live-visitors-box';box.innerHTML='<span class="live-dot"></span><strong id="liveVisitorsNow">1</strong><span>gerade online</span>';host.prepend(box)}
const endpoint='https://counterapi.com/api/wasgehtheute-live/online/1';
async function refresh(){
  try{const r=await fetch(endpoint+'?unique=true',{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();const n=Math.max(1,Number(d.value)||1);document.getElementById('liveVisitorsNow').textContent=n.toLocaleString('de-CH')}catch{const base=Math.max(1,Number(localStorage.getItem('wgh-live-fallback'))||1);document.getElementById('liveVisitorsNow').textContent=base.toLocaleString('de-CH')}}
refresh();setInterval(refresh,15000);
})();