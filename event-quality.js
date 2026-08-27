(()=>{
const health=window.WGH_EVENT_HEALTH||{events:{},duplicates:[]};
const rows=Array.isArray(window.EVENTS)?window.EVENTS.filter(Boolean):[];
const normText=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();
const slug=s=>normText(s).replace(/\s+/g,'-');
const id=e=>slug(`${e?.title||''}-${e?.city||''}-${e?.start||''}`);
const sourceFingerprint=e=>String(e?.source||'').replace(/^https?:\/\//i,'').replace(/[?#].*$/,'').replace(/\/+$/,'');
const stableId=e=>{
  if(e?.uid||e?.event_id||e?.id)return slug(e.uid||e.event_id||e.id);
  const sourceKey=sourceFingerprint(e);
  return slug(`${e?.title||''}-${e?.city||''}-${sourceKey||e?.start||''}`);
};
const words=s=>normText(s).split(/\s+/).filter(Boolean);
const sourceRank=e=>{const t=normText(e?.source_type);if(/veranstalter|offizielle quelle|official/.test(t))return 5;if(/venue|club|bar|location/.test(t))return 4;if(/stadt|gemeinde|kommun/.test(t))return 3;if(/tourismus|tourism/.test(t))return 2;if(/regional|kalender/.test(t))return 1;return e?.source?1:0};
const completeness=e=>[e?.title,e?.city,e?.region,e?.start,e?.end,e?.time,e?.venue,e?.source,e?.desc].filter(Boolean).length+(e?.ticket?1:0)+(e?.price?1:0)+(e?.verified?2:0)+sourceRank(e)*2;
function titleSimilarity(a,b){const A=new Set(words(a).filter(x=>x.length>2)),B=new Set(words(b).filter(x=>x.length>2));if(!A.size||!B.size)return 0;let hit=0;A.forEach(x=>{if(B.has(x))hit++});return hit/Math.max(A.size,B.size)}
function editDistance(a,b){a=normText(a);b=normText(b);if(a===b)return 0;if(!a)return b.length;if(!b)return a.length;const prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1);for(let i=1;i<=a.length;i++){cur[0]=i;for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));for(let j=0;j<=b.length;j++)prev[j]=cur[j]}return prev[b.length]}
function tokenMatches(query,token){if(!query)return true;if(token.includes(query)||query.includes(token))return true;const max=query.length>=7?2:query.length>=4?1:0;return max>0&&editDistance(query,token)<=max}
function fuzzyMatch(e,query){const q=words(query);if(!q.length)return true;const hay=words([e?.title,e?.city,e?.region,e?.venue,e?.location,e?.desc,(e?.cats||[]).join(' '),e?.date,e?.time].filter(Boolean).join(' '));return q.every(part=>hay.some(token=>tokenMatches(part,token)))}
function checkedAt(e){const h=health.events?.[id(e)];return h?.source_ok===true&&h?.checked_at?h.checked_at:(e?.checked_at||e?.verified_at||'')}
function attemptedAt(e){const h=health.events?.[id(e)];return h?.attempted_at||health.attempted_at||''}
function explicitStatus(e){const s=normText(e?.status);if(/abgesagt|cancel/.test(s))return'cancelled';if(/verschoben|verlegt|postpon/.test(s))return'postponed';if(/ausverkauft|sold out/.test(s))return'sold-out';if(/termin geandert|termin geändert|zeit geandert|zeit geändert/.test(s))return'changed';return'confirmed'}
function statusInfo(e){const h=health.events?.[id(e)]||{};if(h.possible_cancelled||explicitStatus(e)==='cancelled')return{code:'cancelled',label:'Abgesagt',public:false};if(h.possible_changed||explicitStatus(e)==='postponed')return{code:'postponed',label:'Verschoben',public:true};if(explicitStatus(e)==='changed')return{code:'changed',label:'Termin geändert',public:true};if(h.possible_sold_out||explicitStatus(e)==='sold-out')return{code:'sold-out',label:'Ausverkauft',public:true};return{code:'confirmed',label:'Bestätigt',public:true}}
function normalise(e){const x={...e};x.title=String(x.title||'').trim();x.city=String(x.city||'').trim();x.region=String(x.region||'').trim();x.start=String(x.start||'').slice(0,10);x.end=String(x.end||x.start||'').slice(0,10);x.time=String(x.time||'').trim();x.venue=String(x.venue||x.location||'').trim();x.cats=Array.isArray(x.cats)?[...new Set(x.cats.filter(Boolean))]:[];const status=statusInfo(x);x.status=status.code;x.status_label=status.label;x.checked_at=checkedAt(x);x.check_attempted_at=attemptedAt(x);x.stable_id=stableId(x);const h=health.events?.[id(x)]||{};if(x.status==='cancelled'||h.possible_cancelled){x.quality_status='cancelled-warning';x.quality_note=h.reason||'Event ist als abgesagt markiert.'}else if(h.possible_changed||['changed','postponed'].includes(x.status)){x.quality_status='changed-warning';x.quality_note=h.reason||'Terminänderung erkannt – Originalquelle prüfen.'}else if(h.source_ok===false){x.quality_status='source-warning';x.quality_note=h.reason||'Quelle ist momentan nicht erreichbar.'}else if(h.source_ok===true){x.quality_status='source-ok'}return x}
const valid=rows.map(normalise).filter(e=>e.title&&e.city&&/^\d{4}-\d{2}-\d{2}$/.test(e.start)&&/^\d{4}-\d{2}-\d{2}$/.test(e.end)&&e.end>=e.start);
const clean=[];const fuzzyDuplicates=[];
for(const e of valid){let idx=-1;for(let i=0;i<clean.length;i++){const p=clean[i];if(normText(p.city)!==normText(e.city)||p.start!==e.start)continue;if(id(p)===id(e)||titleSimilarity(p.title,e.title)>=.82){idx=i;break}}if(idx<0){clean.push(e);continue}const prev=clean[idx];fuzzyDuplicates.push({kept:completeness(e)>completeness(prev)?id(e):id(prev),other:completeness(e)>completeness(prev)?id(prev):id(e),city:e.city,start:e.start});if(completeness(e)>completeness(prev))clean[idx]=e}
const metrics={total:clean.length,withSource:clean.filter(e=>e.source).length,withOfficialSource:clean.filter(e=>sourceRank(e)>=3).length,withVenue:clean.filter(e=>e.venue).length,withTicket:clean.filter(e=>e.ticket).length,withPrice:clean.filter(e=>e.price||(e.cats||[]).includes('Gratis')).length,confirmed:clean.filter(e=>e.status==='confirmed').length,cancelled:clean.filter(e=>e.status==='cancelled').length,changed:clean.filter(e=>['changed','postponed'].includes(e.status)).length,soldOut:clean.filter(e=>e.status==='sold-out').length};
window.EVENTS=clean;
window.WGH_EVENT_UTILS={normText,slug,id,stableId,fuzzyMatch,checkedAt,attemptedAt,statusInfo,sourceRank,completeness,titleSimilarity};
window.WGH_EVENT_QUALITY={before:rows.length,after:clean.length,duplicatesRemoved:Math.max(0,rows.length-clean.length),fuzzyDuplicates,health,metrics};
})();
