const DATA=window.EVENTS||[];

function swissToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
const TODAY=swissToday();
const categoryEmoji={Alle:'🔥',Dorffest:'🎉',Party:'🪩',Musik:'🎵',Club:'🪩',Bar:'🍸',Festival:'🎪',Sport:'⚽',Markt:'🛍️',Familie:'👨‍👩‍👧',Food:'🍔',Kultur:'🎭',Gratis:'🆓',Outdoor:'🥾'};
const topCats=['Alle','Party','Musik','Bar','Club','Dorffest','Markt','Familie','Sport','Kultur'];
let activeCategory='Alle', activePeriod='all';

const q=document.getElementById('q'), area=document.getElementById('area'), place=document.getElementById('place'),
sort=document.getElementById('sort'), grid=document.getElementById('grid'), empty=document.getElementById('empty'),
result=document.getElementById('result'), mobileFilters=document.getElementById('mobileFilters'), topGrid=document.getElementById('topGrid');

function ymd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function overlaps(e,a,b){return e.start<=b && e.end>=a;}
function thisWeekend(){
  const d=new Date(TODAY+'T12:00:00'), dow=d.getDay();
  let add=(5-dow+7)%7;
  if(dow===6)add=-1;
  if(dow===0)add=-2;
  const fri=new Date(d); fri.setDate(d.getDate()+add);
  const sun=new Date(fri); sun.setDate(fri.getDate()+2);
  return [ymd(fri),ymd(sun)];
}
function within30(e){
  const a=new Date(TODAY+'T12:00:00'), b=new Date(e.start+'T12:00:00');
  const days=(b-a)/86400000;
  return days<=30 && e.end>=TODAY;
}
function isToday(e){return e.start<=TODAY && e.end>=TODAY;}
function slugify(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function eventUrl(e){return `event.html?id=${encodeURIComponent(slugify(e.title+'-'+e.city+'-'+e.start))}`;}

function refreshPlaces(){
  const current=place.value;
  const vals=[...new Set(DATA.filter(e=>!area.value||e.region===area.value).map(e=>e.city))].sort((a,b)=>a.localeCompare(b,'de'));
  place.innerHTML='<option value="">Alle Orte</option>';
  vals.forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;place.appendChild(o);});
  if(vals.includes(current))place.value=current;
}

function card(e){
  const today=isToday(e);
  return `<article class="card">
    <div class="card-visual">
      <span class="date-badge ${today?'today':''}">${today?'🔥 Heute':e.date}</span>
      <span class="place-badge">📍 ${e.city}</span>
      <span class="emoji">${e.emoji}</span>
    </div>
    <div class="card-body">
      <div class="verify-line"><span class="verified">✓ geprüft</span><span class="source-type">${e.source_type||'Quelle geprüft'}</span></div>
      <div class="catline">${e.cats.slice(0,3).join(' · ')}</div>
      <h3><a href="${eventUrl(e)}">${e.title}</a></h3>
      <p class="desc">${e.desc}</p>
      <div class="tags">${e.cats.map(c=>`<span class="tag">${c}</span>`).join('')}</div>
      <div class="card-foot"><span class="time">🕒 ${e.time}</span><span class="card-actions"><a class="source" href="${eventUrl(e)}">Details</a><a class="source" href="${e.source}" target="_blank" rel="noopener noreferrer">Quelle ↗</a></span></div>
    </div>
  </article>`;
}

function topCard(e,badge){
  return `<article class="top-card">
    <div class="top-badge">${badge}</div>
    <div class="top-emoji">${e.emoji}</div>
    <div class="top-copy"><small>📍 ${e.city} · ${e.date}</small><h3><a href="${eventUrl(e)}">${e.title}</a></h3><p>${e.desc}</p><a class="top-link" href="${eventUrl(e)}">Ansehen →</a></div>
  </article>`;
}

