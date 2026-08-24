(()=>{
const mapEl=document.getElementById('eventMap'),loadBtn=document.getElementById('loadMapBtn'),nearBtn=document.getElementById('mapNearMeBtn');
if(!mapEl||!loadBtn)return;
let loaded=false,map=null,markers=[];
const DATA=window.EVENTS||[];
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadLeaflet(){
 return new Promise((resolve,reject)=>{
  if(window.L)return resolve();
  if(document.getElementById('leaflet-js'))return document.getElementById('leaflet-js').addEventListener('load',resolve,{once:true});
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
  const s=document.createElement('script');s.id='leaflet-js';s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
 });
}
function getPoints(){return DATA.map(e=>{const p=window.WGH_locationFor?.(e.city);return p?{e,p}:null}).filter(Boolean).filter((x,i,a)=>a.findIndex(y=>y.e.title===x.e.title&&y.e.start===x.e.start&&y.e.city===x.e.city)===i)}
async function initMap(){
 if(loaded){setTimeout(()=>map?.invalidateSize(),50);return}
 loaded=true;loadBtn.disabled=true;loadBtn.textContent='Karte wird geladen...';
 try{await loadLeaflet();
  map=L.map(mapEl,{scrollWheelZoom:false,zoomControl:true}).setView([47.16,9.45],9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  const points=getPoints();
  points.forEach(({e,p})=>{const m=L.marker(p).addTo(map);m.bindPopup(`<strong>${esc(e.title)}</strong><br>📍 ${esc(e.city||'')}<br>📅 ${esc(e.date||e.start||'')}<br><a href="${esc(e.source||'#')}" target="_blank" rel="noopener">Quelle öffnen ↗</a>`);markers.push(m)});
  if(points.length){const group=L.featureGroup(markers);map.fitBounds(group.getBounds().pad(.12))}
  mapEl.classList.add('map-ready');loadBtn.textContent='Karte aktualisieren';
  setTimeout(()=>map.invalidateSize(),80);
 }catch(err){loaded=false;loadBtn.disabled=false;loadBtn.textContent='Karte erneut laden';mapEl.innerHTML='<div class="map-error">Karte konnte gerade nicht geladen werden.<br>Bitte nochmals versuchen.</div>'}
}
loadBtn.addEventListener('click',initMap);
nearBtn?.addEventListener('click',()=>{if(!navigator.geolocation){alert('Standort wird nicht unterstützt.');return}navigator.geolocation.getCurrentPosition(pos=>{if(!loaded)initMap().then(()=>map?.setView([pos.coords.latitude,pos.coords.longitude],12));else map.setView([pos.coords.latitude,pos.coords.longitude],12)},()=>alert('Standortfreigabe wurde nicht erlaubt.'))});
const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))initMap(),io.disconnect()},{rootMargin:'500px'});io.observe(mapEl);
})();