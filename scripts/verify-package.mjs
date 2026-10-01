import {readFile,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {validateRelease} from './public-health.mjs';

const release=JSON.parse(await readFile('release.json','utf8'));
validateRelease(release);
async function walk(root,prefix=''){
 const paths=[];
 for(const name of await readdir(join(root,prefix))){
  const path=prefix?prefix+'/'+name:name,stat=await lstat(join(root,path));
  if(stat.isSymbolicLink())throw new Error('A publication cannot contain links: '+path);
  if(stat.isDirectory())paths.push(...await walk(root,path));else if(stat.isFile())paths.push(path);else throw new Error('Unsupported file: '+path);
 }
 return paths.sort();
}
const root=await lstat('site');
if(!root.isDirectory()||root.isSymbolicLink())throw new Error('The site root must be an ordinary directory');
const paths=await walk('site');
if(JSON.stringify(paths)!==JSON.stringify(Object.keys(release.files).sort()))throw new Error('The package and manifest have different file lists');
for(const path of paths){
 if(path.split('/').some(p=>p.startsWith('.'))||/\.(?:md|map|env|ts|ya?ml)$/i.test(path))throw new Error('Unexpected source/private file: '+path);
 const actual=createHash('sha256').update(await readFile(join('site',path))).digest('hex');
 if(actual!==release.files[path])throw new Error('File changed after review: '+path);
}
for(const required of ['index.html','404.html','artigos/index.html','acervo/index.html','rss.xml','sitemap.xml','robots.txt']){
 if(!paths.includes(required))throw new Error('Missing publication route: '+required);
}
for(const name of ['cronologia','discursos','pessoas','temas','galerias']){
 if(paths.some(p=>p===name+'.html'||p.startsWith(name+'/')))throw new Error('Unapproved section: '+name);
}
const html=await readFile('site/index.html','utf8');
if(!html.includes('<title>nixonbrazil</title>')||!html.includes('https://nixonbrazil.page/')||!html.includes('Richard Nixon em português.'))throw new Error('Wrong homepage');
console.log(`Verified ${paths.length} publication files from ${release.source_commit}.`);
