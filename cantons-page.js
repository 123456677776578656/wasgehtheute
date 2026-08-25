(()=>{
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Zurich"}).format(new Date());
const events=(window.EVENTS||[]).filter(e=>e.end>=today&&e.source);
const groups=document.getElementById("cantonGroups");
const order=["Ostschweiz","Deutschschweiz","Romandie","Tessin"];
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
groups.innerHTML=order.map(group=>`<section class="canton-section"><h2>${group}</h2><div class="canton-grid">${window.WGH_CANTONS.filter(c=>c.group===group).map(c=>{const rows=events.filter(e=>e.region===c.region),places=new Set(rows.map(e=>e.city)).size;return `<a class="canton-card" href="kanton.html?code=${c.code}"><small>${esc(c.lang)}</small><h3>${c.country==="LI"?"🇱🇮 ":""}${esc(c.name)}</h3><p>${rows.length?`${places} Orte mit bestätigten Einträgen`:`Bereich bereit – bestätigte Events folgen`}</p><span class="canton-count">${rows.length} Events →</span></a>`}).join("")}</div></section>`).join("");
document.getElementById("cantonEventTotal").textContent=`${events.length} bestätigte Events`;
document.getElementById("cantonPlaceTotal").textContent=`${new Set(events.map(e=>e.city)).size} Orte`;
})();
