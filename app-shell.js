(()=>{
const q=document.getElementById('q');
const filters=document.getElementById('mobileFilters');
const backdrop=document.getElementById('mobileDrawerBackdrop');
const floating=document.getElementById('floatingActions');
const discoverBtn=document.querySelector('[data-bottom="all"]');
const favoriteBottom=document.getElementById('bottomFavorites');
const QUICK_AREA={
  Buchs:'Rheintal / Werdenberg / Sargans / Wildhaus',
  Sargans:'Rheintal / Werdenberg / Sargans / Wildhaus',
  Mels:'Rheintal / Werdenberg / Sargans / Wildhaus',
  'Zürich':'Kanton Zürich',
  Chur:'Chur / Graubünden',
  Arbon:'Kanton Thurgau'
};
const QUICK_CITY={
  Buchs:['Buchs SG','Buchs','Werdenberg / Buchs'],
  Sargans:['Sargans'],
  Mels:['Mels'],
  'Zürich':['Zürich','Zurich'],
  Chur:['Chur'],
  Arbon:['Arbon']
};
const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();
function loadQuickRegionStyles(){if(document.querySelector('link[data-quick-region-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./quick-regions.css?v=1';l.dataset.quickRegionStyle='1';document.head.appendChild(l)}
function buildQuickRegions(){const search=q?.closest('.search-strip');if(!search||document.querySelector('.quick-region-wrap'))return;const wrap=document.createElement('div');wrap.className='quick-region-wrap';wrap.setAttribute('aria-label','Orte schnell auswählen');[['Alle',''],['Buchs','Buchs'],['Sargans','Sargans'],['Mels','Mels'],['Zürich','Zürich'],['Chur','Chur'],['Arbon','Arbon']].forEach(([label,val])=>{const b=document.createElement('button');b.type='button';b.className='quick-region-btn'+(val===''?' active':'');b.dataset.placeShort=val;b.textContent=label;wrap.appendChild(b)});search.insertAdjacentElement('afterend',wrap)}
function setQuickActive(val){document.querySelectorAll('[data-place-short],[data-quick-place]').forEach(b=>{const v=b.dataset.placeShort??b.dataset.quickPlace??'';b.classList.toggle('active',v===val||(val===''&&v==='Alle'))})}
function findPlaceOption(select,val){if(!select)return null;const candidates=QUICK_CITY[val]||[val];for(const candidate of candidates){const exact=[...select.options].find(o=>norm(o.value||o.textContent)===norm(candidate));if(exact)return exact}const target=norm(val);return [...select.options].find(o=>{const n=norm(o.value||o.textContent);return n.startsWith(target+' ')||n===target})||null}
function selectQuickPlace(val){
  const area=document.getElementById('area'),place=document.getElementById('place');
  if(!val||val==='Alle'){
    document.getElementById('resetTop')?.click();
    setQuickActive('');
    document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  const areaName=QUICK_AREA[val]||'';
  if(area&&areaName&&area.value!==areaName){
    area.value=areaName;
    area.dispatchEvent(new Event('change',{bubbles:true}));
  }
  requestAnimationFrame(()=>{
    const option=findPlaceOption(place,val);
    if(option){
      place.value=option.value;
      place.dispatchEvent(new Event('change',{bubbles:true}));
    }else if(q){
      q.value=val;
      q.dispatchEvent(new Event('input',{bubbles:true}));
    }
    setQuickActive(val);
    document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function bindQuickRegions(){
  document.querySelectorAll('[data-place-short],[data-quick-place]').forEach(btn=>{
    if(btn.dataset.quickBound==='1')return;
    btn.dataset.quickBound='1';
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const val=btn.dataset.placeShort??btn.dataset.quickPlace??'';
      selectQuickPlace(val);
    });
  });
}
function loadRuntimeCleanup(){if(document.querySelector('script[data-runtime-cleanup]'))return;const s=document.createElement('script');s.src='./runtime-cleanup.js?v=1';s.dataset.runtimeCleanup='1';document.body.appendChild(s)}
function loadMobileFeed(){if(window.innerWidth>820||document.querySelector('script[data-mobile-feed]'))return;const s=document.createElement('script');s.src='./mobile-feed.js?v=2';s.dataset.mobileFeed='1';document.body.appendChild(s)}
function loadEventMap(){if(document.querySelector('script[data-event-map]'))return;const s=document.createElement('script');s.src='./event-map.js?v=1';s.dataset.eventMap='1';document.body.appendChild(s)}
function loadTrafficFour(){if(document.querySelector('script[data-traffic-four]'))return;const s=document.createElement('script');s.src='./traffic-four.js?v=1';s.dataset.trafficFour='1';document.body.appendChild(s)}
function scrollSearch(){if(!q)return;const y=q.getBoundingClientRect().top+window.scrollY-126;window.scrollTo({top:Math.max(0,y),behavior:'smooth'});setTimeout(()=>q.focus({preventScroll:true}),220)}
function closeCategories(){filters?.classList.remove('open');document.body.classList.remove('categories-open')}
function toggleCategories(){const open=filters?.classList.toggle('open');document.body.classList.toggle('categories-open',!!open)}
function setBottomActive(button){document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));button?.classList.add('active')}
function syncQuick(){document.querySelectorAll('[data-quick-period]').forEach(btn=>btn.classList.toggle('active',!!document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`)?.classList.contains('active')));document.querySelectorAll('[data-quick-cat]').forEach(btn=>btn.classList.toggle('active',!!document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`)?.classList.contains('active')))}
document.querySelectorAll('[data-quick-period]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`)?.click();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});setBottomActive(discoverBtn);requestAnimationFrame(syncQuick)}));
document.querySelectorAll('[data-quick-cat]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`)?.click();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});setBottomActive(discoverBtn);requestAnimationFrame(syncQuick)}));
document.getElementById('quickSearchBtn')?.addEventListener('click',scrollSearch);document.getElementById('mobileSearchTop')?.addEventListener('click',scrollSearch);document.getElementById('floatSearchBtn')?.addEventListener('click',scrollSearch);document.getElementById('bottomSearch')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);scrollSearch()});
document.getElementById('mobileMenuBtn')?.addEventListener('click',toggleCategories);document.getElementById('bottomCategories')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);toggleCategories()});backdrop?.addEventListener('click',closeCategories);filters?.addEventListener('click',e=>{if(e.target.closest('.mobile-chip')){setBottomActive(discoverBtn);setTimeout(closeCategories,60)}});
document.getElementById('bottomSubmit')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);document.getElementById('reportEventBtn')?.click()});
function openFavorites(){window.WGH_APP?.showFavorites?.();setBottomActive(favoriteBottom)}
document.getElementById('mobileFavoriteTop')?.addEventListener('click',openFavorites);favoriteBottom?.addEventListener('click',openFavorites);discoverBtn?.addEventListener('click',()=>{window.WGH_APP?.showAllEvents?.();setBottomActive(discoverBtn)});document.getElementById('floatTopBtn')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
let scrollQueued=false;window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{floating?.classList.toggle('visible',window.scrollY>520);scrollQueued=false})},{passive:true});
const observer=new MutationObserver(()=>requestAnimationFrame(syncQuick));document.querySelectorAll('#periodButtons,#categoryButtons').forEach(el=>observer.observe(el,{attributes:true,subtree:true,attributeFilter:['class']}));
loadQuickRegionStyles();buildQuickRegions();bindQuickRegions();syncQuick();loadRuntimeCleanup();loadMobileFeed();loadEventMap();loadTrafficFour();
})();