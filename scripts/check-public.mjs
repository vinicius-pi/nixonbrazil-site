import {readFile, appendFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {checkPublic, loadDeployedRelease} from './public-health.mjs';

const args=process.argv.slice(2);
if(args.some(arg=>arg!=='--deployed'))throw Error('Usage: node scripts/check-public.mjs [--deployed]');
let result;
for(let attempt=1;attempt<=3;attempt++){
  try{
    const published=args.includes('--deployed')
      ? await loadDeployedRelease({token:process.env.GH_TOKEN||''})
      : {release:JSON.parse(await readFile('release.json','utf8'))};
    result={...await checkPublic(published.release),hostingCommit:published.hostingCommit||process.env.GITHUB_SHA||null,checkedAt:new Date().toISOString()};
    break;
  }catch(error){
    if(attempt===3)throw error;
    console.error('Check '+attempt+' failed: '+error.message+'. Retrying in 5 seconds.');
    await delay(5000);
  }
}
console.log(JSON.stringify(result,null,2));
if(process.env.GITHUB_STEP_SUMMARY){
  await appendFile(process.env.GITHUB_STEP_SUMMARY,`## Public access verified\n\nhttps://nixonbrazil.page/ — ${result.files} files match the deployed edition; HTTPS and custom 404 passed without authentication.\n\nChecked: ${result.checkedAt}\n\nHosting commit: ${result.hostingCommit}\n\nEditorial commit: ${result.sourceCommit}\n`);
}
