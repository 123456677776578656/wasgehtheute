(()=>{
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const events=(window.EVENTS||[]).filter(e=>e.end>=today&&e.source);
const municipalities=window.WGH_MUNICIPALITIES||[];
const localities=window.WGH_LOCALITIES||[];
const groups=document.getElementById('cantonGroups');
const order=['Ostschweiz','Deutschschweiz','Romandie','Tessin'];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eventPlaces=new Map();
const eventLocalities=new Map();
for(const event of events){const municipality=window.WGH_EVENT_MUNICIPALITY?.(event);if(municipality)eventPlaces.set(municipality.id,(eventPlaces.get(municipality.id)||0)+1)}
for(const event of events){const locality=window.WGH_EVENT_LOCALITY?.(event);if(locality)eventLocalities.set(locality.id,(eventLocalities.get(locality.id)||0)+1)}

groups.innerHTML=order.map(group=>`<section class="canton-section"><h2>${group}</h2><div class="canton-grid">${window.WGH_CANTONS.filter(c=>c.group===group).map(c=>{
  const rows=events.filter(e=>e.region===c.region),municipalityRows=window.WGH_MUNICIPALITIES_BY_CANTON?.[c.code]||[],localityRows=window.WGH_LOCALITIES_BY_CANTON?.[c.code]||[],activePlaces=municipalityRows.filter(m=>eventPlaces.has(m.id)).length;
  return `<a class="canton-card" href="kanton.html?code=${c.code}"><small>${esc(c.lang)}</small><h3>${c.country==='LI'?'🇱🇮 ':''}${esc(c.name)}</h3><p><strong>${municipalityRows.length} Gemeinden</strong><br>${localityRows.length} Dörfer/Ortschaften<br>${activePlaces} Gemeinden mit bestätigten Events</p><span class="canton-count">${rows.length} Events →</span></a>`;
}).join('')}</div></section>`).join('');

document.getElementById('cantonEventTotal').textContent=`${events.length} bestätigte Events`;
document.getElementById('cantonPlaceTotal').textContent=`${municipalities.length} Gemeinden · ${localities.length} Ortschaften`;

const input=document.getElementById('municipalitySearch');
const results=document.getElementById('municipalityResults');
function renderSearch(){
  const term=window.WGH_NORMALIZE_PLACE?.(input?.value)||'';
  if(!term){results.innerHTML='<p class="municipality-search-hint">Tippe einen Gemeindenamen ein oder öffne oben einen Kanton.</p>';return}
  const matches=[
    ...municipalities.filter(m=>eventPlaces.has(m.id)).filter(m=>{const canton=window.WGH_CANTON_BY_CODE[m.canton];return window.WGH_NORMALIZE_PLACE(`${m.name} ${canton?.name||''}`).includes(term)}).map(m=>({kind:'Gemeinde',row:m,count:eventPlaces.get(m.id)})),
    ...localities.filter(l=>eventLocalities.has(l.id)).filter(l=>{const canton=window.WGH_CANTON_BY_CODE[l.canton];return window.WGH_NORMALIZE_PLACE(`${l.name} ${l.postalCodes.join(' ')} ${canton?.name||''}`).includes(term)}).map(l=>({kind:'Dorf/Ortschaft',row:l,count:eventLocalities.get(l.id)}))
  ].sort((a,b)=>a.row.name.localeCompare(b.row.name,'de')||a.kind.localeCompare(b.kind,'de')).slice(0,100);
  results.innerHTML=matches.length?`<div class="municipality-grid">${matches.map(item=>{const m=item.row,canton=window.WGH_CANTON_BY_CODE[m.canton],plz=m.postalCodes?.join(', ');return `<a class="municipality-card ${item.kind==='Dorf/Ortschaft'?'is-locality':''}" href="ort.html?id=${encodeURIComponent(m.id)}"><span>${esc(m.name)}</span><small>${esc(item.kind)} · ${esc(canton?.name||m.canton.toUpperCase())}${plz?` · PLZ ${esc(plz)}`:''}</small><b>${item.count} Events →</b></a>`}).join('')}</div>`:'<div class="canton-empty"><strong>Keine Gemeinde oder Ortschaft gefunden.</strong><p>Prüfe die Schreibweise.</p></div>';
}
input?.addEventListener('input',renderSearch);renderSearch();
})();
