import fs from 'node:fs';
import vm from 'node:vm';

const inputPath=process.argv[2]||'/tmp/localcities-first-page.json';
const outputPath=process.argv[3]||'events-localcities.js';
const maxPerLocality=Math.max(1,Number(process.argv[4])||3);
const todayParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const todayPart=type=>todayParts.find(part=>part.type===type)?.value;
const today=`${todayPart('year')}-${todayPart('month')}-${todayPart('day')}`,verifiedAt=`${todayPart('day')}.${todayPart('month')}.${todayPart('year')}`;
const root=new URL('../',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const sandbox={window:{},document:{getElementById(){return null}},console};sandbox.window.window=sandbox.window;
const context=vm.createContext(sandbox);
for(const file of ['cantons.js','municipalities-2026.js','localities-2026.js'])vm.runInContext(read(file),context,{filename:file});
for(const file of ['events-1.js','events-2.js','events-3.js','events-nightlife.js','events-nightlife-extra.js','events-update-2026-08-24.js','events-cantons-2026-08-25.js','events-switzerland-2026-08-25.js','events-sargans-mels.js'])vm.runInContext(read(file),context,{filename:file});

const {pages}=JSON.parse(fs.readFileSync(inputPath,'utf8'));
const localities=sandbox.window.WGH_LOCALITIES,cantons=sandbox.window.WGH_CANTON_BY_CODE;
const norm=sandbox.window.WGH_NORMALIZE_PLACE;
const localitiesByPostal=new Map();
for(const locality of localities)for(const postalCode of locality.postalCodes){
  const matches=localitiesByPostal.get(postalCode)||[];matches.push(locality);localitiesByPostal.set(postalCode,matches);
}
const localityForVenue=(postalCode,venue)=>{
  const matches=localitiesByPostal.get(postalCode)||[];if(matches.length===1)return matches[0];
  const normalizedVenue=` ${norm(venue)} `;
  const named=matches.filter(locality=>{
    const full=norm(locality.name),withoutCanton=full.replace(/ (ag|ai|ar|be|bl|bs|fr|ge|gl|gr|ju|lu|ne|nw|ow|sg|sh|so|sz|tg|ti|ur|vd|vs|zg|zh)$/,'');
    return normalizedVenue.includes(` ${full} `)||(withoutCanton!==full&&normalizedVenue.includes(` ${withoutCanton} `));
  });
  return named.length===1?named[0]:null;
};
const existing=new Set((sandbox.window.EVENTS||[]).map(e=>`${norm(e.title)}|${norm(e.city)}|${e.start}`));
const emojiFor=cats=>cats.includes('Markt')?'🛍️':cats.includes('Musik')?'🎵':cats.includes('Dorffest')?'🎉':cats.includes('Sport')?'🏅':cats.includes('Familie')?'👨‍👩‍👧':cats.includes('Food')?'🍴':cats.includes('Party')?'🪩':cats.includes('Kultur')?'🎭':'📅';
const categories=title=>{
  const t=norm(title),cats=[];
  if(/markt|messe|borse|börse|flohmarkt|marche|foire|mercato/.test(t))cats.push('Markt');
  if(/konzert|musik|musique|musica|jazz|chor|choeur|coro|orchester|orchestre|festival/.test(t))cats.push('Musik');
  if(/fest|fete|festa|sagra|chilbi|kilbi|jahrmarkt|kirmes|kerwa|carnaval/.test(t))cats.push('Dorffest');
  if(/sport|lauf|rennen|turnier|bike|fussball|fußball|wander/.test(t))cats.push('Sport');
  if(/kinder|familie|famille|famiglia|enfant|bambin|spiel|märchen|maerchen/.test(t))cats.push('Familie');
  if(/food|genuss|essen|brunch|wein|raclette|kulinar/.test(t))cats.push('Food');
  if(/party|club|disco|dj|night/.test(t))cats.push('Party');
  if(/theater|theatre|museum|musee|museo|ausstellung|exposition|mostra|führung|fuehrung|visite|kunst|\bart\b|lesung|kino|cinema/.test(t))cats.push('Kultur');
  return cats.length?[...new Set(cats)]:['Gemeinde'];
};
const candidates=[],mapping={missingDate:0,past:0,missingPostal:0,unmappedPostal:0,ambiguousPostal:0};
for(const page of pages||[])for(const item of page.events||[]){
  const date=item.eventDateTime?.match(/(\d{2})\.(\d{2})\.(\d{4})/);if(!date){mapping.missingDate++;continue}
  const start=`${date[3]}-${date[2]}-${date[1]}`;if(start<today){mapping.past++;continue}
  const postalCode=item.venue?.match(/\b([1-9]\d{3})\b/)?.[1];if(!postalCode){mapping.missingPostal++;continue}
  const locality=localityForVenue(postalCode,item.venue);if(!locality){if(localitiesByPostal.has(postalCode))mapping.ambiguousPostal++;else mapping.unmappedPostal++;continue}
  const canton=cantons[locality.canton];if(!canton)continue;
  const times=item.eventDateTime.match(/(\d{2}:\d{2})(?:\s*-\s*(\d{2}:\d{2}))?/),cats=categories(item.title);
  const key=`${norm(item.title)}|${norm(locality.name)}|${start}`;if(existing.has(key))continue;
  candidates.push({title:item.title,city:locality.name,region:canton.region,start,end:start,date:`${date[1]}.${date[2]}.${date[3]}`,time:times?(times[2]?`${times[1]}–${times[2]}`:times[1]):'Zeit siehe Quelle',cats,emoji:emojiFor(cats),desc:`Öffentlicher Termin in ${locality.name}${item.venue?` · ${item.venue}`:''}.`,venue:item.venue||'',source:item.href,verified:true,verified_at:verifiedAt,source_type:'Öffentlicher Veranstaltungskalender',localityId:locality.id});
}
candidates.sort((a,b)=>a.start.localeCompare(b.start)||a.time.localeCompare(b.time)||a.title.localeCompare(b.title,'de'));
const selected=[],seen=new Set(),perLocality=new Map();
for(const event of candidates){const key=`${norm(event.title)}|${event.localityId}|${event.start}|${event.time}`;if(seen.has(key))continue;seen.add(key);const count=perLocality.get(event.localityId)||0;if(count>=maxPerLocality)continue;perLocality.set(event.localityId,count+1);event.locality_id=event.localityId;delete event.localityId;selected.push(event)}
fs.writeFileSync(outputPath,`/* Public municipality calendars checked ${verifiedAt}. Source links on every event. */\nwindow.EVENTS=(window.EVENTS||[]).concat(${JSON.stringify(selected)});\n`);
console.log(JSON.stringify({captured:candidates.length,selected:selected.length,localitiesWithEvents:perLocality.size,maxPerLocality,mapping,outputPath},null,2));
