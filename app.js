const DATA=window.EVENTS||[];
const FAVORITES_KEY='wgh_favorites_v1';

function swissToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
const TODAY=swissToday();
const categoryEmoji={Alle:'🔥',Dorffest:'🎉',Party:'🪩',Musik:'🎵',Club:'🪩',Bar:'🍸',Festival:'🎪',Sport:'⚽',Markt:'🛍️',Familie:'👨‍👩‍👧',Food:'🍔',Kultur:'🎭',Gratis:'🆓',Outdoor:'🥾'};
const topCats=['Alle','Party','Musik','Bar','Club','Dorffest','Markt','Familie','Sport','Kultur','Gratis'];
let activeCategory='Alle',activePeriod='all',favoritesOnly=false,distanceMode=false,distances={};

const q=document.getElementById('q'),area=document.getElementById('area'),place=document.getElementById('place'),
sort=document.getElementById('sort'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),
result=document.getElementById('result'),mobileFilters=document.getElementById('mobileFilters'),topGrid=document.getElementById('topGrid'),
favoritesModeBar=document.getElementById('favoritesModeBar'),recommendedTitle=document.querySelector('.recommended-section .content-head h2');

function ymd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function overlaps(e,a,b){return e.start<=b&&e.end>=a}
function thisWeekend(){const d=new Date(TODAY+'T12:00:00'),dow=d.getDay();let add=(5-dow+7)%7;if(dow===6)add=-1;if(dow===0)add=-2;const fri=new Date(d);fri.setDate(d.getDate()+add);const sun=new Date(fri);sun.setDate(fri.getDate()+2);return[ymd(fri),ymd(sun)]}
function within30(e){const end=new Date(TODAY+'T12:00:00');end.setDate(end.getDate()+30);return e.start<=ymd(end)&&e.end>=TODAY}
function isToday(e){return e.start<=TODAY&&e.end>=TODAY}
function tomorrow(){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()+1);return ymd(d)}
function dateLabel(e){if(isToday(e))return '🔥 Heute';if(e.start===tomorrow())return '🌤️ Morgen';const [fri,sun]=thisWeekend();if(overlaps(e,fri,sun))return '🗓️ Dieses Wochenende';return e.date||e.start||''}
function slugify(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function eventId(e){return slugify(`${e.title}-${e.city}-${e.start}${e.locality_id?`-${e.time||''}`:''}`)}
function eventUrl(e){return `event.html?id=${encodeURIComponent(eventId(e))}`}
function esc(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]))}
function normalizeText(s){return String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim()}
function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value}
function getFavs(){try{const v=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function eventPrice(e){if(e.price)return e.price;if((e.cats||[]).includes('Gratis'))return 'Gratis';return 'Preis siehe Quelle'}
function resetEmptyCopy(){if(!empty)return;const h=empty.querySelector('h3'),p=empty.querySelector('p');if(h)h.textContent='Nichts gefunden';if(p)p.textContent='Ändere Ort, Zeitraum oder Kategorie.'}
function matchesSearch(e,term){
  const tokens=normalizeText(term).split(/\s+/).filter(Boolean);
  if(!tokens.length)return true;
  const hay=normalizeText([e.title,e.city,e.region,e.venue,e.location,e.desc,(e.cats||[]).join(' '),e.date,e.time].filter(Boolean).join(' '));
  return tokens.every(token=>hay.includes(token));
}

function refreshPlaces(){
  if(!place)return;
  const current=place.value,areaValue=area?.value||'';
  const canton=window.WGH_CANTON_BY_REGION?.[areaValue];
  const activeLocalityIds=new Set(DATA.filter(e=>e.end>=TODAY&&e.source).map(e=>window.WGH_EVENT_LOCALITY?.(e)?.id).filter(Boolean));
  const localities=canton?(window.WGH_LOCALITIES_BY_CANTON?.[canton.code]||[]).filter(l=>activeLocalityIds.has(l.id)):[];
  place.innerHTML='<option value="">Alle Orte</option>';
  if(localities.length){
    localities.slice().sort((a,b)=>a.name.localeCompare(b.name,'de')).forEach(l=>{const o=document.createElement('option');o.value=`locality:${l.id}`;o.textContent=`${l.name} · ${l.postalCodes.join(', ')}`;place.appendChild(o)});
    if([...place.options].some(o=>o.value===current))place.value=current;
    return;
  }
  const vals=[...new Set(DATA.filter(e=>!areaValue||e.region===areaValue).map(e=>e.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  vals.forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;place.appendChild(o)});
  if(vals.includes(current))place.value=current;
}

function card(e){
  const cats=Array.isArray(e.cats)?e.cats:[],id=eventId(e),distance=distances[id];
  const price=eventPrice(e),ticket=e.ticket?'🎟 Tickets':'ℹ Infos',label=dateLabel(e);
  const distanceHtml=Number.isFinite(distance)?`<span class="distance-chip">⌖ ${distance.toFixed(1)} km entfernt</span>`:'';
  return `<article class="card" data-event-id="${esc(id)}"><div class="card-visual"><span class="date-badge ${isToday(e)?'today':''}">${esc(label)}</span><span class="place-badge">📍 ${esc(e.city||'Ort offen')}</span><span class="emoji">${esc(e.emoji||'📅')}</span></div><div class="card-body"><div class="verify-line"><span class="verified">✓ geprüft</span><span class="source-type">${esc(e.source_type||'Quelle geprüft')}</span></div><div class="catline">${esc(cats.slice(0,3).join(' · '))}</div><h3><a href="${eventUrl(e)}">${esc(e.title||'Event')}</a></h3><p class="desc">${esc(e.desc||'')}</p><div class="event-facts"><span>📅 ${esc(e.date||e.start||'')}</span><span>📍 ${esc(e.city||'')}</span><span class="price-chip ${price==='Gratis'?'is-free':''}">💳 ${esc(price)}</span><span class="ticket-chip ${e.ticket?'has-ticket':''}">${ticket}</span>${distanceHtml}</div><div class="card-foot"><span class="time">🕒 ${esc(e.time||'Zeit siehe Quelle')}</span><span class="card-actions"><a class="source" href="${eventUrl(e)}">Details</a>${e.source?`<a class="source" href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">Quelle ↗</a>`:''}</span></div></div></article>`;
}
function topCard(e,badge){return `<article class="top-card" data-event-id="${esc(eventId(e))}"><div class="top-badge">${esc(badge)}</div><div class="top-emoji">${esc(e.emoji||'📅')}</div><div class="top-copy"><small>📍 ${esc(e.city||'')} · ${esc(e.date||e.start||'')}</small><h3><a href="${eventUrl(e)}">${esc(e.title||'Event')}</a></h3><p>${esc(e.desc||'')}</p><a class="top-link" href="${eventUrl(e)}">Ansehen →</a></div></article>`}
function renderHighlights(){
  if(!topGrid)return;
  const future=DATA.filter(e=>e.end>=TODAY).sort((a,b)=>String(a.start).localeCompare(String(b.start))),[fri,sun]=thisWeekend();
  let picks=future.filter(e=>overlaps(e,fri,sun)).slice(0,3),weekend=true;
  if(!picks.length){picks=future.slice(0,3);weekend=false}
  topGrid.innerHTML=picks.map((e,i)=>topCard(e,i===0?(weekend?'Wochenend-Tipp':'Nächster Tipp'):'Empfohlen')).join('');
  const h=document.getElementById('highlightText');if(h)h.textContent=picks.length?(weekend?'Events für dieses Wochenende.':'Die nächsten kommenden Events.'):'Aktuell keine kommenden Events.';
}

function syncActiveControls(){
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===activeCategory));
  document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('active',b.dataset.period===activePeriod));
  document.querySelectorAll('[data-bottom]').forEach(b=>b.classList.toggle('active',!favoritesOnly&&b.dataset.bottom===activePeriod));
}
function syncSpecialUI(){
  if(favoritesModeBar)favoritesModeBar.hidden=!favoritesOnly;
  if(recommendedTitle)recommendedTitle.textContent=favoritesOnly?'Deine Favoriten':distanceMode?'Events in deiner Nähe':'Für dich empfohlen';
  setText('favoriteCount',getFavs().length);
}
function currentFilteredEvents(){
  const term=(q?.value||'').trim(),weekend=thisWeekend(),areaValue=area?.value||'',placeValue=place?.value||'',favSet=new Set(getFavs());
  let arr=DATA.filter(e=>{
    const cats=Array.isArray(e.cats)?e.cats:[];
    if(!e.start||!e.end||e.end<TODAY)return false;
    if(e.quality_status==='cancelled-warning')return false;
    if(favoritesOnly&&!favSet.has(eventId(e)))return false;
    if(activeCategory!=='Alle'&&!cats.includes(activeCategory))return false;
    if(areaValue&&e.region!==areaValue)return false;
    if(placeValue){
      if(placeValue.startsWith('locality:')){if(window.WGH_EVENT_LOCALITY?.(e)?.id!==placeValue.slice(9))return false}
      else if(placeValue.startsWith('municipality:')){if(window.WGH_EVENT_MUNICIPALITY?.(e)?.id!==placeValue.slice(13))return false}
      else if(e.city!==placeValue)return false;
    }
    if(!matchesSearch(e,term))return false;
    if(activePeriod==='today'&&!isToday(e))return false;
    if(activePeriod==='weekend'&&!overlaps(e,weekend[0],weekend[1]))return false;
    if(activePeriod==='30'&&!within30(e))return false;
    return true;
  });
  if(distanceMode){arr.sort((a,b)=>(distances[eventId(a)]??Infinity)-(distances[eventId(b)]??Infinity)||String(a.start).localeCompare(String(b.start)))}
  else if(sort?.value==='place')arr.sort((a,b)=>String(a.city||'').localeCompare(String(b.city||''),'de')||String(a.start).localeCompare(String(b.start)));
  else if(sort?.value==='category')arr.sort((a,b)=>String((a.cats||[])[0]||'').localeCompare(String((b.cats||[])[0]||''),'de')||String(a.start).localeCompare(String(b.start)));
  else arr.sort((a,b)=>String(a.start).localeCompare(String(b.start))||String(a.title||'').localeCompare(String(b.title||''),'de'));
  return arr;
}
function render(){
  if(!grid)return;
  resetEmptyCopy();syncSpecialUI();syncActiveControls();
  const arr=currentFilteredEvents(),shown=arr.slice(0,200),areaValue=area?.value||'',placeValue=place?.value||'';
  grid.innerHTML=shown.map(card).join('');
  if(empty){
    empty.style.display=arr.length?'none':'block';
    if(favoritesOnly&&!arr.length){const h=empty.querySelector('h3'),p=empty.querySelector('p');if(h)h.textContent='Keine Favoriten gespeichert';if(p)p.textContent='Tippe bei einem Event auf 🤍, um ihn zu speichern.'}
    else if(placeValue&&!arr.length){const municipality=placeValue.startsWith('municipality:')?window.WGH_MUNICIPALITY_BY_ID?.[placeValue.slice(13)]:null,locality=placeValue.startsWith('locality:')?window.WGH_LOCALITY_BY_ID?.[placeValue.slice(9)]:null,h=empty.querySelector('h3'),p=empty.querySelector('p');if(h)h.textContent='Momentan keine bestätigten Events';if(p)p.textContent=(locality||municipality)?`${(locality||municipality).name} ist vollständig erfasst. Sobald ein geprüfter Event vorliegt, erscheint er hier.`:'Für diesen Ort wurde momentan kein bestätigter Event gefunden.'}
  }
  setText('visibleCount',arr.length);
  if(result){
    if(favoritesOnly)result.textContent=`${arr.length} Favorit${arr.length===1?'':'en'}`;
    else if(distanceMode)result.textContent=`${arr.length} nach Entfernung sortiert`;
    else result.textContent=`${arr.length} gefunden${arr.length>shown.length?` · erste ${shown.length} angezeigt`:''}${areaValue?' · '+areaValue:''}`;
  }
  window.dispatchEvent(new CustomEvent('wgh:render',{detail:{count:arr.length,favoritesOnly,distanceMode}}));
}

