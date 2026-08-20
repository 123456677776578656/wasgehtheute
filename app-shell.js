(()=>{
const q=document.getElementById('q');
const grid=document.getElementById('grid');
const filters=document.getElementById('mobileFilters');
const backdrop=document.getElementById('mobileDrawerBackdrop');
const floating=document.getElementById('floatingActions');

function scrollSearch(){
  if(!q)return;
  const y=q.getBoundingClientRect().top+window.scrollY-126;
  window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
  setTimeout(()=>q.focus(),260);
}
function closeCategories(){
  filters?.classList.remove('open');
  document.body.classList.remove('categories-open');
}
function openCategories(){
  filters?.classList.add('open');
  document.body.classList.add('categories-open');
}
function toggleCategories(){filters?.classList.contains('open')?closeCategories():openCategories()}
function setBottomActive(id){
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}
function syncQuick(){
  document.querySelectorAll('[data-quick-period]').forEach(btn=>{
    const target=document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`);
    btn.classList.toggle('active',!!target?.classList.contains('active'));
  });
  document.querySelectorAll('[data-quick-cat]').forEach(btn=>{
    const target=document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`);
    btn.classList.toggle('active',!!target?.classList.contains('active'));
  });
}

document.querySelectorAll('[data-quick-period]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelector(`[data-period="${btn.dataset.quickPeriod}"]`)?.click();
  document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(syncQuick,20);
}));
document.querySelectorAll('[data-quick-cat]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelector(`[data-cat="${btn.dataset.quickCat}"]`)?.click();
  document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(syncQuick,20);
}));

document.getElementById('quickSearchBtn')?.addEventListener('click',scrollSearch);
document.getElementById('mobileSearchTop')?.addEventListener('click',scrollSearch);
document.getElementById('floatSearchBtn')?.addEventListener('click',scrollSearch);
document.getElementById('bottomSearch')?.addEventListener('click',()=>{setBottomActive('bottomSearch');scrollSearch()});

document.getElementById('mobileMenuBtn')?.addEventListener('click',toggleCategories);
document.getElementById('bottomCategories')?.addEventListener('click',()=>{setBottomActive('bottomCategories');toggleCategories()});
backdrop?.addEventListener('click',closeCategories);
filters?.addEventListener('click',e=>{if(e.target.closest('.mobile-chip'))setTimeout(closeCategories,80)});

document.getElementById('bottomSubmit')?.addEventListener('click',()=>{
  setBottomActive('bottomSubmit');
  document.getElementById('reportEventBtn')?.click();
});
document.getElementById('mobileFavoriteTop')?.addEventListener('click',()=>document.getElementById('favoritesBtn')?.click());
document.getElementById('bottomFavorites')?.addEventListener('click',()=>setBottomActive('bottomFavorites'));
document.querySelector('[data-bottom="all"]')?.addEventListener('click',()=>setBottomActive(document.querySelector('[data-bottom="all"]')?.id||''));

document.getElementById('floatTopBtn')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
window.addEventListener('scroll',()=>{
  floating?.classList.toggle('visible',window.scrollY>520);
},{passive:true});

const observer=new MutationObserver(syncQuick);
document.querySelectorAll('#periodButtons,#categoryButtons').forEach(el=>observer.observe(el,{attributes:true,subtree:true,attributeFilter:['class']}));
syncQuick();
})();