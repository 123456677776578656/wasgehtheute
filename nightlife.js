(()=>{
const DATA=Array.isArray(window.EVENTS)?window.EVENTS:[],U=window.WGH_EVENT_UTILS||{};
const root=document.getElementById('nightlifeEvents'),countEl=document.getElementById('nightlifeCount'),summary=document.getElementById('nightlifeSummary');if(!root)return;

const eventCardStyle=document.createElement('style');
eventCardStyle.textContent=`
[data-event-url]{cursor:pointer;touch-action:manipulation;position:relative;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}
[data-event-url]:hover{transform:translateY(-4px);border-color:rgba(236,59,147,.48)!important;box-shadow:0 20px 46px rgba(0,0,0,.32),0 0 0 1px rgba(236,59,147,.12)}
[data-event-url]:active{transform:scale(.985)}
[data-event-url]:focus-visible{outline:3px solid #ec3b93!important;outline-offset:4px}
[data-event-url] a:focus-visible,[data-event-url] button:focus-visible{outline:2px solid #f472b6;outline-offset:2px}
[data-event-url] .event-open-btn,[data-event-url] .night-actions .primary,[data-event-url] > .smart-open-link{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:11px!important;background:linear-gradient(135deg,#ec3b93,#8b5cf6)!important;color:#fff!important;font-weight:950!important;text-decoration:none!important;box-shadow:0 8px 20px rgba(139,92,246,.2)}
[data-event-url] .event-open-btn:hover,[data-event-url] .night-actions .primary:hover,[data-event-url] > .smart-open-link:hover{filter:brightness(1.12);transform:translateY(-1px)}
@media(max-width:820px){[data-event-url]{-webkit-tap-highlight-color:rgba(236,59,147,.18)}[data-event-url] .event-open-btn,[data-event-url] .night-actions .primary,[data-event-url] > .smart-open-link{width:100%;min-height:50px;font-size:12px!important}}
@media(prefers-reduced-motion:reduce){[data-event-url]{transition:none}[data-event-url]:hover,[data-event-url]:active{transform:none}}
`;
document.head.appendChild(eventCardStyle);

const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function weekend(){const d=new Date(today+'T12:00:00'),dow=d.getDay();let add=(5-dow+7)%7;if(dow===6)add=-1;if(dow===0)add=-2;const f=new Date(d);f.setDate(d.getDate()+add);const s=new Date(f);s.setDate(f.getDate()+2);return[ymd(f),ymd(s)]}
function nextWeek(){const d=new Date(today+'T12:00:00'),dow=(d.getDay()+6)%7;const mon=new Date(d);mon.setDate(d.getDate()-dow+7);const sun=new Date(mon);sun.setDate(mon.getDate()+6);return[ymd(mon),ymd(sun)]}
function nextWeekday(day){const d=new Date(today+'T12:00:00'),cur=d.getDay();let add=(day-cur+7)%7;if(add===0)add=7;d.setDate(d.getDate()+add);return ymd(d)}
function eventId(e){return U.id?.(e)||String(`${e.title}-${e.city}-${e.start}`).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function officialEnough(e){const rank=U.sourceRank?.(e)||0;const t=(U.normText?.(e.source_type)||String(e.source_type||'').toLowerCase());return rank>=3||/offiziell|official|venue|club|bar/.test(t)}
function isNightlife(e){const text=(U.normText?.([e.title,e.venue,e.desc,(e.cats||[]).join(' ')].join(' '))||'');return (e.cats||[]).some(c=>['Bar','Club','Party','Musik','Festival'].includes(c))||/club|bar|pub|dj|techno|house|hip hop|rock|disco|nightlife|party/.test(text)}
const base=DATA.filter(e=>e.end>=today&&e.quality_status!=='cancelled-warning'&&e.status!=='cancelled'&&isNightlife(e)&&officialEnough(e));
let period='all',genre='all';
const genreMatchers={
 'Club':e=>(e.cats||[]).includes('Club')||/club|disco/.test(U.normText?.([e.title,e.venue,e.desc].join(' '))||''),
 'Bar':e=>(e.cats||[]).includes('Bar')||/bar|lounge/.test(U.normText?.([e.title,e.venue,e.desc].join(' '))||''),
 'Pub':e=>/pub/.test(U.normText?.([e.title,e.venue,e.desc].join(' '))||''),
 'Live-Musik':e=>(e.cats||[]).includes('Musik')||/live|konzert|concert/.test(U.normText?.([e.title,e.desc].join(' '))||''),
 'DJ':e=>/dj|deejay/.test(U.normText?.([e.title,e.desc].join(' '))||''),
 'Techno':e=>/techno/.test(U.normText?.([e.title,e.desc,(e.cats||[]).join(' ')].join(' '))||''),
 'House':e=>/house/.test(U.normText?.([e.title,e.desc,(e.cats||[]).join(' ')].join(' '))||''),
 'Hip-Hop':e=>/hip hop|hiphop|rap/.test(U.normText?.([e.title,e.desc,(e.cats||[]).join(' ')].join(' '))||''),
 'Rock':e=>/rock/.test(U.normText?.([e.title,e.desc,(e.cats||[]).join(' ')].join(' '))||''),
 '90er / 2000er':e=>/90er|90s|2000er|2000s|millennium/.test(U.normText?.([e.title,e.desc].join(' '))||''),
 '30+':e=>/30\+|ue30|ü30|over 30/.test(String([e.title,e.desc].join(' ')).toLowerCase()),
 'Gratis':e=>(e.cats||[]).includes('Gratis')||/gratis|kostenlos|free entry/.test(U.normText?.([e.price,e.desc].join(' '))||'')
};
function dateMatches(e){if(period==='all')return true;if(period==='today')return e.start<=today&&e.end>=today;if(period==='tonight'){if(!(e.start<=today&&e.end>=today))return false;const m=String(e.time||'').match(/(?:^|\D)([01]?\d|2[0-3])[:.]/);return m?Number(m[1])>=17:true}const [fri,sun]=weekend();if(period==='friday')return e.start<=fri&&e.end>=fri;if(period==='saturday'){const s=new Date(fri+'T12:00:00');s.setDate(s.getDate()+1);const sat=ymd(s);return e.start<=sat&&e.end>=sat}if(period==='weekend')return e.start<=sun&&e.end>=fri;if(period==='nextweek'){const [a,b]=nextWeek();return e.start<=b&&e.end>=a}return true}
function statusBadge(e){if(!e.status||e.status==='confirmed')return'';const icon=e.status==='sold-out'?'⚠️':e.status==='postponed'?'↪️':'ℹ️';return `<span>${icon} ${safe(e.status_label||e.status)}</span>`}
function card(e){const checked=(U.checkedAt?.(e)||e.checked_at||e.verified_at||'').split('-').reverse().join('.');const cats=(e.cats||[]).slice(0,4);const venue=e.venue||e.location||e.city;const price=e.price||((e.cats||[]).includes('Gratis')?'Gratis':'');return `<article class="night-card" data-event-url="event.html?id=${encodeURIComponent(eventId(e))}" tabindex="0" role="link" aria-label="Event öffnen: ${safe(e.title||'Event')}"><div class="night-kicker"><span>${safe(e.city)}</span><span>${safe(e.date||e.start)}</span></div><h2><a href="event.html?id=${encodeURIComponent(eventId(e))}">${safe(e.title)}</a></h2><div class="night-main"><b>${safe(venue)}</b><span>🕒 ${safe(e.time||'Beginn siehe Quelle')}</span></div><div class="night-tags">${cats.map(c=>`<span>${safe(c)}</span>`).join('')}${price?`<span>💳 ${safe(price)}</span>`:''}${statusBadge(e)}</div><div class="night-verify"><b>✓ Quelle geprüft</b>${checked?` · zuletzt ${safe(checked)}`:''} · ${safe(e.source_type||'geprüfte Quelle')}</div><div class="night-actions"><a class="primary event-open-btn" href="event.html?id=${encodeURIComponent(eventId(e))}">Event ansehen →</a>${e.ticket?`<a href="${safe(e.ticket)}" target="_blank" rel="noopener noreferrer">🎟 Tickets</a>`:''}<a href="${safe(e.source)}" target="_blank" rel="noopener noreferrer">Quelle ↗</a></div></article>`}
function render(){let arr=base.filter(dateMatches);if(genre!=='all'&&genreMatchers[genre])arr=arr.filter(genreMatchers[genre]);arr.sort((a,b)=>String(a.start).localeCompare(String(b.start))||String(a.time||'99:99').localeCompare(String(b.time||'99:99')));root.innerHTML=arr.length?arr.map(card).join(''):'<div class="night-empty">Für diese Auswahl sind aktuell keine bestätigten Nightlife-Events eingetragen.</div>';if(countEl)countEl.textContent=arr.length;if(summary)summary.innerHTML=`<span><strong>${arr.length}</strong> bestätigte Nightlife-Events</span><span>Nur offizielle bzw. direkte Venue-Quellen</span>`;document.querySelectorAll('[data-night-period]').forEach(b=>b.classList.toggle('active',b.dataset.nightPeriod===period));document.querySelectorAll('[data-night-genre]').forEach(b=>b.classList.toggle('active',b.dataset.nightGenre===genre))}

function openEventCard(evt){
  const card=evt.target.closest?.('[data-event-url]');
  if(!card||evt.target.closest('a,button,input,select,textarea,label'))return;
  window.location.href=card.dataset.eventUrl;
}
document.addEventListener('click',openEventCard);
document.addEventListener('keydown',evt=>{
  const card=evt.target.closest?.('[data-event-url]');
  if(!card||evt.target!==card||!['Enter',' '].includes(evt.key))return;
  evt.preventDefault();
  window.location.href=card.dataset.eventUrl;
});

document.addEventListener('click',e=>{const p=e.target.closest('[data-night-period]');if(p){period=p.dataset.nightPeriod;render();return}const g=e.target.closest('[data-night-genre]');if(g){genre=g.dataset.nightGenre;render()}});render();
})();
