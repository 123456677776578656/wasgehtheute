(()=>{
const DATA=window.EVENTS||[];
const CFG=window.WGH_CONFIG||{};
const NS=CFG.analyticsNamespace||'wasgehtheute.ch';
const favKey='wgh_favorites_v1';
let userPos=null;
const slugify=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const eid=e=>slugify(`${e.title}-${e.city}-${e.start}`);
const eventUrl=e=>new URL(`event.html?id=${encodeURIComponent(eid(e))}`,location.href).href;
const byId=new Map(DATA.map(e=>[eid(e),e]));
function getFavs(){try{const v=JSON.parse(localStorage.getItem(favKey)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function setFavs(v){try{localStorage.setItem(favKey,JSON.stringify([...new Set(v)]))}catch{}window.WGH_APP?.favoriteStateChanged?.()}
async function counter(name,up=false){try{const suffix=up?'':'?readOnly=true';const r=await fetch(`https://counterapi.com/api/${encodeURIComponent(NS)}/metric/${encodeURIComponent(name)}${suffix}`,{cache:'no-store'});if(!r.ok)return 0;const d=await r.json();return Number(d.value??0)||0}catch{return 0}}
function eventFromCard(card){return byId.get(card.dataset.eventId)||null}
function calendarText(e){const clean=x=>String(x||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');const start=String(e.start||'').replaceAll('-','');const d=new Date(`${e.end}T12:00:00`);d.setDate(d.getDate()+1);const end=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//WasGehtHeute.ch//DE\r\nBEGIN:VEVENT\r\nUID:${eid(e)}@wasgehtheute.ch\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\nSUMMARY:${clean(e.title)}\r\nLOCATION:${clean(e.venue||e.location||e.city)}\r\nDESCRIPTION:${clean(e.desc)}\\n${clean(e.source)}\r\nURL:${e.source}\r\nEND:VEVENT\r\nEND:VCALENDAR`}
function downloadCalendar(e){const b=new Blob([calendarText(e)],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a'),url=URL.createObjectURL(b);a.href=url;a.download=`${slugify(e.title)||'event'}.ics`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function shareEvent(e){const payload={title:e.title,text:`${e.title} – ${e.date} in ${e.city}`,url:eventUrl(e)};if(navigator.share){try{await navigator.share(payload);return}catch(err){if(err?.name==='AbortError')return}}try{await navigator.clipboard.writeText(payload.url);alert('Link kopiert ✅')}catch{prompt('Link kopieren:',payload.url)}}
function decorateCards(){
  document.querySelectorAll('.card').forEach(card=>{
    if(card.dataset.enhanced)return;
    const e=eventFromCard(card),body=card.querySelector('.card-body');if(!e||!body)return;
    card.dataset.enhanced='1';const id=eid(e),saved=getFavs().includes(id);
    const row=document.createElement('div');row.className='quick-actions';row.innerHTML=`<button type="button" class="quick-btn fav-btn" aria-label="Favorit speichern" aria-pressed="${saved}">${saved?'❤️':'🤍'}</button><button type="button" class="quick-btn share-btn" aria-label="Event teilen">📤</button><button type="button" class="quick-btn cal-btn" aria-label="Zum Kalender hinzufügen">📅</button>${e.ticket?'<a class="quick-btn ticket-btn" target="_blank" rel="noopener noreferrer" aria-label="Tickets">🎟️</a>':''}`;body.appendChild(row);
    const fav=row.querySelector('.fav-btn');fav.onclick=()=>{let f=getFavs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];setFavs(f);const yes=f.includes(id);fav.textContent=yes?'❤️':'🤍';fav.setAttribute('aria-pressed',String(yes))};
    row.querySelector('.share-btn').onclick=()=>shareEvent(e);row.querySelector('.cal-btn').onclick=()=>downloadCalendar(e);
    if(e.ticket){const a=row.querySelector('.ticket-btn');a.href=e.ticket;a.onclick=()=>counter('ticket-'+id,true)}
  })
}
const grid=document.getElementById('grid');if(grid)new MutationObserver(()=>requestAnimationFrame(decorateCards)).observe(grid,{childList:true});decorateCards();
function haversine(a,b){const R=6371,toRad=x=>x*Math.PI/180,dLat=toRad(b[0]-a[0]),dLon=toRad(b[1]-a[1]),q=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
function applyNear(){if(!userPos)return;const next={};DATA.forEach(e=>{const p=window.WGH_locationFor?.(e.city);if(p)next[eid(e)]=haversine(userPos,p)});window.WGH_APP?.setDistances?.(next)}
function requestLocation(){if(!navigator.geolocation){alert('Standort wird von diesem Browser nicht unterstützt.');return}navigator.geolocation.getCurrentPosition(pos=>{userPos=[pos.coords.latitude,pos.coords.longitude];applyNear()},()=>alert('Standort konnte nicht verwendet werden. Bitte Standortfreigabe erlauben.'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000})}
document.getElementById('nearMeBtn')?.addEventListener('click',requestLocation);
function popularCard(e,count,i){return `<article class="top-card" data-event-id="${eid(e)}"><div class="top-badge">${i===0?'🔥 Am beliebtesten':'⭐ Beliebt'} · ${count} Klick${count===1?'':'s'}</div><div class="top-emoji">${e.emoji||'📅'}</div><div class="top-copy"><small>📍 ${e.city} · ${e.date}</small><h3><a href="${eventUrl(e)}">${e.title}</a></h3><p>${e.desc||''}</p><a class="top-link" href="${eventUrl(e)}">Event ansehen →</a></div></article>`}
function popularSide(e,count){return `<a class="desktop-popular-item" href="${eventUrl(e)}"><span class="desktop-popular-thumb">${e.emoji||'📅'}</span><span class="desktop-popular-copy"><b>${e.title}</b><span>⌖ ${e.city} · ${e.date}</span><em>${count} Klick${count===1?'':'s'}</em></span></a>`}
async function popularity(){
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date()),future=DATA.filter(e=>e.end>=today).slice(0,24);
  const scores=await Promise.all(future.map(async e=>({e,count:await counter('event-'+eid(e),false)})));
  scores.sort((a,b)=>b.count-a.count||a.e.start.localeCompare(b.e.start));
  const ranked=scores.filter(x=>x.count>0),top=ranked.slice(0,3),side=ranked.slice(0,5);
  const wrap=document.getElementById('topGrid');if(top.length&&wrap){wrap.innerHTML=top.map((x,i)=>popularCard(x.e,x.count,i)).join('');const text=document.getElementById('highlightText');if(text)text.textContent='Diese Events wurden am häufigsten geöffnet.'}
  const pop=document.getElementById('desktopPopularGrid');if(side.length&&pop)pop.innerHTML=side.map(x=>popularSide(x.e,x.count)).join('');
  window.dispatchEvent(new Event('wgh:popular-ready'));
}
if('requestIdleCallback' in window)requestIdleCallback(()=>popularity(),{timeout:1800});else setTimeout(popularity,700);
async function submitRequest(form){const status=document.getElementById('demoMsg');if(!status)return;const get=id=>document.getElementById(id)?.value?.trim?.()||'';const payload={name:get('formName'),email:get('formEmail'),type:get('requestType'),subject:get('formSubject'),place:get('formPlace'),date:get('formDate'),link:get('formLink'),message:get('formMessage'),page:location.href,createdAt:new Date().toISOString()};status.style.display='block';if(CFG.formEndpoint){status.textContent='Wird gesendet…';try{const r=await fetch(CFG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error();status.textContent='✅ Anfrage wurde gesendet.';form.reset()}catch{status.textContent='⚠️ Versand fehlgeschlagen. Bitte später erneut versuchen.'}return}status.textContent='⚠️ Formularversand ist momentan nicht verfügbar.'}
const form=document.getElementById('actionForm');if(form){form.addEventListener('submit',e=>{e.preventDefault();submitRequest(form)})}
})();