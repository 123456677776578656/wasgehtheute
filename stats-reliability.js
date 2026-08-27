(()=>{
function init(){
 const panel=document.querySelector('.traffic-bottom');
 if(!panel)return;
 let timer=null;
 const update=()=>{
  clearTimeout(timer);
  timer=setTimeout(()=>{
   const ids=['visitorsToday','viewsToday','viewsWeek','viewsTotal'];
   const values=ids.map(id=>document.getElementById(id)?.textContent?.trim()).filter(Boolean);
   const unavailable=values.length>0&&values.every(v=>v==='–'||v==='-'||v==='…'||v==='');
   const p=panel.querySelector('.traffic-head p');
   if(p)p.textContent=unavailable?'Statistik momentan nicht verfügbar':'Die Zahlen aktualisieren sich automatisch.';
   panel.dataset.statsAvailable=unavailable?'false':'true';
  },400);
 };
 new MutationObserver(update).observe(panel,{subtree:true,childList:true,characterData:true});
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
