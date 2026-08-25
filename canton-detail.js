(()=>{
const code=(new URLSearchParams(location.search).get("code")||"sg").toLowerCase();
const canton=window.WGH_CANTON_BY_CODE[code]||window.WGH_CANTON_BY_CODE.sg;
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Zurich"}).format(new Date());
const rows=(window.EVENTS||[]).filter(e=>e.region===canton.region&&e.end>=today&&e.source).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,"de"));
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.title=`Events ${canton.name} – WasGehtHeute.ch`;
document.getElementById("cantonGroup").textContent=canton.country==="LI"?"Fürstentum Liechtenstein":canton.group;
document.getElementById("cantonTitle").textContent=`Was läuft in ${canton.name}?`;
document.getElementById("cantonIntro").textContent=`Geprüfte kommende Veranstaltungen in ${canton.name}. Sprache: ${canton.lang}.`;
document.getElementById("cantonCount").textContent=`${rows.length} Event${rows.length===1?"":"s"}`;
document.getElementById("cantonEvents").innerHTML=rows.length?rows.map(e=>`<article class="canton-event"><small>📅 ${esc(e.date||e.start)} · 📍 ${esc(e.city)}</small><h3>${esc(e.emoji||"📅")} ${esc(e.title)}</h3><p>${esc(e.desc||"")}</p><p><strong>${esc(e.time||"Zeit siehe Quelle")}</strong></p><a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">Geprüfte Quelle öffnen ↗</a></article>`).join(""):`<div class="canton-empty"><h2>Noch keine bestätigten Einträge</h2><p>Dieser Kantonsbereich ist eingerichtet. Es werden erst Veranstaltungen angezeigt, wenn Datum, Ort und öffentliche Quelle eindeutig geprüft sind.</p></div>`;
})();
