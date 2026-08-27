(()=>{
const DATA=Array.isArray(window.EVENTS)?window.EVENTS:[],U=window.WGH_EVENT_UTILS||{},root=document.getElementById('landingEvents');if(!root)return;
const mode=document.body.dataset.mode||'',cityFilter=document.body.dataset.city||'',regionFilter=document.body.dataset.region||'',categoryFilter=document.body.dataset.category||'',today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>U.slug?U.slug(s):String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const id=e=>U.id?U.id(e):slug(`${e.title}-${e.city}-${e.start}`),url=e=>`event.html?id=${encodeURIComponent(id(e))}`;
const deDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))?String(s).split('-').reverse().join('.'):String(s||'');
function ymd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekend(){const d=new Date(today+'T12:00:00'),dow=d.getDay();let add=(5-dow+7)%7;if(dow===6)add=-1;if(dow===0)add=-2;const f=new Date(d);f.setDate(d.getDate()+add);const s=new Date(f);s.setDate(f.getDate()+2);return[ymd(f),ymd(s)]}
function label(e){if(e.start<=today&&e.end>=today)return'🔥 Heute';const d=new Date(today+'T12:00:00');d.setDate(d.getDate()+1);if(e.start===ymd(d))return'🌤 Morgen';const w=weekend();if(e.start<=w[1]&&e.end>=w[0])return'🗓 Dieses Wochenende';return e.date||e.start}
function verified(e){const c=U.checkedAt?.(e)||e.checked_at||e.verified_at||'';return `✓ Quelle geprüft${c?' · '+deDate(c):''}`}
let arr=DATA.filter(e=>e.end>=today&&e.quality_status!=='cancelled-warning'&&e.status!=='cancelled');
if(mode==='buchs')arr=arr.filter(e=>/buchs|werdenberg/i.test(e.city));
if(mode==='zuerich')arr=arr.filter(e=>e.region==='Kanton Zürich');
if(mode==='chur')arr=arr.filter(e=>e.region==='Chur / Graubünden');
if(mode==='thurgau')arr=arr.filter(e=>e.region==='Kanton Thurgau');
if(mode==='nightlife')arr=arr.filter(e=>(e.cats||[]).some(c=>['Bar','Club','Party','Musik'].includes(c)));
if(mode==='weekend'){const w=weekend();arr=arr.filter(e=>e.start<=w[1]&&e.end>=w[0])}
if(cityFilter)arr=arr.filter(e=>String(e.city).toLowerCase().includes(cityFilter.toLowerCase()));
if(regionFilter)arr=arr.filter(e=>e.region===regionFilter);
if(categoryFilter)arr=arr.filter(e=>(e.cats||[]).includes(categoryFilter));
arr.sort((a,b)=>a.start.localeCompare(b.start)||String(a.time||'99:99').localeCompare(String(b.time||'99:99')));
root.innerHTML=arr.slice(0,80).map(e=>{const p=e.price||((e.cats||[]).includes('Gratis')?'Gratis':'');const status=e.status&&e.status!=='confirmed'?`<span>⚠ ${esc(e.status_label||e.status)}</span>`:'';return `<article class="landing-event"><small><strong>${esc(label(e))}</strong> · 📍 ${esc(e.city)}${e.venue?` · ${esc(e.venue)}`:''}</small><h3><a href="${esc(url(e))}">${esc(e.emoji||'📅')} ${esc(e.title)}</a></h3><p>${esc(e.desc||'Weitere Angaben bei der Originalquelle.')}</p><div class="event-facts"><span>🕒 ${esc(e.time||'Zeit siehe Quelle')}</span>${p?`<span>💳 ${esc(p)}</span>`:''}${e.ticket?'<span>🎟 Tickets</span>':''}${status}</div><small class="verified">${esc(verified(e))}</small><br><a class="source" href="${esc(url(e))}">Details →</a></article>`}).join('')||'<p>Aktuell sind keine passenden kommenden bestätigten Events eingetragen.</p>';
const count=document.getElementById('landingCount');if(count)count.textContent=arr.length;
})();
