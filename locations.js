window.WGH_LOCATIONS={
  "Zürich":[47.3769,8.5417],"Winterthur":[47.4988,8.7241],"Uster":[47.3471,8.7209],"Dietikon":[47.4017,8.4000],"Horgen":[47.2590,8.5977],"Wädenswil":[47.2306,8.6721],"Thalwil":[47.2918,8.5639],"Kloten":[47.4515,8.5849],"Dübendorf":[47.3972,8.6187],"Wetzikon":[47.3264,8.7978],"Bülach":[47.5180,8.5400],"Hinwil":[47.3032,8.8441],"Rüti ZH":[47.2598,8.8550],"Meilen":[47.2692,8.6412],"Stäfa":[47.2422,8.7230],"Adliswil":[47.3119,8.5257],"Regensdorf":[47.4344,8.4687],"Schlieren":[47.3972,8.4471],
  "Chur":[46.8508,9.5320],"Landquart":[46.9676,9.5544],"Maienfeld":[47.0085,9.5314],"Bad Ragaz":[47.0034,9.5006],"Davos":[46.8027,9.8360],"Arosa":[46.7833,9.6833],"Lenzerheide":[46.7270,9.5578],"Thusis":[46.6971,9.4404],"Flims":[46.8368,9.2840],"Laax":[46.8067,9.2579],
  "Buchs SG":[47.1670,9.4774],"Werdenberg / Buchs":[47.1685,9.4650],"Werdenberg":[47.1697,9.4622],"Grabs":[47.1825,9.4435],"Gams":[47.2042,9.4411],"Sennwald":[47.2613,9.5035],"Oberschan":[47.1020,9.4780],"Sevelen":[47.1220,9.4860],"Wartau":[47.0870,9.4870],"Sargans":[47.0480,9.4410],"Mels":[47.0458,9.4168],"Walenstadt":[47.1257,9.3137],"Wildhaus":[47.2030,9.3518],"Unterwasser":[47.1970,9.3082],"Alt St. Johann":[47.1930,9.2860],
  "Altstätten":[47.3774,9.5402],"Balgach":[47.4052,9.6066],"Berneck":[47.4268,9.6112],"Au SG":[47.4300,9.6340],"Heerbrugg":[47.4145,9.6270],"Widnau":[47.4053,9.6354],"Diepoldsau":[47.3852,9.6554],"Rebstein":[47.3980,9.5830],"Marbach SG":[47.3932,9.5690],"Oberriet":[47.3205,9.5680],"Rüthi SG":[47.2940,9.5380],"St. Margrethen":[47.4512,9.6370],"Rheineck":[47.4660,9.5900],
  "Frauenfeld":[47.5582,8.8985],"Kreuzlingen":[47.6505,9.1750],"Arbon":[47.5169,9.4338],"Romanshorn":[47.5659,9.3787],"Weinfelden":[47.5669,9.1077],"Amriswil":[47.5468,9.2956],"Steckborn":[47.6666,8.9830],"Diessenhofen":[47.6893,8.7495],
  "St. Gallen":[47.4245,9.3767],"Rapperswil-Jona":[47.2267,8.8184],"Pfäffikon SZ":[47.2010,8.7780],
  "Appenzell":[47.3310,9.4099],"Weissbad":[47.3088,9.4358],"Oberegg":[47.4248,9.5519],"Heiden":[47.4426,9.5321],"Herisau":[47.3862,9.2792],"Schaffhausen":[47.6965,8.6349],"Glarus":[47.0404,9.0680],"Elm":[46.9195,9.1720],
  "Aarau":[47.3904,8.0457],"Bern":[46.9480,7.4474],"Liestal":[47.4847,7.7345],"Basel":[47.5596,7.5886],"Luzern":[47.0502,8.3093],"Stans":[46.9580,8.3666],"Sarnen":[46.8961,8.2453],"Schwyz":[47.0207,8.6541],"Solothurn":[47.2088,7.5323],"Altdorf UR":[46.8804,8.6444],"Zug":[47.1662,8.5155],
  "Murten":[46.9280,7.1172],"Genf":[46.2044,6.1432],"Delémont":[47.3654,7.3444],"Neuchâtel":[46.9896,6.9293],"Tesserete":[46.0683,8.9650],"Lugano":[46.0037,8.9511],"Lausanne":[46.5197,6.6323],"Sion":[46.2331,7.3606],"Vaduz":[47.1410,9.5209],"Schaan":[47.1660,9.5100]
};
window.WGH_locationFor=function(city){
  if(!city)return null;
  if(window.WGH_LOCATIONS[city])return window.WGH_LOCATIONS[city];
  const c=String(city).trim();
  const found=Object.keys(window.WGH_LOCATIONS).find(k=>c.toLowerCase().includes(k.toLowerCase())||k.toLowerCase().includes(c.toLowerCase()));
  return found?window.WGH_LOCATIONS[found]:null;
};
