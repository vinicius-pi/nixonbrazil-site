import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateRelease, checkPublic, loadDeployedRelease, ORIGIN} from './public-health.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
const files = ['index.html','404.html','artigos/index.html','acervo/index.html','rss.xml','sitemap.xml','robots.txt','scripts/archive.js'];
const release = () => ({version:1,domain:'nixonbrazil.page',source_repository:'vinicius-pi/nixon-brasil',source_ref:'refs/heads/main',source_commit:'a'.repeat(40),build:{method:'local'},files:Object.fromEntries(files.map(p=>[p,hash(p)]))});
function response(body, status=200, url='') { const r=new Response(body,{status});Object.defineProperty(r,'url',{value:url});return r; }
function website(change=()=>null) { return async (url, options) => {
  assert.equal(options.headers?.Authorization,undefined);
  const changed=change(url);if(changed)return changed;
  const path=new URL(url).pathname.slice(1);
  const file=path==='__publication_check_missing__/'?'404.html':path.endsWith('/')?path+'index.html':path||'index.html';
  return response(file,path==='__publication_check_missing__/'?404:200,url);
};}
test('all files and the custom 404 match the published manifest',async()=>{
  assert.deepEqual(await checkPublic(release(),{request:website()}),{origin:ORIGIN,sourceCommit:'a'.repeat(40),files:8,hashesMatch:true,unknownRoute:404,authenticated:false});
});
test('a stale homepage with valid branding fails by content, even with HTTP 200',async()=>{
  await assert.rejects(checkPublic(release(),{request:website(url=>url===ORIGIN+'/'?response('<title>nixonbrazil</title>',200,url):null)}),/content differs/);
});
test('a missing asset, a redirect and a soft 404 all fail',async()=>{
  for(const [suffix,status] of [['scripts/archive.js',404],['artigos/',301],['__publication_check_missing__/',200]]) {
    await assert.rejects(checkPublic(release(),{request:website(url=>url.endsWith(suffix)?response('wrong',status,url):null)}),/expected HTTP/);
  }
});
test('foreign origins and network failures are not reported healthy',async()=>{
  await assert.rejects(checkPublic(release(),{request:website(()=>response('index.html',200,'https://example.com/'))}),/expected HTTP/);
  await assert.rejects(checkPublic(release(),{request:async()=>{throw Error('offline');}}),/offline/);
});
test('unsafe paths, private files, wrong source and incomplete manifests fail',()=>{
  for(const path of ['../private.md','/index.html','a\\b','a/../b','a?token','secret.env']) {
    const r=release();r.files[path]=hash('x');assert.throws(()=>validateRelease(r));
  }
  const wrong=release();wrong.source_repository='other/repo';assert.throws(()=>validateRelease(wrong));
  const missing=release();delete missing.files['rss.xml'];assert.throws(()=>validateRelease(missing));
});
test('monitor loads the successful deployment, not queued or unpublished main',async()=>{
  const calls=[];
  const request=async(url,options)=>{
    calls.push(url);assert.ok(url.startsWith('https://api.github.com/repos/vinicius-pi/nixonbrazil-site/'));assert.equal(options.headers.Authorization,'Bearer test-token');
    let value;
    if(url.includes('/deployments?'))value=[{id:2,sha:'b'.repeat(40)},{id:1,sha:'a'.repeat(40)}];
    else if(url.includes('/2/statuses'))value=[{state:'in_progress'}];
    else if(url.includes('/1/statuses'))value=[{state:'success'}];
    else {assert.ok(url.endsWith('?ref='+'a'.repeat(40)));value={encoding:'base64',content:Buffer.from(JSON.stringify(release())).toString('base64')};}
    return response(JSON.stringify(value));
  };
  const found=await loadDeployedRelease({request,token:'test-token'});assert.equal(found.hostingCommit,'a'.repeat(40));assert.equal(calls.length,4);
});
test('missing deployment evidence or API denial fails explicitly',async()=>{
  await assert.rejects(loadDeployedRelease({request:async()=>response('[]')}),/No successful/);
  await assert.rejects(loadDeployedRelease({request:async()=>response('{}',403)}),/GitHub HTTP 403/);
});
