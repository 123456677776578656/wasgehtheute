(()=>{
function goEvents(){document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'})}
function openCategories(){if(matchMedia('(max-width:980px)').matches){document.getElementById('bottomCategories')?.click();return}document.querySelector('.utility-sidebar')?.classList.toggle('desktop-open')}
document.getElementById('desktopDiscoverBtn')?.addEventListener('click',()=>window.WGH_APP?.showAllEvents?.());
document.getElementById('desktopFavoritesBtn')?.addEventListener('click',()=>window.WGH_APP?.showFavorites?.());
document.getElementById('desktopSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('desktopCategoriesBtn')?.addEventListener('click',openCategories);
document.getElementById('desktopPopularMore')?.addEventListener('click',()=>document.getElementById('highlights')?.scrollIntoView({behavior:'smooth',block:'start'}));
document.getElementById('sidebarSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('nearbyPromoBtn')?.addEventListener('click',()=>document.getElementById('nearMeBtn')?.click());
const grid=document.getElementById('grid');
if(grid){
  const wrap=document.createElement('div');wrap.className='more-events-wrap';
  const btn=document.createElement('button');btn.type='button';btn.className='more-events-btn';wrap.appendChild(btn);grid.insertAdjacentElement('afterend',wrap);
  const limit=()=>matchMedia('(max-width:980px)').matches?4:6;let queued=false;
  const update=()=>{queued=false;const cards=[...grid.querySelectorAll('.card')];cards.forEach(c=>c.classList.remove('compact-hidden'));const open=grid.classList.contains('expanded');if(!open)cards.slice(limit()).forEach(c=>c.classList.add('compact-hidden'));const total=cards.length,shown=Math.min(total,limit());wrap.hidden=total<=limit();if(total<=limit()){grid.classList.remove('expanded');cards.forEach(c=>c.classList.remove('compact-hidden'))}btn.innerHTML=open?'Weniger anzeigen':`Mehr Events anzeigen <span class="count">+${Math.max(0,total-shown)}</span>`};
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(update)};
  btn.addEventListener('click',()=>{const open=grid.classList.toggle('expanded');schedule();if(!open)goEvents()});
  new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))grid.classList.remove('expanded');schedule()}).observe(grid,{childList:true});
  window.addEventListener('wgh:render',()=>{grid.classList.remove('expanded');schedule()});addEventListener('resize',schedule,{passive:true});schedule();
}
})();