function leaveFavorites(){favoritesOnly=false}
function setCategory(cat){activeCategory=cat;leaveFavorites();render()}
function setPeriod(p){activePeriod=p;leaveFavorites();render()}
function resetFiltersOnly(){
  if(q)q.value='';if(area)area.value='';if(place)place.value='';if(sort)sort.value='date';
  activeCategory='Alle';activePeriod='all';refreshPlaces();
}
function resetAll(){resetFiltersOnly();favoritesOnly=false;distanceMode=false;distances={};render()}
function showFavorites(){resetFiltersOnly();favoritesOnly=true;distanceMode=false;render();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'})}
function showAllEvents(){favoritesOnly=false;distanceMode=false;render();document.getElementById('events')?.scrollIntoView({behavior:'smooth',block:'start'})}
function setDistances(next){distances=next&&typeof next==='object'?next:{};distanceMode=true;favoritesOnly=false;render()}
function favoriteStateChanged(){setText('favoriteCount',getFavs().length);if(favoritesOnly)render()}

const catWrap=document.getElementById('categoryButtons');
if(catWrap&&mobileFilters)topCats.forEach(cat=>{
  const count=cat==='Alle'?DATA.filter(e=>e.end>=TODAY).length:DATA.filter(e=>e.end>=TODAY&&(e.cats||[]).includes(cat)).length;
  const b=document.createElement('button');b.type='button';b.className='side-btn'+(cat==='Alle'?' active':'');b.dataset.cat=cat;b.innerHTML=`<span>${categoryEmoji[cat]||'•'} ${cat}</span><small>${count}</small>`;b.onclick=()=>setCategory(cat);catWrap.appendChild(b);
  const mb=document.createElement('button');mb.type='button';mb.className='mobile-chip'+(cat==='Alle'?' active':'');mb.dataset.cat=cat;mb.textContent=`${categoryEmoji[cat]||'•'} ${cat}`;mb.onclick=()=>setCategory(cat);mobileFilters.appendChild(mb)
});

document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.period));
document.querySelectorAll('[data-bottom]').forEach(b=>b.onclick=()=>setPeriod(b.dataset.bottom));
document.getElementById('resetTop')?.addEventListener('click',resetAll);
document.getElementById('clearSide')?.addEventListener('click',resetAll);
document.getElementById('favoritesBtn')?.addEventListener('click',showFavorites);
document.getElementById('showAllEventsBtn')?.addEventListener('click',showAllEvents);
q?.addEventListener('input',()=>{leaveFavorites();render()});
area?.addEventListener('change',()=>{leaveFavorites();refreshPlaces();render()});
place?.addEventListener('change',()=>{leaveFavorites();render()});
sort?.addEventListener('change',()=>{leaveFavorites();distanceMode=false;render()});
document.getElementById('gridBtn')?.addEventListener('click',()=>{grid?.classList.remove('list-view');document.getElementById('gridBtn')?.classList.add('active');document.getElementById('listBtn')?.classList.remove('active')});
document.getElementById('listBtn')?.addEventListener('click',()=>{grid?.classList.add('list-view');document.getElementById('listBtn')?.classList.add('active');document.getElementById('gridBtn')?.classList.remove('active')});