function renderHighlights(){
  const future=DATA.filter(e=>e.end>=TODAY).sort((a,b)=>a.start.localeCompare(b.start));
  const [fri,sun]=thisWeekend();
  let picks=future.filter(e=>overlaps(e,fri,sun)).slice(0,3);
  let weekend=true;
  if(!picks.length){picks=future.slice(0,3);weekend=false;}
  topGrid.innerHTML=picks.map((e,i)=>topCard(e,i===0?(weekend?'Wochenend-Tipp':'Nächster Tipp'):'Empfohlen')).join('');
  document.getElementById('highlightText').textContent=weekend?'Events für dieses Wochenende.':'Die nächsten kommenden Events.';
}

function render(){
  const term=q.value.trim().toLocaleLowerCase('de');
  const weekend=thisWeekend();
  let arr=DATA.filter(e=>{
    if(e.end<TODAY)return false;
    if(activeCategory!=='Alle'&&!e.cats.includes(activeCategory))return false;
    if(area.value&&e.region!==area.value)return false;
    if(place.value&&e.city!==place.value)return false;
    if(term&&!(`${e.title} ${e.city} ${e.region} ${e.desc} ${e.cats.join(' ')}`).toLocaleLowerCase('de').includes(term))return false;
    if(activePeriod==='today'&&!isToday(e))return false;
    if(activePeriod==='weekend'&&!overlaps(e,weekend[0],weekend[1]))return false;
    if(activePeriod==='30'&&!within30(e))return false;
    return true;
  });
  if(sort.value==='place')arr.sort((a,b)=>a.city.localeCompare(b.city,'de')||a.start.localeCompare(b.start));
  else if(sort.value==='category')arr.sort((a,b)=>a.cats[0].localeCompare(b.cats[0],'de')||a.start.localeCompare(b.start));
  else arr.sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'de'));
  grid.innerHTML=arr.map(card).join('');
  empty.style.display=arr.length?'none':'block';
  document.getElementById('visibleCount').textContent=arr.length;
  result.textContent=`${arr.length} gefunden${area.value?' · '+area.value:''}`;
}

function clearBottomSpecial(){document.getElementById('bottomFavorites')?.classList.remove('active');}
function setCategory(cat){activeCategory=cat;clearBottomSpecial();document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));render();}
function setPeriod(p){activePeriod=p;clearBottomSpecial();document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===p));document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.toggle('active',b.dataset.bottom===p || (p==='all'&&b.dataset.bottom==='all')));render();}

const catWrap=document.getElementById('categoryButtons');
topCats.forEach(cat=>{
  const count=cat==='Alle'?DATA.filter(e=>e.end>=TODAY).length:DATA.filter(e=>e.end>=TODAY&&e.cats.includes(cat)).length;
  const b=document.createElement('button');b.className='side-btn'+(cat==='Alle'?' active':'');b.dataset.cat=cat;b.innerHTML=`<span>${categoryEmoji[cat]||'•'} ${cat}</span><small>${count}</small>`;b.onclick=()=>setCategory(cat);catWrap.appendChild(b);
  const mb=document.createElement('button');mb.className='mobile-chip'+(cat==='Alle'?' active':'');mb.dataset.cat=cat;mb.textContent=`${categoryEmoji[cat]||'•'} ${cat}`;mb.onclick=()=>setCategory(cat);mobileFilters.appendChild(mb);
});

