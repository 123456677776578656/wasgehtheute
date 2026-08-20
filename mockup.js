(()=>{
const DATA=window.EVENTS||[];
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const imageMap={
  'Zürcher Theater Spektakel':'https://s7g10.scene7.com/is/image/zurcherverkehrsverbund/theater-spektakel-gelaende',
  'Migros Hiking Sounds':'https://storage.cpstatic.ch/storage/detail_large_transx2/8e29aa2e061a483610ae0d1c2207087d-be1faf50--1264132.webp',
  'Tour de Suisse der Menschlichkeit':'https://www.osar.ch/fileadmin/_processed_/a/a/csm_V1-Header-Desk_10-3_1bc6d881ff.jpg',
  'Rundfunk.fm Festival':'https://rundfunk.fm/media/filer_public/74/0e/740e07c6-d3bb-4ad3-a0d0-a02be9c761cb/ananas.png'
};
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const eventUrl=e=>`event.html?id=${encodeURIComponent(slug(`${e.title}-${e.city}-${e.start}`))}`;
const price=e=>e.price||((e.cats||[]).includes('Gratis')?'Gratis':'Mehr Infos');
const upcoming=DATA.filter(e=>e.end>=today).sort((a,b)=>String(a.start).localeCompare(String(b.start))||String(a.title).localeCompare(String(b.title),'de'));

function popularItem(e){
  const img=e.image||imageMap[e.title]||'';
  const visual=img?`style="background-image:linear-gradient(rgba(5,8,13,.10),rgba(5,8,13,.20)),url('${String(img).replace(/["'()\\]/g,'')}')"`:'';
  return `<a class="desktop-popular-item" href="${eventUrl(e)}"><span class="desktop-popular-thumb" ${visual}>${img?'':(e.emoji||'📅')}</span><span class="desktop-popular-copy"><b>${e.title||'Event'}</b><span>⌖ ${e.city||'Ort'} · ${e.date||e.start||''}</span><em>${price(e)}</em></span></a>`;
}
const pop=document.getElementById('desktopPopularGrid');if(pop)pop.innerHTML=upcoming.slice(0,5).map(popularItem).join('');

function goEvents(){document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'})}
function openCategories(){
  if(matchMedia('(max-width:980px)').matches){document.getElementById('bottomCategories')?.click();return}
  const target=document.getElementById('categoryButtons');
  if(target){target.closest('.utility-sidebar')?.classList.toggle('desktop-open')}
}
document.getElementById('desktopDiscoverBtn')?.addEventListener('click',goEvents);
document.getElementById('desktopFavoritesBtn')?.addEventListener('click',()=>{document.getElementById('favoritesBtn')?.click();goEvents()});
document.getElementById('desktopSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('desktopCategoriesBtn')?.addEventListener('click',openCategories);
document.getElementById('desktopPopularMore')?.addEventListener('click',()=>document.getElementById('highlights')?.scrollIntoView({behavior:'smooth',block:'start'}));
document.getElementById('sidebarSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('nearbyPromoBtn')?.addEventListener('click',()=>document.getElementById('nearMeBtn')?.click());

/* Lange Eventliste standardmässig kurz halten – aber nur bei wirklich sichtbaren Treffern. */
const grid=document.getElementById('grid');
if(grid){
  const wrap=document.createElement('div');wrap.className='more-events-wrap';
  const btn=document.createElement('button');btn.type='button';btn.className='more-events-btn';wrap.appendChild(btn);
  grid.insertAdjacentElement('afterend',wrap);
  const limit=()=>matchMedia('(max-width:980px)').matches?4:6;
  let queued=false;
  const update=()=>{
    queued=false;
    const cards=[...grid.querySelectorAll('.card')];
    cards.forEach(c=>c.classList.remove('compact-hidden'));
    const eligible=cards.filter(c=>c.style.display!=='none');
    const open=grid.classList.contains('expanded');
    if(!open)eligible.slice(limit()).forEach(c=>c.classList.add('compact-hidden'));
    const total=eligible.length,shown=Math.min(total,limit());
    if(total<=limit()){wrap.hidden=true;grid.classList.remove('expanded');cards.forEach(c=>c.classList.remove('compact-hidden'));return}
    wrap.hidden=false;
    btn.innerHTML=open?'Weniger anzeigen':`Mehr Events anzeigen <span class="count">+${Math.max(0,total-shown)}</span>`;
  };
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(update)};
  btn.addEventListener('click',()=>{
    const open=grid.classList.toggle('expanded');
    schedule();
    if(!open)document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  new MutationObserver(mutations=>{
    if(mutations.some(m=>m.type==='childList'))grid.classList.remove('expanded');
    schedule();
  }).observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  addEventListener('resize',schedule,{passive:true});
  schedule();
}

/* Desktop-Kategoriepanel nur bei Bedarf */
const style=document.createElement('style');style.textContent='@media(min-width:981px){.utility-sidebar.desktop-open{display:block!important;position:fixed!important;left:50%;top:90px;z-index:120;width:300px;max-height:72vh;overflow:auto;padding:18px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:#0b111b;box-shadow:0 30px 80px rgba(0,0,0,.55);transform:translateX(-470px)}.utility-sidebar.desktop-open .side-group{display:block!important}.utility-sidebar.desktop-open .side-title{display:flex!important}}';document.head.appendChild(style);
})();