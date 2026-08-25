(()=>{
const id=new URLSearchParams(location.search).get('id')||'ch-3271';
const locality=window.WGH_LOCALITY_BY_ID?.[id]||null;
const municipality=locality?(window.WGH_MUNICIPALITY_BY_ID?.[locality.municipalityId]||null):(window.WGH_MUNICIPALITY_BY_ID?.[id]||window.WGH_MUNICIPALITIES?.[0]);
const entity=locality||municipality;
const canton=window.WGH_CANTON_BY_CODE?.[entity?.canton];
if(!entity||!canton)return;
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const rows=(window.EVENTS||[]).filter(e=>{
  if(e.end<today||!e.source)return false;
  return locality?window.WGH_EVENT_LOCALITY?.(e)?.id===locality.id:window.WGH_EVENT_MUNICIPALITY?.(e)?.id===municipality.id;
}).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'de'));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.title=`Events ${entity.name} – WasGehtHeute.ch`;
document.getElementById('municipalityBack').href=`kanton.html?code=${canton.code}`;
document.getElementById('municipalityBack').textContent=`← Alle Gemeinden und Dörfer in ${canton.name}`;
document.getElementById('municipalityCanton').textContent=locality?`Dorf/Ortschaft · ${canton.name}`:(canton.country==='LI'?'Fürstentum Liechtenstein':`Kanton ${canton.name}`);
document.getElementById('municipalityTitle').textContent=entity.name;
document.getElementById('municipalityIntro').textContent=rows.length?`${rows.length} bestätigte kommende Veranstaltung${rows.length===1?'':'en'} gefunden.`:`${locality?'Die Ortschaft':'Die Gemeinde'} ist vollständig im Verzeichnis enthalten. Momentan gibt es hier keinen bestätigten kommenden Event.`;
document.getElementById('municipalityCount').textContent=`${rows.length} Event${rows.length===1?'':'s'}`;
document.getElementById('municipalityOfficialId').textContent=locality?`Amtliche Ortschaft · PLZ ${locality.postalCodes.join(', ')}${municipality?` · Gemeinde ${municipality.name}`:''}`:(municipality.country==='CH'?`Amtliche BFS-Gemeindenummer: ${municipality.bfs}`:'Offizielle Gemeinde Liechtensteins');
const map=document.getElementById('municipalityMapLink');
map.href=`https://www.openstreetmap.org/?mlat=${entity.lat}&mlon=${entity.lon}#map=12/${entity.lat}/${entity.lon}`;
document.getElementById('municipalityEvents').innerHTML=rows.length?rows.map(e=>`<article class="canton-event"><small>📅 ${esc(e.date||e.start)} · 📍 ${esc(e.city)}</small><h3>${esc(e.emoji||'📅')} ${esc(e.title)}</h3><p>${esc(e.desc||'')}</p><p><strong>${esc(e.time||'Zeit siehe Quelle')}</strong></p><a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">Geprüfte Quelle öffnen ↗</a></article>`).join(''):'<div class="canton-empty"><h2>Momentan keine bestätigten Events</h2><p>Wir zeigen hier nichts Erfundenes an. Sobald für diesen Ort ein zukünftiger Event mit öffentlicher Quelle bestätigt ist, erscheint er automatisch in diesem Bereich.</p></div>';
})();
