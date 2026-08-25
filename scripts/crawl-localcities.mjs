import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';

const outputPath=process.argv[2]||'/tmp/localcities-first-page.json';
const concurrency=Math.max(1,Math.min(24,Number(process.argv[3])||12));
const shardIndex=Math.max(0,Number(process.argv[4])||0),shardCount=Math.max(1,Number(process.argv[5])||1);
const onlyUrlsPath=process.argv[6]||'';
const userAgent='WasGehtHeuteBot/1.0 (+https://123456677776578656.github.io/wasgehtheute/)';
const sitemapUrl='https://www.localcities.ch/sitemap/sitemap_de_0.xml.gz';
const decode=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&#0*39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&auml;/g,'ä').replace(/&ouml;/g,'ö').replace(/&uuml;/g,'ü').replace(/&Auml;/g,'Ä').replace(/&Ouml;/g,'Ö').replace(/&Uuml;/g,'Ü').replace(/&eacute;/g,'é').replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();
const fetchText=async url=>{
  for(let attempt=1;attempt<=3;attempt++){
    try{const response=await fetch(url,{headers:{'user-agent':userAgent,'accept-language':'de-CH,de;q=0.9'},signal:AbortSignal.timeout(20000)});if(response.ok)return await response.text();if(response.status<500)throw new Error(`HTTP ${response.status}`)}catch(error){if(attempt===3)throw error}
    await new Promise(resolve=>setTimeout(resolve,500*attempt));
  }
};
const sitemapResponse=await fetch(sitemapUrl,{headers:{'user-agent':userAgent}});
if(!sitemapResponse.ok)throw new Error(`Sitemap HTTP ${sitemapResponse.status}`);
const sitemap=gunzipSync(Buffer.from(await sitemapResponse.arrayBuffer())).toString('utf8');
const allUrls=[...sitemap.matchAll(/<loc>(https:\/\/www\.localcities\.ch\/de\/veranstaltungen\/[^<]+)<\/loc>/g)].map(match=>match[1]);
const sourceUrls=onlyUrlsPath?JSON.parse(fs.readFileSync(onlyUrlsPath,'utf8')):allUrls;
const urls=sourceUrls.filter((_,index)=>index%shardCount===shardIndex);
const rows=new Array(urls.length);let cursor=0,done=0;
const parsePage=(url,html)=>{
  const countMatch=html.match(/event-list__result-text[\s\S]*?<p>([\d'’\.]+) Veranstaltungen<\/p>/);
  const listedCount=countMatch?Number(countMatch[1].replace(/\D/g,'')):0;
  const events=[],matches=[...html.matchAll(/href="(\/de\/veranstaltungen\/[^"?]+\/\d+\?eventDateTime=([^"]+))"/g)];
  const seen=new Set();
  for(let i=0;i<matches.length;i++){
    const href=decode(matches[i][1]);if(seen.has(href))continue;seen.add(href);
    const start=matches[i].index||0,end=matches[i+1]?.index||Math.min(html.length,start+6000),chunk=html.slice(start,end);
    const title=decode(chunk.match(/<h2[^>]*class="h3"[^>]*>([\s\S]*?)<\/h2>/)?.[1]);
    const paragraphs=[...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>decode(m[1])).filter(Boolean).slice(0,2);
    const image=decode(chunk.match(/background-image:\s*url\(([^)]+)\)/)?.[1]);
    if(title)events.push({title,href:`https://www.localcities.ch${href}`,eventDateTime:decodeURIComponent(matches[i][2].replace(/\+/g,' ')),when:paragraphs[0]||'',venue:paragraphs[1]||'',image});
  }
  return {url,listedCount,events};
};
async function worker(){
  while(true){const index=cursor++;if(index>=urls.length)return;const url=urls[index];
    try{rows[index]=parsePage(url,await fetchText(url))}catch(error){rows[index]={url,listedCount:null,events:[],error:String(error?.message||error)}}
    done++;if(done%100===0)fs.writeFileSync(`${outputPath}.partial`,JSON.stringify({checkedAt:new Date().toISOString(),source:sitemapUrl,pages:rows.filter(Boolean)}));if(done%50===0||done===urls.length)process.stderr.write(`\r${done}/${urls.length} Gemeindekalender geprüft`);
  }
}
await Promise.all(Array.from({length:concurrency},worker));
fs.writeFileSync(outputPath,JSON.stringify({checkedAt:new Date().toISOString(),source:sitemapUrl,pages:rows},null,2));
process.stderr.write('\n');
console.log(JSON.stringify({pages:rows.length,allPages:allUrls.length,shardIndex,shardCount,withEvents:rows.filter(r=>r.listedCount>0).length,listedOccurrences:rows.reduce((sum,r)=>sum+(r.listedCount||0),0),capturedFirstPage:rows.reduce((sum,r)=>sum+r.events.length,0),errors:rows.filter(r=>r.error).length,outputPath},null,2));
