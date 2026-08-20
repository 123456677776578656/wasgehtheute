(()=>{
const IMAGES={
  'Zürcher Theater Spektakel':'https://s7g10.scene7.com/is/image/zurcherverkehrsverbund/theater-spektakel-gelaende',
  'Migros Hiking Sounds':'https://storage.cpstatic.ch/storage/detail_large_transx2/8e29aa2e061a483610ae0d1c2207087d-be1faf50--1264132.webp',
  'Tour de Suisse der Menschlichkeit':'https://www.osar.ch/fileadmin/_processed_/a/a/csm_V1-Header-Desk_10-3_1bc6d881ff.jpg',
  'Rundfunk.fm Festival':'https://rundfunk.fm/media/filer_public/74/0e/740e07c6-d3bb-4ad3-a0d0-a02be9c761cb/ananas.png'
};

const DATA=window.EVENTS||[];
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function ymd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekendRange(){const t=today(),d=new Date(t+'T12:00:00'),dow=d.getDay();let add=(5-dow+7)%7;if(dow===6)add=-1;if(dow===0)add=-2;const f=new Date(d);f.setDate(d.getDate()+add);const s=new Date(f);s.setDate(f.getDate()+2);return[ymd(f),ymd(s)]}
function upcoming(){const t=today();return DATA.filter(e=>e.end>=t)}
function cleanTitle(el){return el?.querySelector('h3')?.textContent?.trim()||''}
function safeUrl(url){return String(url||'').replace(/["'()\\]/g,'')}
function preload(url,done){const img=new Image();img.onload=()=>done(true);img.onerror=()=>done(false);img.referrerPolicy='no-referrer';img.src=url}

function injectDiscoveryCss(){
  if(document.querySelector('link[href="discovery.css"]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='discovery.css';document.head.appendChild(link);
}

function enhanceCard(card){
  if(card.dataset.imageCheck)return;
  const title=cleanTitle(card),url=IMAGES[title],visual=card.querySelector('.card-visual');
  if(!url||!visual)return;
  card.dataset.imageCheck='1';
  preload(url,ok=>{
    if(!ok)return;
    visual.style.backgroundImage=`linear-gradient(180deg,rgba(5,7,11,.08),rgba(5,7,11,.55)),url("${safeUrl(url)}")`;
    visual.style.backgroundSize='cover';
    visual.style.backgroundPosition='center';
    const emoji=visual.querySelector('.emoji');if(emoji)emoji.style.display='none';
    card.classList.add('has-event-image');
  });
}

function enhanceHighlight(card){
  if(card.dataset.imageCheck)return;
  const title=cleanTitle(card),url=IMAGES[title];
  if(!url)return;
  card.dataset.imageCheck='1';
  preload(url,ok=>{
    if(!ok)return;
    card.style.backgroundImage=`linear-gradient(90deg,rgba(8,10,15,.93) 0%,rgba(8,10,15,.76) 55%,rgba(8,10,15,.48) 100%),url("${safeUrl(url)}")`;
    card.style.backgroundSize='cover';
    card.style.backgroundPosition='center';
    const emoji=card.querySelector('.top-emoji');if(emoji)emoji.style.display='none';
    card.classList.add('has-event-image');
  });
}

function applyImages(){
  document.querySelectorAll('.card').forEach(enhanceCard);
  document.querySelectorAll('.top-card').forEach(enhanceHighlight);
}

function setQuickActive(name){
  document.querySelectorAll('[data-quick]').forEach(el=>el.classList.toggle('active',el.dataset.quick===name));
}
function scrollToEvents(){document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'})}
function clickPeriod(period){
  const b=document.querySelector(`[data-period="${period}"]`);
  if(b){b.click();setTimeout(scrollToEvents,80)}
}
function resetFilters(){document.getElementById('resetTop')?.click()}
function setGratis(){
  resetFilters();
  const q=document.getElementById('q');
  if(q){q.value='Gratis';q.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(scrollToEvents,80)}
}

function buildDiscovery(){
  const toolbar=document.querySelector('.feature-toolbar');
  if(!toolbar||document.querySelector('.discovery-section'))return;
  const future=upcoming(),t=today(),[fri,sun]=weekendRange();
  const todayCount=future.filter(e=>e.start<=t&&e.end>=t).length;
  const weekendCount=future.filter(e=>e.start<=sun&&e.end>=fri).length;
  const freeCount=future.filter(e=>(e.cats||[]).includes('Gratis')).length;
  const nightlifeCount=future.filter(e=>(e.cats||[]).some(c=>['Bar','Club','Party'].includes(c))).length;
  const section=document.createElement('section');
  section.className='discovery-section';
  section.setAttribute('aria-label','Schnellauswahl');
  section.innerHTML=`<div class="discovery-grid">
    <button type="button" class="discovery-card today" data-quick="today"><span class="discovery-icon">☀️</span><strong>Heute</strong><small>Was läuft heute?</small><span class="discovery-count">${todayCount}</span></button>
    <button type="button" class="discovery-card weekend" data-quick="weekend"><span class="discovery-icon">🎉</span><strong>Weekend</strong><small>Freitag bis Sonntag</small><span class="discovery-count">${weekendCount}</span></button>
    <button type="button" class="discovery-card free" data-quick="free"><span class="discovery-icon">✨</span><strong>Gratis</strong><small>Ohne Eintritt</small><span class="discovery-count">${freeCount}</span></button>
    <a class="discovery-card nightlife" data-quick="nightlife" href="nightlife.html"><span class="discovery-icon">🪩</span><strong>Nightlife</strong><small>Bars, Clubs & Partys</small><span class="discovery-count">${nightlifeCount}</span></a>
  </div>`;
  toolbar.insertAdjacentElement('afterend',section);
  section.querySelector('[data-quick="today"]')?.addEventListener('click',()=>{resetFilters();clickPeriod('today');setQuickActive('today')});
  section.querySelector('[data-quick="weekend"]')?.addEventListener('click',()=>{resetFilters();clickPeriod('weekend');setQuickActive('weekend')});
  section.querySelector('[data-quick="free"]')?.addEventListener('click',()=>{setGratis();setQuickActive('free')});
  document.getElementById('resetTop')?.addEventListener('click',()=>setQuickActive(''));
  document.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.period==='today'||b.dataset.period==='weekend')setQuickActive(b.dataset.period);else setQuickActive('')}));
  document.getElementById('q')?.addEventListener('input',e=>{if(String(e.target.value).trim().toLowerCase()!=='gratis')setQuickActive('')});
}

injectDiscoveryCss();
buildDiscovery();
const root=document.getElementById('grid')||document.body;
if(root)new MutationObserver(()=>requestAnimationFrame(applyImages)).observe(root,{childList:true,subtree:true});
const top=document.getElementById('topGrid');if(top)new MutationObserver(()=>requestAnimationFrame(applyImages)).observe(top,{childList:true,subtree:true});
applyImages();
})();