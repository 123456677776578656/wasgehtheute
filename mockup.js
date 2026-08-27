(()=>{
function openCategories(){if(matchMedia('(max-width:980px)').matches){document.getElementById('bottomCategories')?.click();return}document.querySelector('.utility-sidebar')?.classList.toggle('desktop-open')}
document.getElementById('desktopDiscoverBtn')?.addEventListener('click',()=>window.WGH_APP?.showAllEvents?.());
document.getElementById('desktopFavoritesBtn')?.addEventListener('click',()=>window.WGH_APP?.showFavorites?.());
document.getElementById('desktopSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('desktopCategoriesBtn')?.addEventListener('click',openCategories);
document.getElementById('desktopPopularMore')?.addEventListener('click',()=>document.getElementById('highlights')?.scrollIntoView({behavior:'smooth',block:'start'}));
document.getElementById('sidebarSubmitBtn')?.addEventListener('click',()=>document.getElementById('reportEventBtn')?.click());
document.getElementById('nearbyPromoBtn')?.addEventListener('click',()=>document.getElementById('nearMeBtn')?.click());
// Mobile-Paginierung wird ausschliesslich von mobile-feed.js verwaltet.
// Dadurch gibt es keinen Konflikt mehr zwischen zwei unterschiedlichen „Mehr Events“-Systemen.
})();
