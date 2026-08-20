(()=>{
const IMAGES={
  'Zürcher Theater Spektakel':'https://s7g10.scene7.com/is/image/zurcherverkehrsverbund/theater-spektakel-gelaende',
  'Migros Hiking Sounds':'https://storage.cpstatic.ch/storage/detail_large_transx2/8e29aa2e061a483610ae0d1c2207087d-be1faf50--1264132.webp',
  'Tour de Suisse der Menschlichkeit':'https://www.osar.ch/fileadmin/_processed_/a/a/csm_V1-Header-Desk_10-3_1bc6d881ff.jpg',
  'Rundfunk.fm Festival':'https://rundfunk.fm/media/filer_public/74/0e/740e07c6-d3bb-4ad3-a0d0-a02be9c761cb/ananas.png'
};

function cleanTitle(el){return el?.querySelector('h3')?.textContent?.trim()||''}
function safeUrl(url){return String(url||'').replace(/["'()\\]/g,'')}
function preload(url,done){const img=new Image();img.onload=()=>done(true);img.onerror=()=>done(false);img.referrerPolicy='no-referrer';img.src=url}

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

function apply(){
  document.querySelectorAll('.card').forEach(enhanceCard);
  document.querySelectorAll('.top-card').forEach(enhanceHighlight);
}

const root=document.getElementById('grid')||document.body;
if(root)new MutationObserver(()=>requestAnimationFrame(apply)).observe(root,{childList:true,subtree:true});
const top=document.getElementById('topGrid');if(top)new MutationObserver(()=>requestAnimationFrame(apply)).observe(top,{childList:true,subtree:true});
apply();
})();