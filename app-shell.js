(()=>{
const q=document.getElementById('q');
const filters=document.getElementById('mobileFilters');
const backdrop=document.getElementById('mobileDrawerBackdrop');
const floating=document.getElementById('floatingActions');
const discoverBtn=document.querySelector('[data-bottom="all"]');
const favoriteBottom=document.getElementById('bottomFavorites');
function scrollSearch(){if(!q)return;const y=q.getBoundingClientRect().top+window.scrollY-126;window.scrollTo({top:Math.max(0,y),behavior:'smooth'});setTimeout(()=>q.focus({preventScroll:true}),220)}
function closeCategories(){filters?.classList.remove('open');document.body.classList.remove('categories-open')}
function toggleCategories(){const open=filters?.classList.toggle('open');document.body.classList.toggle('categories-open',!!open)}
function setBottomActive(button){document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));button?.classList.add('active')}
function syncQuick(){
  document.querySelectorAll('[data-quick-period]').forEach(btn=>btn.classList.toggle('active',!!document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`)?.classList.contains('active')));
  document.querySelectorAll('[data-quick-cat]').forEach(btn=>btn.classList.toggle('active',!!document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`)?.classList.contains('active')))
}
document.querySelectorAll('[data-quick-period]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`)?.click();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});setBottomActive(discoverBtn);requestAnimationFrame(syncQuick)}));
document.querySelectorAll('[data-quick-cat]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`)?.click();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});setBottomActive(discoverBtn);requestAnimationFrame(syncQuick)}));
document.getElementById('quickSearchBtn')?.addEventListener('click',scrollSearch);
document.getElementById('mobileSearchTop')?.addEventListener('click',scrollSearch);
document.getElementById('floatSearchBtn')?.addEventListener('click',scrollSearch);
document.getElementById('bottomSearch')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);scrollSearch()});
document.getElementById('mobileMenuBtn')?.addEventListener('click',toggleCategories);
document.getElementById('bottomCategories')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);toggleCategories()});
backdrop?.addEventListener('click',closeCategories);
filters?.addEventListener('click',e=>{if(e.target.closest('.mobile-chip')){setBottomActive(discoverBtn);setTimeout(closeCategories,60)}});
document.getElementById('bottomSubmit')?.addEventListener('click',e=>{setBottomActive(e.currentTarget);document.getElementById('reportEventBtn')?.click()});
function openFavorites(){window.WGH_APP?.showFavorites?.();setBottomActive(favoriteBottom)}
document.getElementById('mobileFavoriteTop')?.addEventListener('click',openFavorites);
favoriteBottom?.addEventListener('click',openFavorites);
discoverBtn?.addEventListener('click',()=>{window.WGH_APP?.showAllEvents?.();setBottomActive(discoverBtn)});
document.getElementById('floatTopBtn')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
let scrollQueued=false;
window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{floating?.classList.toggle('visible',window.scrollY>520);scrollQueued=false})},{passive:true});
const observer=new MutationObserver(()=>requestAnimationFrame(syncQuick));document.querySelectorAll('#periodButtons,#categoryButtons').forEach(el=>observer.observe(el,{attributes:true,subtree:true,attributeFilter:['class']}));syncQuick();
})();