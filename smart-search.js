(()=>{
const input=document.getElementById('q');
const area=document.getElementById('area');
const place=document.getElementById('place');
if(!input)return;
const places=['Buchs','Sargans','Mels','Haag','Grabs','Altstätten','Altstaetten','Wildhaus','St. Gallen','St Gallen','Chur','Zürich','Zurich','Winterthur','Uster','Arbon','Frauenfeld','Kreuzlingen','Wil','Rapperswil','Vaduz'];
const cats=[
  ['party','Party'],['partys','Party'],['nachtleben','Party'],['nightlife','Party'],['club','Club'],['clubs','Club'],['diskothek','Club'],['disco','Club'],['bar','Bar'],['bars','Bar'],['musik','Musik'],['konzert','Musik'],['konzerte','Musik'],['festival','Festival'],['festivals','Festival'],['markt','Markt'],['märkte','Markt'],['maerkte','Markt'],['dorffest','Dorffest'],['fest','Dorffest'],['sport','Sport'],['fussball','Sport'],['fußball','Sport'],['familie','Familie'],['kinder','Familie'],['food','Food'],['essen','Food'],['kultur','Kultur'],['theater','Kultur'],['gratis','Gratis'],['kostenlos','Gratis'],['outdoor','Outdoor'],['wandern','Outdoor']
];
const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();
let working=false;
function findPlace(tokens){
  const n=tokens.join(' ');
  return places.find(p=>{
    const np=norm(p);return np.includes(' ')?n.includes(np):tokens.includes(np);
  })||null;
}
function findCategory(tokens){
  for(const [term,cat] of cats){if(tokens.includes(norm(term)))return {term,cat}}
  return null;
}
function applySmartSearch(){
  if(working)return;working=true;
  try{
    const raw=input.value.trim(),tokens=norm(raw).split(/\s+/).filter(Boolean);
    if(!tokens.length){working=false;return}
    const foundPlace=findPlace(tokens),foundCat=findCategory(tokens);
    let leftovers=[...tokens];
    if(foundPlace){
      const np=norm(foundPlace).split(/\s+/);np.forEach(t=>{const i=leftovers.indexOf(t);if(i>=0)leftovers.splice(i,1)});
      if(place){const option=[...place.options].find(o=>norm(o.value||o.textContent)===norm(foundPlace));if(option){place.value=option.value;place.dispatchEvent(new Event('change',{bubbles:true}))}}
    }
    if(foundCat){const btn=document.querySelector(`[data-cat="${CSS.escape(foundCat.cat)}"]`);if(btn){btn.click()}leftovers=leftovers.filter(t=>t!==norm(foundCat.term))}
    const cleaned=leftovers.join(' ').trim();
    if(foundPlace||foundCat){
      if(input.value!==cleaned)input.value=cleaned;
    }
    let areaName='';
    if(foundPlace){
      const city=norm(foundPlace);
      if(['buchs','sargans','mels','haag','grabs','altstatten','wildhaus','st gallen','st gallen'].includes(city))areaName='Rheintal / Werdenberg / Sargans / Wildhaus';
      else if(['zuerich','winterthur','uster','rapperswil'].includes(city))areaName='Kanton Zürich';
      else if(city==='chur')areaName='Chur / Graubünden';
      else if(['arbon','frauenfeld','kreuzlingen'].includes(city))areaName='Kanton Thurgau';
      if(area&&areaName&&area.value!==areaName){area.value=areaName;area.dispatchEvent(new Event('change',{bubbles:true}))}
    }
  }finally{setTimeout(()=>{working=false},0)}
}
input.addEventListener('change',applySmartSearch);
input.addEventListener('keydown',e=>{if(e.key==='Enter')applySmartSearch()});
const examples=['Buchs Party','Sargans Musik','Mels Sport','Zürich Festival'];
input.addEventListener('focus',()=>{if(!input.value)input.placeholder='z. B. „Buchs Party“ oder „Mels Sport“'});
input.addEventListener('blur',()=>{if(!input.value)input.placeholder='Suche nach Events, Orten, Kategorien...'});
})();