document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
document.querySelectorAll('[data-bottom]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.bottom));
function resetAll(){q.value='';area.value='';place.value='';sort.value='date';activeCategory='Alle';activePeriod='all';refreshPlaces();clearBottomSpecial();document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat==='Alle'));document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period==='all'));document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.toggle('active',b.dataset.bottom==='all'));render();}
document.getElementById('resetTop')?.addEventListener('click',resetAll);document.getElementById('clearSide')?.addEventListener('click',resetAll);
q?.addEventListener('input',()=>{clearBottomSpecial();render();});area?.addEventListener('change',()=>{clearBottomSpecial();refreshPlaces();render();});place?.addEventListener('change',()=>{clearBottomSpecial();render();});sort?.addEventListener('change',render);
document.getElementById('gridBtn')?.addEventListener('click',()=>{grid.classList.remove('list-view');document.getElementById('gridBtn').classList.add('active');document.getElementById('listBtn').classList.remove('active');});
document.getElementById('listBtn')?.addEventListener('click',()=>{grid.classList.add('list-view');document.getElementById('listBtn').classList.add('active');document.getElementById('gridBtn').classList.remove('active');});
document.getElementById('bottomSearch')?.addEventListener('click',()=>{clearBottomSpecial();q.focus();window.scrollTo({top:q.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});});
document.getElementById('bottomFavorites')?.addEventListener('click',()=>{document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.remove('active'));document.getElementById('bottomFavorites').classList.add('active');document.getElementById('favoritesBtn')?.click();});

document.getElementById('total').textContent=DATA.filter(e=>e.end>=TODAY).length;
document.getElementById('places').textContent=new Set(DATA.filter(e=>e.end>=TODAY).map(e=>e.city)).size;
document.getElementById('categories').textContent=new Set(DATA.filter(e=>e.end>=TODAY).flatMap(e=>e.cats)).size;
document.getElementById('lastUpdated').textContent=new Intl.DateTimeFormat('de-CH',{dateStyle:'medium',timeZone:'Europe/Zurich'}).format(new Date());

async function updateGlobalCounter(){
  const el=document.getElementById('globalViewCount');
  if(!el)return;
  try{
    const r=await fetch('https://counterapi.com/api/wasgehtheute.ch/view/homepage',{cache:'no-store'});
    if(!r.ok)throw new Error('counter');
    const data=await r.json();
    const value=data.value ?? '–';
    el.textContent=Number.isFinite(Number(value))?Number(value).toLocaleString('de-CH'):value;
  }catch(err){el.textContent='–';el.title='Zähler momentan nicht erreichbar';}
}
updateGlobalCounter();

const modal=document.getElementById('actionModal'), requestType=document.getElementById('requestType');
function openAction(type){if(!modal)return;requestType.value=type;document.getElementById('actionTitle').textContent=type==='Event melden'?'Event melden':'Werbeanzeige anfragen';document.getElementById('demoMsg').style.display='none';modal.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>document.getElementById('formName')?.focus(),80);}
function closeAction(){if(!modal)return;modal.classList.remove('open');document.body.style.overflow='';}
document.getElementById('reportEventBtn')?.addEventListener('click',()=>openAction('Event melden'));document.getElementById('advertBtn')?.addEventListener('click',()=>openAction('Werbeanzeige anfragen'));document.querySelectorAll('.adRequestBtn').forEach(b=>b.onclick=()=>openAction('Werbeanzeige anfragen'));
document.getElementById('actionClose')?.addEventListener('click',closeAction);modal?.addEventListener('click',e=>{if(e.target===modal)closeAction()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeAction()});document.getElementById('actionForm')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('demoMsg').style.display='block';});

let deferredPrompt=null;
const installButtons=[document.getElementById('installPwaBtn'),document.getElementById('installPwaBtnBottom')];
function setInstallVisible(show){installButtons.forEach(b=>{if(!b)return;b.hidden=!show;});}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;setInstallVisible(true);});
installButtons.forEach(b=>b&&b.addEventListener('click',async()=>{
  if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;setInstallVisible(false);}
  else alert('Auf iPhone/iPad: Teilen → „Zum Home-Bildschirm“. Auf Android/Chrome findest du „App installieren“ meist im Browser-Menü.');
}));
window.addEventListener('appinstalled',()=>setInstallVisible(false));
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}

const queryTerm=new URLSearchParams(location.search).get('q');if(queryTerm){q.value=queryTerm;}
refreshPlaces();renderHighlights();render();