const future=DATA.filter(e=>e.end>=TODAY&&e.quality_status!=='cancelled-warning');setText('total',future.length);setText('places',new Set(future.map(e=>e.city).filter(Boolean)).size);setText('categories',new Set(future.flatMap(e=>e.cats||[])).size);setText('lastUpdated',new Intl.DateTimeFormat('de-CH',{dateStyle:'medium',timeZone:'Europe/Zurich'}).format(new Date()));
function updateGlobalCounter(){
  const el=document.getElementById('globalViewCount');if(!el)return;
  const row=el.closest('.stats-row');if(row&&getComputedStyle(row).display==='none')return;
  fetch('https://counterapi.com/api/wasgehtheute.ch/view/homepage',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('counter');return r.json()}).then(data=>{const value=data.value??'–';el.textContent=Number.isFinite(Number(value))?Number(value).toLocaleString('de-CH'):value}).catch(()=>{el.textContent='–';el.title='Zähler momentan nicht erreichbar'});
}
if('requestIdleCallback' in window)requestIdleCallback(updateGlobalCounter,{timeout:3000});else setTimeout(updateGlobalCounter,1200);

const modal=document.getElementById('actionModal');
function openAction(type){if(!modal)return;const typeSelect=document.getElementById('requestType');if(typeSelect)typeSelect.value=type;const title=document.getElementById('actionTitle');if(title)title.textContent=type==='Event melden'?'Event melden':'Werbeanzeige anfragen';const msg=document.getElementById('demoMsg');if(msg)msg.style.display='none';modal.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>document.getElementById('formName')?.focus(),80)}
function closeAction(){if(!modal)return;modal.classList.remove('open');document.body.style.overflow=''}
document.getElementById('reportEventBtn')?.addEventListener('click',()=>openAction('Event melden'));
document.getElementById('advertBtn')?.addEventListener('click',()=>openAction('Werbeanzeige anfragen'));
document.querySelectorAll('.adRequestBtn').forEach(b=>b.addEventListener('click',()=>openAction('Werbeanzeige anfragen')));
document.getElementById('actionClose')?.addEventListener('click',closeAction);
modal?.addEventListener('click',e=>{if(e.target===modal)closeAction()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeAction()});

let deferredPrompt=null;const installButtons=[document.getElementById('installPwaBtn'),document.getElementById('installPwaBtnBottom')];
function setInstallVisible(show){installButtons.forEach(b=>{if(b)b.hidden=!show})}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;setInstallVisible(true)});
installButtons.forEach(b=>b?.addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;setInstallVisible(false)}else alert('Auf iPhone/iPad: Teilen → „Zum Home-Bildschirm“. Auf Android/Chrome findest du „App installieren“ meist im Browser-Menü.')}));
window.addEventListener('appinstalled',()=>setInstallVisible(false));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

window.WGH_APP={render,showFavorites,showAllEvents,setDistances,resetAll,eventId,eventUrl,isFavoritesMode:()=>favoritesOnly,favoriteStateChanged,getVisibleEvents:currentFilteredEvents};
const queryTerm=new URLSearchParams(location.search).get('q');if(queryTerm&&q)q.value=queryTerm;
refreshPlaces();renderHighlights();render();
