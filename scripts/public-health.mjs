import {createHash} from 'node:crypto';

export const ORIGIN = 'https://nixonbrazil.page';
const REPO = 'vinicius-pi/nixonbrazil-site';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function validateRelease(release) {
  if (release?.version !== 1 || release.domain !== 'nixonbrazil.page' ||
      release.source_repository !== 'vinicius-pi/nixon-brasil' ||
      release.source_ref !== 'refs/heads/main' || !/^[a-f0-9]{40}$/.test(release.source_commit) ||
      !['local', 'github-actions'].includes(release.build?.method)) throw Error('Invalid release identity');
  if (!release.files || Array.isArray(release.files) || typeof release.files !== 'object') throw Error('Invalid file manifest');
  const paths = Object.keys(release.files);
  if (!paths.length || paths.length > 5000) throw Error('Invalid publication size');
  for (const path of paths) {
    if (path.length > 500 || /[\\\x00-\x1f?#:]/.test(path) ||
        path.split('/').some(part => !part || part.startsWith('.')) ||
        /\.(?:md|map|env|ts|ya?ml)$/i.test(path) || !/^[a-f0-9]{64}$/.test(release.files[path])) throw Error('Invalid publication file: ' + path);
  }
  for (const path of ['index.html', '404.html', 'artigos/index.html', 'acervo/index.html', 'rss.xml', 'sitemap.xml', 'robots.txt']) {
    if (!Object.hasOwn(release.files, path)) throw Error('Missing publication route: ' + path);
  }
  return release;
}

// Scheduled checks follow the deployed commit, even when main contains a newer,
// deliberately unpublished package. GitHub credentials never go to the website.
export async function loadDeployedRelease({request = fetch, token = ''} = {}) {
  const base = 'https://api.github.com/repos/' + REPO;
  async function api(path) {
    const response = await request(base + path, {
      headers: {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? {Authorization: 'Bearer ' + token} : {})},
      signal: AbortSignal.timeout(15000), redirect: 'error'
    });
    if (!response.ok) throw Error('Cannot identify the published version: GitHub HTTP ' + response.status);
    return response.json();
  }
  const deployments = await api('/deployments?environment=github-pages&per_page=20');
  if (!Array.isArray(deployments)) throw Error('Invalid deployment response');
  for (const deployment of deployments) {
    if (!Number.isSafeInteger(deployment.id) || !/^[a-f0-9]{40}$/.test(deployment.sha)) throw Error('Invalid deployment identity');
    const statuses = await api('/deployments/' + deployment.id + '/statuses?per_page=1');
    if (statuses[0]?.state !== 'success') continue;
    const file = await api('/contents/release.json?ref=' + deployment.sha);
    if (file.encoding !== 'base64' || typeof file.content !== 'string' || file.content.length > 2000000) throw Error('Invalid published manifest');
    return {hostingCommit: deployment.sha, deploymentId: deployment.id,
      release: validateRelease(JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')))};
  }
  throw Error('No successful Pages deployment found in the latest 20 deployments; inspect publication history.');
}

export async function checkPublic(release, {request = fetch} = {}) {
  validateRelease(release);
  const checked = [];
  async function retrieve(path, status) {
    const url = ORIGIN + path;
    const response = await request(url, {signal: AbortSignal.timeout(15000), cache: 'no-store', redirect: 'error'});
    if (response.status !== status || (response.url && response.url !== url)) throw Error(path + ': expected HTTP ' + status + ', received ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    return sha256(bytes);
  }
  for (const [file, expected] of Object.entries(release.files)) {
    const path = '/' + file.split('/').map(encodeURIComponent).join('/').replace(/(^|\/)index\.html$/, '$1');
    if (await retrieve(path, 200) !== expected) throw Error(path + ': content differs from the published release');
    checked.push(path);
  }
  if (await retrieve('/__publication_check_missing__/', 404) !== release.files['404.html']) throw Error('Unknown route did not serve the reviewed 404 page');
  return {origin: ORIGIN, sourceCommit: release.source_commit, files: checked.length, hashesMatch: true, unknownRoute: 404, authenticated: false};
}
