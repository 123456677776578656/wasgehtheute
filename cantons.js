(()=>{
const cantons=[
{code:"sg",name:"St. Gallen",region:"Rheintal / Werdenberg / Sargans / Wildhaus",group:"Ostschweiz",lang:"Deutsch",phase:1},
{code:"zh",name:"Zürich",region:"Kanton Zürich",group:"Deutschschweiz",lang:"Deutsch",phase:2},
{code:"tg",name:"Thurgau",region:"Kanton Thurgau",group:"Ostschweiz",lang:"Deutsch",phase:2},
{code:"gr",name:"Graubünden",region:"Chur / Graubünden",group:"Ostschweiz",lang:"Deutsch · Rätoromanisch · Italienisch",phase:2},
{code:"ai",name:"Appenzell Innerrhoden",region:"Kanton Appenzell Innerrhoden",group:"Ostschweiz",lang:"Deutsch",phase:3},
{code:"ar",name:"Appenzell Ausserrhoden",region:"Kanton Appenzell Ausserrhoden",group:"Ostschweiz",lang:"Deutsch",phase:3},
{code:"sh",name:"Schaffhausen",region:"Kanton Schaffhausen",group:"Deutschschweiz",lang:"Deutsch",phase:3},
{code:"gl",name:"Glarus",region:"Kanton Glarus",group:"Ostschweiz",lang:"Deutsch",phase:3},
{code:"fl",name:"Liechtenstein",region:"Fürstentum Liechtenstein",group:"Ostschweiz",lang:"Deutsch",phase:3,country:"LI"},
{code:"ag",name:"Aargau",region:"Kanton Aargau",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"be",name:"Bern",region:"Kanton Bern",group:"Deutschschweiz",lang:"Deutsch · Französisch",phase:4},
{code:"bl",name:"Basel-Landschaft",region:"Kanton Basel-Landschaft",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"bs",name:"Basel-Stadt",region:"Kanton Basel-Stadt",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"lu",name:"Luzern",region:"Kanton Luzern",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"nw",name:"Nidwalden",region:"Kanton Nidwalden",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"ow",name:"Obwalden",region:"Kanton Obwalden",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"sz",name:"Schwyz",region:"Kanton Schwyz",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"so",name:"Solothurn",region:"Kanton Solothurn",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"ur",name:"Uri",region:"Kanton Uri",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"zg",name:"Zug",region:"Kanton Zug",group:"Deutschschweiz",lang:"Deutsch",phase:4},
{code:"fr",name:"Freiburg",region:"Kanton Freiburg",group:"Romandie",lang:"Französisch · Deutsch",phase:5},
{code:"ge",name:"Genf",region:"Kanton Genf",group:"Romandie",lang:"Französisch",phase:5},
{code:"ju",name:"Jura",region:"Kanton Jura",group:"Romandie",lang:"Französisch",phase:5},
{code:"ne",name:"Neuenburg",region:"Kanton Neuenburg",group:"Romandie",lang:"Französisch",phase:5},
{code:"ti",name:"Tessin",region:"Kanton Tessin",group:"Tessin",lang:"Italienisch",phase:5},
{code:"vd",name:"Waadt",region:"Kanton Waadt",group:"Romandie",lang:"Französisch",phase:5},
{code:"vs",name:"Wallis",region:"Kanton Wallis",group:"Romandie",lang:"Französisch · Deutsch",phase:5}
];
window.WGH_CANTONS=cantons;
window.WGH_CANTON_BY_CODE=Object.fromEntries(cantons.map(c=>[c.code,c]));
window.WGH_CANTON_BY_REGION=Object.fromEntries(cantons.map(c=>[c.region,c]));
for(const event of window.EVENTS||[]){const canton=window.WGH_CANTON_BY_REGION[event.region];if(canton&&!event.canton)event.canton=canton.code.toUpperCase()}
const select=document.getElementById("area");
if(select){
  const current=select.value;
  select.innerHTML='<option value="">Alle Kantone & Liechtenstein</option>';
  for(const group of ["Ostschweiz","Deutschschweiz","Romandie","Tessin"]){
    const optgroup=document.createElement("optgroup");optgroup.label=group;
    cantons.filter(c=>c.group===group).forEach(c=>{const option=document.createElement("option");option.value=c.region;option.textContent=(c.country==="LI"?"🇱🇮 ":"")+c.name;optgroup.appendChild(option)});
    select.appendChild(optgroup);
  }
  if([...select.options].some(o=>o.value===current))select.value=current;
}
})();
