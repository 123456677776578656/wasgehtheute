import fs from 'node:fs';
const [outputPath,...inputPaths]=process.argv.slice(2);
if(!outputPath||!inputPaths.length)throw new Error('Usage: node scripts/merge-localcities-crawls.mjs <output> <input...>');
const byUrl=new Map();
for(const page of inputPaths.flatMap(path=>JSON.parse(fs.readFileSync(path,'utf8')).pages||[])){
  const previous=byUrl.get(page.url);
  if(!previous||previous.error&&!page.error)byUrl.set(page.url,page);
}
const pages=[...byUrl.values()].sort((a,b)=>a.url.localeCompare(b.url));
fs.writeFileSync(outputPath,JSON.stringify({checkedAt:new Date().toISOString(),source:'https://www.localcities.ch/sitemap.xml',pages},null,2));
console.log(JSON.stringify({pages:pages.length,withEvents:pages.filter(r=>r.listedCount>0).length,listedOccurrences:pages.reduce((sum,r)=>sum+(r.listedCount||0),0),capturedFirstPage:pages.reduce((sum,r)=>sum+r.events.length,0),errors:pages.filter(r=>r.error).length,outputPath},null,2));
