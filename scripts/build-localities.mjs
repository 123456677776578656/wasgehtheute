import fs from 'node:fs';

const sourcePath=process.argv[2];
const outputPath=process.argv[3]||'localities-2026.js';
if(!sourcePath)throw new Error('Usage: node scripts/build-localities.mjs <swisstopo-csv> [output-js]');

const parseCsv=text=>{
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted;continue}
    if(c===';'&&!quoted){row.push(field);field='';continue}
    if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(Boolean))rows.push(row);row=[];continue}
    field+=c;
  }
  if(field||row.length){row.push(field);rows.push(row)}
  return rows;
};
const raw=fs.readFileSync(sourcePath,'utf8').replace(/^\uFEFF/,'');
const [headers,...records]=parseCsv(raw);
const ix=Object.fromEntries(headers.map((h,i)=>[h,i]));
const cantonCode=s=>s?String(s).toLowerCase():'fl';
const liMunicipalities={7001:'li-vaduz',7002:'li-triesen',7003:'li-balzers',7004:'li-triesenberg',7005:'li-schaan',7006:'li-planken',7007:'li-eschen',7008:'li-mauren',7009:'li-gamprin',7010:'li-ruggell',7011:'li-schellenberg'};
const groups=new Map();
for(const row of records){
  const name=row[ix.Ortschaftsname]?.trim(),canton=cantonCode(row[ix.Kantonskürzel]?.trim());
  if(!name||!canton)continue;
  const zipId=Number(row[ix.ZIP_ID]),key=String(zipId),bfs=Number(row[ix['BFS-Nr']]),share=Number(String(row[ix.Adressenanteil]||'0').replace('%','').trim())||0;
  const entry={name,canton,bfs,municipalityId:canton==='fl'?liMunicipalities[bfs]:`ch-${bfs}`,municipalityName:row[ix.Gemeindename]?.trim(),postalCode:row[ix.PLZ4]?.trim(),zipId,lon:Number(row[ix.E]),lat:Number(row[ix.N]),share};
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);
}
const localities=[];
for(const entries of groups.values()){
  entries.sort((a,b)=>b.share-a.share||a.zipId-b.zipId);
  const primary=entries[0],postalCodes=[...new Set(entries.map(x=>x.postalCode).filter(Boolean))].sort(),municipalityIds=[...new Set(entries.map(x=>x.municipalityId).filter(Boolean))];
  localities.push({id:`loc-${primary.canton}-${Math.min(...entries.map(x=>x.zipId))}`,name:primary.name,canton:primary.canton,municipalityId:primary.municipalityId,municipalityIds,postalCodes,lat:Number(primary.lat.toFixed(5)),lon:Number(primary.lon.toFixed(5))});
}
localities.sort((a,b)=>a.canton.localeCompare(b.canton)||a.name.localeCompare(b.name,'de'));
if(localities.length!==4073)throw new Error(`Expected 4073 official locality IDs, got ${localities.length}`);

const payload=`/* Generated from the official swisstopo directory of localities, release 01.08.2026.\n+   Source: https://www.swisstopo.admin.ch/de/amtliches-ortschaftenverzeichnis */\n+(()=>{\n+const localities=${JSON.stringify(localities)};\n+const norm=window.WGH_NORMALIZE_PLACE||((s)=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss').replace(/[()]/g,' ').replace(/[^a-z0-9]+/g,' ').trim());\n+const aliases={sg:{'buchs sg':'buchs sg','werdenberg buchs':'buchs sg','unterwasser wildhaus':'unterwasser'},zh:{'aathal seegraben':'aathal seegraben'},ge:{'genf':'geneve'}};\n+const byId=Object.fromEntries(localities.map(x=>[x.id,x]));\n+const byCanton=Object.fromEntries([...new Set(localities.map(x=>x.canton))].map(code=>[code,localities.filter(x=>x.canton===code)]));\n+const byMunicipality={};for(const locality of localities){for(const id of locality.municipalityIds||[locality.municipalityId]){(byMunicipality[id]||(byMunicipality[id]=[])).push(locality)}}\n+const byKey=new Map(localities.map(x=>[x.canton+'|'+norm(x.name),x]));\n+function eventLocality(event){const canton=(window.WGH_CANTON_BY_REGION||{})[event?.region];if(!canton)return null;let key=norm(event?.city);key=aliases[canton.code]?.[key]||key;return byKey.get(canton.code+'|'+key)||null}\n+window.WGH_LOCALITIES=localities;window.WGH_LOCALITY_BY_ID=byId;window.WGH_LOCALITIES_BY_CANTON=byCanton;window.WGH_LOCALITIES_BY_MUNICIPALITY=byMunicipality;window.WGH_EVENT_LOCALITY=eventLocality;\n+})();\n`;
const correctedPayload=payload
  .replace("'underwater wildhaus':'unterwasser'","'underwater wildhaus':'unterwasser'")
  .replace("'unterwasser wildhaus':'unterwasser'}","'unterwasser wildhaus':'unterwasser','st margrethen':'st margrethen sg','altstatten':'altstatten sg','oberriet':'oberriet sg','rapperswil jona':'rapperswil sg'}")
  .replace("zh:{'aathal seegraben':'aathal seegraben'}","zh:{'aathal seegraben':'aathal seegraben'},tg:{'hagenwil':'hagenwil b amriswil'},gr:{'feldis':'feldis veulden','waltensburg':'waltensburg vuorz','zillis reischen':'zillis'},gl:{'schwanden':'schwanden gl'},fr:{'romont':'romont fr'}");
fs.writeFileSync(outputPath,correctedPayload.replace(/\n\+/g,'\n'));
console.log(`Wrote ${localities.length} official localities to ${outputPath}`);
