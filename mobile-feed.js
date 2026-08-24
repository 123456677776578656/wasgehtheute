(()=>{
const grid=document.getElementById('grid');
if(!grid)return;
let pool=[];
let expanded=false;
const FIRST=10,STEP=8;
function ensureButton(){
  let box=document.getElementById('mobileMoreEvents');
  if(!box){
    box=document.createElement('div');box.id='mobileMoreEvents';box.className='more-events-wrap';
    grid.after(box);
  }
  return box;
}
function renderButton(){
  const box=ensureButton();
  const remaining=pool.length;
  box.innerHTML=remaining?`<button type="button" class="more-events-btn" id="moreEventsBtn">Mehr Events anzeigen <span class="count">+${remaining}</span></button>`:'';
  box.querySelector('#moreEventsBtn')?.addEventListener('click',()=>{
    const next=pool.splice(0,STEP);
    next.forEach(el=>grid.appendChild(el));
    renderButton();
    if(!pool.length){expanded=true;}
  });
}
function compact(){
  if(window.innerWidth>820){
    pool=[];document.getElementById('mobileMoreEvents')?.remove();return;
  }
  const cards=[...grid.querySelectorAll(':scope > .card')];
  if(!cards.length)return;
  pool=[];expanded=false;
  cards.forEach((el,i)=>{if(i>=FIRST)pool.push(el)});
  pool.forEach(el=>el.remove());
  renderButton();
}
const original=window.WGH_APP?.render;
if(typeof original==='function'){
  window.WGH_APP.render=()=>{original();requestAnimationFrame(compact)};
}
window.addEventListener('resize',()=>{clearTimeout(window.__wghResize);window.__wghResize=setTimeout(compact,180)},{passive:true});
window.addEventListener('wgh:render',()=>requestAnimationFrame(compact));
requestAnimationFrame(compact);
})();