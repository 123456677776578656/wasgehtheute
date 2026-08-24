(()=>{
const grid=document.getElementById('grid');
if(!grid || window.innerWidth>820)return;
let hidden=[];
const FIRST=10,STEP=8;
function ensureBox(){
  let box=document.getElementById('mobileMoreEvents');
  if(!box){box=document.createElement('div');box.id='mobileMoreEvents';box.className='more-events-wrap';grid.insertAdjacentElement('afterend',box)}
  return box;
}
function draw(){
  const box=ensureBox();
  if(!hidden.length){box.innerHTML='';return}
  box.innerHTML=`<button type="button" class="more-events-btn" id="moreEventsBtn" aria-label="Weitere Events anzeigen">Mehr Events anzeigen <span class="count">+${hidden.length}</span></button>`;
}
function compact(){
  if(window.innerWidth>820)return;
  const cards=[...grid.children].filter(el=>el.classList?.contains('card'));
  if(!cards.length)return;
  hidden=[];
  cards.forEach((el,i)=>{if(i>=FIRST){hidden.push(el);el.remove()}});
  draw();
}
function showMore(){
  const next=hidden.splice(0,STEP);
  if(!next.length){draw();return}
  const frag=document.createDocumentFragment();next.forEach(el=>frag.appendChild(el));grid.appendChild(frag);draw();
}
document.addEventListener('click',e=>{
  const btn=e.target.closest('#moreEventsBtn');
  if(!btn)return;
  e.preventDefault();e.stopPropagation();showMore();
},{capture:true});
window.addEventListener('wgh:render',()=>setTimeout(compact,0));
window.addEventListener('resize',()=>{clearTimeout(window.__wghMoreResize);window.__wghMoreResize=setTimeout(compact,180)},{passive:true});
setTimeout(compact,120);
})();