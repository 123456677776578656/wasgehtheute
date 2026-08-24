(()=>{
const panel=document.querySelector('.traffic-bottom');
if(!panel)return;
let grid=panel.querySelector('.traffic-bottom-grid');
if(!grid){grid=document.createElement('div');grid.className='traffic-bottom-grid';panel.appendChild(grid)}
if(!grid.querySelector('#viewsTotal')){const item=document.createElement('div');item.className='stat';item.innerHTML='<strong id="viewsTotal">…</strong><span>Aufrufe insgesamt</span>';grid.appendChild(item)}
const style=document.createElement('style');
style.textContent='.traffic-bottom-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.traffic-bottom .stat{min-width:0}.traffic-bottom .stat strong{font-size:22px;font-weight:950;display:block}.traffic-bottom .stat span{display:block;font-size:10px;line-height:1.25}@media(max-width:820px){.traffic-bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.traffic-bottom{margin:20px 14px 14px!important}.traffic-bottom .stat{padding:12px 9px;border-radius:13px}.traffic-bottom .stat strong{font-size:19px}.traffic-bottom .stat span{font-size:8px}}';document.head.appendChild(style);
})();