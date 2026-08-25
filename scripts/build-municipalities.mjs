import fs from 'node:fs';

const sourcePath=process.argv[2];
const outputPath=process.argv[3]||'municipalities-2026.js';
if(!sourcePath)throw new Error('Usage: node scripts/build-municipalities.mjs <bfs-html> [output-js]');

const cantonCodes={1:'zh',2:'be',3:'lu',4:'ur',5:'sz',6:'ow',7:'nw',8:'gl',9:'zg',10:'fr',11:'so',12:'bs',13:'bl',14:'sh',15:'ar',16:'ai',17:'sg',18:'gr',19:'ag',20:'tg',21:'ti',22:'vd',23:'vs',24:'ne',25:'ge',26:'ju'};
const decode=s=>s.replace(/<[^>]+>/g,'').replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
const lv95ToWgs84=(east,north)=>{
  const y=(east-2600000)/1000000,x=(north-1200000)/1000000;
  const lon=(2.6779094+4.728982*y+0.791484*y*x+0.1306*y*x*x-0.0436*y*y*y)*100/36;
  const lat=(16.9023892+3.238272*x-0.270978*y*y-0.002528*x*x-0.0447*y*y*x-0.014*x*x*x)*100/36;
  return [Number(lat.toFixed(5)),Number(lon.toFixed(5))];
};

const html=fs.readFileSync(sourcePath,'utf8');
const municipalities=[];
for(const match of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)){
  const cells=[...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m=>decode(m[1]));
  if(cells.length!==10)continue;
  const bfs=Number(cells[1]),east=Number(cells[4]),north=Number(cells[5]),cantonNumber=Number(cells[6]);
  if(!Number.isInteger(bfs)||bfs>=9000||!cantonCodes[cantonNumber])continue;
  const [lat,lon]=lv95ToWgs84(east,north);
  municipalities.push({id:`ch-${bfs}`,bfs,name:cells[2],canton:cantonCodes[cantonNumber],country:'CH',lat,lon});
}

const liechtenstein=[
  ['balzers','Balzers',47.0661,9.5025],['triesen','Triesen',47.1074,9.5281],['triesenberg','Triesenberg',47.1184,9.5417],
  ['vaduz','Vaduz',47.1410,9.5209],['schaan','Schaan',47.1660,9.5100],['planken','Planken',47.1850,9.5436],
  ['eschen','Eschen',47.2107,9.5229],['gamprin','Gamprin',47.2203,9.5098],['mauren','Mauren',47.2180,9.5444],
  ['schellenberg','Schellenberg',47.2301,9.5465],['ruggell','Ruggell',47.2408,9.5247]
].map(([id,name,lat,lon])=>({id:`li-${id}`,name,canton:'fl',country:'LI',lat,lon}));

municipalities.push(...liechtenstein);
municipalities.sort((a,b)=>a.canton.localeCompare(b.canton)||a.name.localeCompare(b.name,'de'));
if(municipalities.filter(x=>x.country==='CH').length!==2113)throw new Error(`Expected 2113 Swiss municipalities, got ${municipalities.length-liechtenstein.length}`);

const payload=`/* Generated from the official BFS municipality register, snapshot 01.01.2026.\n   Source: https://www.agvchapp.bfs.admin.ch/de/kennzahlen/results?IncCentroid=True&SnapshotDate=01.01.2026&Unit=Communes\n   Liechtenstein municipality names: https://www.llv.li/de/landesverwaltung/fachstelle-oeffentliches-auftragswesen/bestimmungen-gemeinden/wer-sind-auftraggeber-gemeinden- */\n+(()=>{\n+const municipalities=${JSON.stringify(municipalities)};\n+const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss').replace(/[()]/g,' ').replace(/[^a-z0-9]+/g,' ').trim();\n+const aliases={\n+ sg:{'werdenberg':'grabs','werdenberg buchs':'buchs sg','unterwasser':'wildhaus alt st johann','unterwasser wildhaus':'wildhaus alt st johann','alt st johann':'wildhaus alt st johann','wildhaus':'wildhaus alt st johann','ennetbuhl':'nesslau','st peterzell':'neckertal','mogelsberg':'neckertal','gahwil':'kirchberg sg','bazenheid':'kirchberg sg'},\n+ zh:{'aathal seegraben':'seegraben','aeugstertal':'aeugst am albis'},\n+ tg:{'hagenwil':'amriswil','uesslingen':'uesslingen buch'},\n+ gr:{'feldis':'domleschg','fuldera':'val mustair','valchava':'val mustair','tarasp':'scuol','tschiertschen':'tschiertschen praden','waltensburg':'breil brigels'},\n+ ai:{'weissbad':'schwende rute'},\n+ gl:{'braunwald':'glarus sud','elm':'glarus sud','engi':'glarus sud','matt':'glarus sud','mitlodi':'glarus sud','schwanden':'glarus sud','nafels':'glarus nord','netstal':'glarus'},\n+ ti:{'tesserete':'capriasca'}\n+};\n+const byId=Object.fromEntries(municipalities.map(m=>[m.id,m]));\n+const byCanton=Object.fromEntries([...new Set(municipalities.map(m=>m.canton))].map(code=>[code,municipalities.filter(m=>m.canton===code)]));\n+const byKey=new Map(municipalities.map(m=>[m.canton+'|'+norm(m.name),m]));\n+function eventMunicipality(event){\n+ const canton=(window.WGH_CANTON_BY_REGION||{})[event?.region];if(!canton)return null;\n+ let key=norm(event?.city);key=aliases[canton.code]?.[key]||key;\n+ let found=byKey.get(canton.code+'|'+key);if(found)return found;\n+ const candidates=byCanton[canton.code]||[];\n+ return candidates.find(m=>{const mk=norm(m.name);return mk===key||mk.replace(/ (sg|zh|be|lu|ur|sz|ow|nw|gl|zg|fr|so|bs|bl|sh|ar|ai|gr|ag|tg|ti|vd|vs|ne|ge|ju)$/,'')===key})||null;\n+}\n+window.WGH_MUNICIPALITIES=municipalities;window.WGH_MUNICIPALITY_BY_ID=byId;window.WGH_MUNICIPALITIES_BY_CANTON=byCanton;window.WGH_NORMALIZE_PLACE=norm;window.WGH_EVENT_MUNICIPALITY=eventMunicipality;\n+})();\n`;
const correctedPayload=payload
  .replace("'mogelsberg':'neckertal','gahwil'","'mogelsberg':'neckertal','hemberg':'neckertal','gahwil'")
  .replace("'tschiertschen':'tschiertschen praden'","'tschiertschen':'chur'")
  .replace("+ ti:{'tesserete':'capriasca'}","+ ge:{'genf':'geneve'},\n+ ti:{'tesserete':'capriasca'}");
fs.writeFileSync(outputPath,correctedPayload.replace(/\n\+/g,'\n'));
console.log(`Wrote ${municipalities.length} municipalities to ${outputPath}`);
