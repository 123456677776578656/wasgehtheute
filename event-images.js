(()=>{
const IMAGES={
  'Zürcher Theater Spektakel':'https://s7g10.scene7.com/is/image/zurcherverkehrsverbund/theater-spektakel-gelaende',
  'Migros Hiking Sounds':'https://storage.cpstatic.ch/storage/detail_large_transx2/8e29aa2e061a483610ae0d1c2207087d-be1faf50--1264132.webp',
  'Tour de Suisse der Menschlichkeit':'https://www.osar.ch/fileadmin/_processed_/a/a/csm_V1-Header-Desk_10-3_1bc6d881ff.jpg',
  'Rundfunk.fm Festival':'https://rundfunk.fm/media/filer_public/74/0e/740e07c6-d3bb-4ad3-a0d0-a02be9c761cb/ananas.png',
  'Un Ballo in Maschera – Oper am Werdenbergersee':'https://www.schlossfestspiele.ch/Portals/0/adam/Content/AM-5fF3nR0Ovcbn2LnOOXQ/Image/Schlossfestspiele%20Werdenberg%20Oper%20Un%20ballo%20in%20maschera.jpg?h=900&mode=crop&quality=75&scale=both&w=1920'
};
window.WGH_EVENT_IMAGES=Object.assign({},window.WGH_EVENT_IMAGES||{},IMAGES);
const byTitle=new Map((window.EVENTS||[]).map(e=>[e.title,e]));
function cleanTitle(el){return el?.querySelector('h3')?.textContent?.trim()||''}
function safeUrl(url){return String(url||'').replace(/["'()\\]/g,'')}
function imageFor(el){const title=cleanTitle(el),event=byTitle.get(title);return event?.image||IMAGES[title]||''}
function apply(el){
  if(!el||el.dataset.imageCheck)return;
  const url=imageFor(el);if(!url){el.dataset.imageCheck='none';return}
  el.dataset.imageCheck='loading';
  const img=new Image();img.decoding='async';img.loading='lazy';img.referrerPolicy='no-referrer';
  img.onload=()=>{if(!el.isConnected)return;if(el.classList.contains('card')){const visual=el.querySelector('.card-visual');if(!visual)return;visual.style.backgroundImage=`linear-gradient(180deg,rgba(5,7,11,.08),rgba(5,7,11,.50)),url("${safeUrl(url)}")`;visual.style.backgroundSize='cover';visual.style.backgroundPosition='center';visual.querySelector('.emoji')?.style.setProperty('display','none');el.classList.add('has-event-image')}else{el.style.backgroundImage=`linear-gradient(180deg,rgba(5,7,11,.05),rgba(5,7,11,.62)),url("${safeUrl(url)}")`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.querySelector('.top-emoji')?.style.setProperty('display','none');el.classList.add('has-event-image')}el.dataset.imageCheck='done'};
  img.onerror=()=>{el.dataset.imageCheck='failed'};img.src=url;
}
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){apply(entry.target);observer.unobserve(entry.target)}}),{rootMargin:'180px 0px'}):null;
function queue(el){if(!el||el.dataset.imageCheck)return;observer?observer.observe(el):apply(el)}
function scanRoot(root){if(!root)return;if(root.matches?.('.card,.top-card'))queue(root);root.querySelectorAll?.('.card,.top-card').forEach(queue)}
const grid=document.getElementById('grid'),top=document.getElementById('topGrid');
[grid,top].filter(Boolean).forEach(root=>{new MutationObserver(list=>{for(const m of list)for(const n of m.addedNodes)if(n.nodeType===1)scanRoot(n)}).observe(root,{childList:true,subtree:true});scanRoot(root)});
})();