window.WGH_LOCATIONS={
  "Zürich":[47.3769,8.5417],"Winterthur":[47.4988,8.7241],"Uster":[47.3471,8.7209],"Dietikon":[47.4017,8.4000],"Horgen":[47.2590,8.5977],"Wädenswil":[47.2306,8.6721],"Thalwil":[47.2918,8.5639],"Kloten":[47.4515,8.5849],"Dübendorf":[47.3972,8.6187],"Wetzikon":[47.3264,8.7978],"Bülach":[47.5180,8.5400],"Hinwil":[47.3032,8.8441],"Rüti ZH":[47.2598,8.8550],"Meilen":[47.2692,8.6412],"Stäfa":[47.2422,8.7230],"Adliswil":[47.3119,8.5257],"Regensdorf":[47.4344,8.4687],"Schlieren":[47.3972,8.4471],
  "Chur":[46.8508,9.5320],"Landquart":[46.9676,9.5544],"Maienfeld":[47.0085,9.5314],"Bad Ragaz":[47.0034,9.5006],"Davos":[46.8027,9.8360],"Arosa":[46.7833,9.6833],"Lenzerheide":[46.7270,9.5578],"Thusis":[46.6971,9.4404],"Flims":[46.8368,9.2840],"Laax":[46.8067,9.2579],
  "Buchs SG":[47.1670,9.4774],"Werdenberg / Buchs":[47.1685,9.4650],"Werdenberg":[47.1697,9.4622],"Grabs":[47.1825,9.4435],"Gams":[47.2042,9.4411],"Sennwald":[47.2613,9.5035],"Oberschan":[47.1020,9.4780],"Sevelen":[47.1220,9.4860],"Wartau":[47.0870,9.4870],"Sargans":[47.0480,9.4410],"Walenstadt":[47.1257,9.3137],"Wildhaus":[47.2030,9.3518],"Unterwasser":[47.1970,9.3082],"Alt St. Johann":[47.1930,9.2860],
  "Altstätten":[47.3774,9.5402],"Balgach":[47.4052,9.6066],"Berneck":[47.4268,9.6112],"Au SG":[47.4300,9.6340],"Heerbrugg":[47.4145,9.6270],"Widnau":[47.4053,9.6354],"Diepoldsau":[47.3852,9.6554],"Rebstein":[47.3980,9.5830],"Marbach SG":[47.3932,9.5690],"Oberriet":[47.3205,9.5680],"Rüthi SG":[47.2940,9.5380],"St. Margrethen":[47.4512,9.6370],"Rheineck":[47.4660,9.5900],
  "St. Gallen":[47.4245,9.3767],"Rapperswil-Jona":[47.2267,8.8184],"Pfäffikon SZ":[47.2010,8.7780],"Vaduz":[47.1410,9.5209],"Schaan":[47.1660,9.5100]
};
window.WGH_locationFor=function(city){
  if(!city)return null;
  if(window.WGH_LOCATIONS[city])return window.WGH_LOCATIONS[city];
  const c=String(city).trim();
  const found=Object.keys(window.WGH_LOCATIONS).find(k=>c.toLowerCase().includes(k.toLowerCase())||k.toLowerCase().includes(c.toLowerCase()));
  return found?window.WGH_LOCATIONS[found]:null;
};