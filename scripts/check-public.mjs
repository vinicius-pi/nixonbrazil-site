const origin='https://nixonbrazil.page';
for(const [path,marker] of [['/','<title>nixonbrazil</title>'],['/artigos/abertura-china/','nixonbrazil'],['/acervo/','nixonbrazil'],['/rss.xml','<rss'],['/sitemap.xml','<urlset']]){
 const response=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});
 if(response.status!==200||!response.url.startsWith(origin+'/'))throw new Error(path+': '+response.status+' '+response.url);
 const text=await response.text();if(!text.includes(marker))throw new Error(path+': wrong content');
 console.log('200 '+path);
 if(path==='/'){
  for(const match of text.matchAll(/(?:href|src)="(\/(?:_astro|scripts)\/[^"?#]+)"/g)){
   const asset=await fetch(origin+match[1],{signal:AbortSignal.timeout(15000)});
   if(asset.status!==200)throw new Error('Missing asset: '+match[1]);
  }
 }
}
const missing=await fetch(origin+'/__publication_check_missing__/',{signal:AbortSignal.timeout(15000)});
if(missing.status!==404)throw new Error('Unknown routes must return 404, got '+missing.status);
console.log('404 for an unknown route. HTTPS verified; no authentication used.');
