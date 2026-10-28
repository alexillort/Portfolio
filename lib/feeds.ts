import {projects,profile,type Publication} from './content';
import snapshot from './publications-snapshot.json';
const TTL=60*60*1000;
export function decode(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const cp=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):parseInt(n,10);return cp<=0x10ffff?String.fromCodePoint(cp):'';}).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').trim();}
const idFromUrl=(url:string)=>url.match(/\/gallery\/(\d+)\//)?.[1];
const safeUrl=(value:string,hosts:string[])=>{try{const url=new URL(value);return url.protocol==='https:'&&hosts.includes(url.hostname)?url.href:'';}catch{return '';}};
export function parseBehance(xml:string){
 const entries=[...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)].map(([,item])=>{
  const title=decode(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
  const url=safeUrl(decode(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]||''),['www.behance.net','behance.net']);
  const image=safeUrl(item.match(/<img[^>]+src=['"]([^'"]+)['"]/i)?.[1]||'',['mir-s3-cdn-cf.behance.net']);
  return {title,url,image,id:idFromUrl(url)};
 });
 if(!entries.some(e=>e.id))throw Error('Invalid or empty Behance feed');
 let matched=0;
 const items=projects.map(project=>{const remote=entries.find(e=>e.id&&e.id===idFromUrl(project.url||''));if(!remote)return project;matched++;return {...project,title:remote.title||project.title,image:remote.image.replace('/404/','/808/')||project.image,url:remote.url,source:'Behance'};});
 return {items,matched};
}
export function parseBehanceProfile(html:string){
 const match=html.match(/<script[^>]*id="beconfig-store_state"[^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw Error('No public Behance profile data');
 const found=new Map<string,{title:string;image:string;url:string}>();
 const visit=(value:any,depth=0)=>{if(depth>45||!value||typeof value!=='object')return;
  if(value.id&&value.name&&value.url&&value.covers){const url=safeUrl(value.url,['www.behance.net','behance.net']);const id=idFromUrl(url);
   const images=value.covers.allAvailable||[];const cover=images.find((i:any)=>i.width===808)||images[0];const image=safeUrl(cover?.url||value.covers['808']||'', ['mir-s3-cdn-cf.behance.net']);
   if(id)found.set(id,{title:String(value.name),url,image});}
  Object.values(value).forEach(child=>visit(child,depth+1));
 };visit(JSON.parse(match[1]));if(!found.size)throw Error('No public project data');let matched=0;
 const items=projects.map(p=>{const remote=found.get(idFromUrl(p.url||'')||'');if(!remote)return p;matched++;return {...p,title:remote.title,image:remote.image||p.image,url:remote.url,source:'Behance'};});
 return {items,matched};
}
export function parseScholar(html:string):Publication[]{
 const rows=[...html.matchAll(/<tr\b[^>]*class="gsc_a_tr"[^>]*>([\s\S]*?)<\/tr>/g)];
 return rows.flatMap(([,row])=>{
  const anchor=row.match(/<a\b(?=[^>]*class="gsc_a_at")(?=[^>]*href="([^"]+)")[^>]*>([\s\S]*?)<\/a>/);
  if(!anchor)return [];const url=new URL(decode(anchor[1]),'https://scholar.google.com').href;
  if(!safeUrl(url,['scholar.google.com']))return [];
  const title=decode(anchor[2]);const gray=[...row.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)];
  const year=Number(decode(row.match(/<span class="gsc_a_h gsc_a_hc gs_ibl">([\s\S]*?)<\/span>/)?.[1]||''));
  return [{id:new URL(url).searchParams.get('citation_for_view')||title,title,authors:decode(gray[0]?.[1]||''),venue:decode(gray[1]?.[1]||''),year,url,source:'Google Scholar'}];
 });
}
async function remote(url:string,accept='text/html'){
 const response=await fetch(url,{headers:{Accept:accept},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Upstream HTTP '+response.status);
 const bytes=await response.arrayBuffer();if(bytes.byteLength>3000000)throw Error('Response too large');const charset=response.headers.get('content-type')?.match(/charset=([^;\s]+)/i)?.[1]?.replace(/[\"']/g,'')||'utf-8';return new TextDecoder(charset).decode(bytes);
}
let projectCache={items:projects,matched:0,source:'Portfolio archive',updatedAt:snapshot.updatedAt,cached:true};let projectExpiry=0;
let publicationCache={items:snapshot.items as Publication[],source:'Google Scholar',updatedAt:snapshot.updatedAt,cached:true};let publicationExpiry=0;
let projectPending:Promise<typeof projectCache>|null=null;let publicationPending:Promise<typeof publicationCache>|null=null;
export async function getProjects(){
 if(Date.now()<projectExpiry)return projectCache;
 if(projectPending)return projectPending;
 projectPending=(async()=>{try{let data;try{data=parseBehance(await remote(profile.behance+'.xml','*/*'));}catch{data=parseBehanceProfile(await remote(profile.behance));}projectCache={...data,source:'Behance',updatedAt:new Date().toISOString(),cached:false};projectExpiry=Date.now()+TTL;}catch(error){console.warn('Behance refresh:',error instanceof Error?error.message:'unavailable');projectCache={...projectCache,cached:true};projectExpiry=Date.now()+5*60*1000;}return projectCache;})();
 try{return await projectPending;}finally{projectPending=null;}
}
export async function getPublications(){
 if(Date.now()<publicationExpiry)return publicationCache;
 if(publicationPending)return publicationPending;
 publicationPending=(async()=>{
  try{const html=await remote(profile.scholar+'&hl=en&oe=UTF-8&pagesize=100&sortby=pubdate');const items=parseScholar(html);if(!items.length)throw Error('No Scholar records');
   publicationCache={items,source:'Google Scholar',updatedAt:new Date().toISOString(),cached:false};publicationExpiry=Date.now()+TTL;
  }catch{
   try{const json=JSON.parse(await remote('https://pub.orcid.org/v3.0/'+profile.orcid+'/works','application/json'));
    const works=(json.group||[]).flatMap((group:any)=>(group['work-summary']||[]).slice(0,1)).flatMap((work:any)=>{
     const title=String(work.title?.title?.value||'');const doi=(work['external-ids']?.['external-id']||[]).find((id:any)=>id['external-id-type']==='doi')?.['external-id-value'];
     const url=doi?'https://doi.org/'+encodeURI(doi):safeUrl(work.url?.value||'', ['doi.org']);
     if(!title||!url)return [];return [{id:'orcid-'+work['put-code'],title,authors:'Alexander Rozo Torres et al.',venue:work['journal-title']?.value||'',year:Number(work['publication-date']?.year?.value||0),url,source:'ORCID'}];
    });
    if(!works.length)throw Error('No ORCID records');
    const key=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');const items=[...publicationCache.items];
    for(const work of works)if(!items.some(item=>key(item.title)===key(work.title)))items.push(work);
    publicationCache={items,source:'ORCID + Google Scholar',updatedAt:new Date().toISOString(),cached:false};publicationExpiry=Date.now()+TTL;
   }catch{publicationCache={...publicationCache,cached:true};publicationExpiry=Date.now()+5*60*1000;}
  }return publicationCache;
 })();try{return await publicationPending;}finally{publicationPending=null;}
}
