(()=>{
const code=(new URLSearchParams(location.search).get('code')||'sg').toLowerCase();
const canton=window.WGH_CANTON_BY_CODE[code]||window.WGH_CANTON_BY_CODE.sg;
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const rows=(window.EVENTS||[]).filter(e=>e.region===canton.region&&e.end>=today&&e.source).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'de'));
const municipalities=window.WGH_MUNICIPALITIES_BY_CANTON?.[canton.code]||[];
const localities=window.WGH_LOCALITIES_BY_CANTON?.[canton.code]||[];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const counts=new Map();
const localityCounts=new Map();
for(const event of rows){const municipality=window.WGH_EVENT_MUNICIPALITY?.(event);if(municipality)counts.set(municipality.id,(counts.get(municipality.id)||0)+1)}
for(const event of rows){const locality=window.WGH_EVENT_LOCALITY?.(event);if(locality)localityCounts.set(locality.id,(localityCounts.get(locality.id)||0)+1)}

document.title=`Alle Gemeinden ${canton.name} – WasGehtHeute.ch`;
document.getElementById('cantonGroup').textContent=canton.country==='LI'?'Fürstentum Liechtenstein':canton.group;
document.getElementById('cantonTitle').textContent=`Alle Gemeinden in ${canton.name}`;
document.getElementById('cantonIntro').textContent=`Amtlich erfasst: ${municipalities.length} Gemeinden und ${localities.length} Dörfer/Ortschaften. Angezeigt werden nur Orte mit mindestens einem bestätigten kommenden Event.`;
document.getElementById('cantonCount').textContent=`${counts.size} aktive Gemeinden · ${localityCounts.size} aktive Ortschaften · ${rows.length} Events`;
document.getElementById('municipalityHeading').textContent=`${counts.size} Gemeinden mit Events`;

const grid=document.getElementById('municipalityGrid');
const input=document.getElementById('cantonMunicipalitySearch');
function renderMunicipalities(){
  const term=window.WGH_NORMALIZE_PLACE?.(input?.value)||'';
  const active=municipalities.filter(m=>counts.has(m.id));
  const visible=active.filter(m=>!term||window.WGH_NORMALIZE_PLACE(m.name).includes(term));
  grid.innerHTML=visible.length?visible.map(m=>`<a class="municipality-card" href="ort.html?id=${encodeURIComponent(m.id)}"><span>${esc(m.name)}</span><small>${m.country==='CH'?`BFS ${m.bfs}`:'Liechtenstein'}</small><b>${counts.get(m.id)} Events →</b></a>`).join(''):'<div class="canton-empty"><strong>Keine Gemeinde mit bestätigten Events gefunden.</strong></div>';
  document.getElementById('municipalityVisibleCount').textContent=`${visible.length} von ${active.length}`;
}
input?.addEventListener('input',renderMunicipalities);renderMunicipalities();

const localityGrid=document.getElementById('localityGrid');
const localityInput=document.getElementById('cantonLocalitySearch');
function renderLocalities(){
  const term=window.WGH_NORMALIZE_PLACE?.(localityInput?.value)||'';
  const active=localities.filter(l=>localityCounts.has(l.id));
  const visible=active.filter(l=>!term||window.WGH_NORMALIZE_PLACE(`${l.name} ${l.postalCodes.join(' ')}`).includes(term));
  localityGrid.innerHTML=visible.length?visible.map(l=>`<a class="municipality-card is-locality" href="ort.html?id=${encodeURIComponent(l.id)}"><span>${esc(l.name)}</span><small>Dorf/Ortschaft · PLZ ${esc(l.postalCodes.join(', '))}</small><b>${localityCounts.get(l.id)} Events →</b></a>`).join(''):'<div class="canton-empty"><strong>Keine Ortschaft mit bestätigten Events gefunden.</strong></div>';
  document.getElementById('localityVisibleCount').textContent=`${visible.length} von ${active.length}`;
}
localityInput?.addEventListener('input',renderLocalities);renderLocalities();

document.getElementById('cantonEvents').innerHTML=rows.length?rows.map(e=>`<article class="canton-event"><small>📅 ${esc(e.date||e.start)} · 📍 ${esc(e.city)}</small><h3>${esc(e.emoji||'📅')} ${esc(e.title)}</h3><p>${esc(e.desc||'')}</p><p><strong>${esc(e.time||'Zeit siehe Quelle')}</strong></p><a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">Geprüfte Quelle öffnen ↗</a></article>`).join(''):'<div class="canton-empty"><h2>Momentan keine bestätigten Events</h2><p>Die amtlichen Orte bleiben im Datensatz erfasst, werden aber nicht als leere Karten angezeigt.</p></div>';
})();
