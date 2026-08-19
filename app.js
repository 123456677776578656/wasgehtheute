const DATA=window.EVENTS||[];
const TODAY='2026-08-19';
const categoryEmoji={Alle:'🔥',Dorffest:'🎉',Party:'🪩',Musik:'🎵',Festival:'🎪',Sport:'⚽',Markt:'🛍️',Familie:'👨‍👩‍👧',Food:'🍔',Kultur:'🎭',Gratis:'🆓',Outdoor:'🥾'};
const topCats=['Alle','Dorffest','Party','Musik','Festival','Sport','Markt','Familie','Food','Kultur','Gratis','Outdoor'];

let activeCategory='Alle', activePeriod='all';

const q=document.getElementById('q'), area=document.getElementById('area'), place=document.getElementById('place'),
sort=document.getElementById('sort'), grid=document.getElementById('grid'), empty=document.getElementById('empty'),
result=document.getElementById('result'), mobileFilters=document.getElementById('mobileFilters');

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
      <div class="catline">${e.region} · ${e.cats.slice(0,3).join(' · ')}</div>
      <h3>${e.title}</h3>
      <p class="desc">${e.desc}</p>
      <div class="tags">${e.cats.map(c=>`<span class="tag">${c}</span>`).join('')}</div>
      <div class="card-foot"><span class="time">🕒 ${e.time}</span><a class="source" href="${e.source}" target="_blank" rel="noopener noreferrer">Infos ↗</a></div>
    </div>
  </article>`;
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
  result.textContent=`${arr.length} Veranstaltung${arr.length===1?'':'en'} · ${area.value||'alle Regionen'}`;
}

function setCategory(cat){
  activeCategory=cat;
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
  render();
}
function setPeriod(p){
  activePeriod=p;
  document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===p));
  document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.toggle('active',b.dataset.bottom===p || (p==='all'&&b.dataset.bottom==='all')));
  render();
}

const catWrap=document.getElementById('categoryButtons');
topCats.forEach(cat=>{
  const count=cat==='Alle'?DATA.length:DATA.filter(e=>e.cats.includes(cat)).length;
  const b=document.createElement('button');
  b.className='side-btn'+(cat==='Alle'?' active':'');
  b.dataset.cat=cat;
  b.innerHTML=`<span>${categoryEmoji[cat]||'•'} ${cat}</span><small>${count}</small>`;
  b.onclick=()=>setCategory(cat);
  catWrap.appendChild(b);

  const mb=document.createElement('button');
  mb.className='mobile-chip'+(cat==='Alle'?' active':'');
  mb.dataset.cat=cat;
  mb.textContent=`${categoryEmoji[cat]||'•'} ${cat}`;
  mb.onclick=()=>setCategory(cat);
  mobileFilters.appendChild(mb);
});

document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
document.querySelectorAll('[data-bottom]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.bottom));

function resetAll(){
  q.value='';area.value='';place.value='';sort.value='date';activeCategory='Alle';activePeriod='all';
  refreshPlaces();
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat==='Alle'));
  document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period==='all'));
  document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.toggle('active',b.dataset.bottom==='all'));
  render();
}
document.getElementById('resetTop').onclick=resetAll;
document.getElementById('clearSide').onclick=resetAll;
q.addEventListener('input',render);
area.addEventListener('change',()=>{refreshPlaces();render();});
place.addEventListener('change',render);
sort.addEventListener('change',render);

document.getElementById('gridBtn').onclick=()=>{grid.classList.remove('list-view');document.getElementById('gridBtn').classList.add('active');document.getElementById('listBtn').classList.remove('active');};
document.getElementById('listBtn').onclick=()=>{grid.classList.add('list-view');document.getElementById('listBtn').classList.add('active');document.getElementById('gridBtn').classList.remove('active');};
document.getElementById('bottomSearch').onclick=()=>{q.focus();window.scrollTo({top:q.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});};

document.getElementById('total').textContent=DATA.length;
document.getElementById('places').textContent=new Set(DATA.map(e=>e.city)).size;
document.getElementById('categories').textContent=new Set(DATA.flatMap(e=>e.cats)).size;

try{
  const key='wasgehtheute_demo_views_v3';
  const next=parseInt(localStorage.getItem(key)||'0',10)+1;
  localStorage.setItem(key,String(next));
  document.getElementById('viewCount').textContent=next.toLocaleString('de-CH');
}catch(e){document.getElementById('viewCount').textContent='1';}

const modal=document.getElementById('actionModal'), requestType=document.getElementById('requestType');
function openAction(type){
  requestType.value=type;document.getElementById('actionTitle').textContent=type==='Event melden'?'Event melden':'Werbeanzeige anfragen';
  document.getElementById('demoMsg').style.display='none';modal.classList.add('open');
}
document.getElementById('reportEventBtn').onclick=()=>openAction('Event melden');
document.getElementById('advertBtn').onclick=()=>openAction('Werbeanzeige anfragen');
document.getElementById('actionClose').onclick=()=>modal.classList.remove('open');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
document.getElementById('actionForm').addEventListener('submit',e=>{e.preventDefault();document.getElementById('demoMsg').style.display='block';});

refreshPlaces();
render();
