import { readFile, readdir, lstat } from 'node:fs/promises';
import { join } from 'node:path';

const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.json']);
const FORBIDDEN = [
  ['windows_local_path', /(?:[A-Za-z]:\\Users\\|C:\/Users\/)/i],
  ['unix_local_path', /(?:\/Users\/|\/home\/)[A-Za-z0-9._-]+/i],
  ['private_report_marker', /\b(?:PRIVATE_(?:DRAFT|RH|PROJECT)|review-private|SYNTHETIC_QUERY_SECRET)\b/i],
  ['editorial_draft_marker', /\b(?:draft:\s*true|editorialStatus\s*[:=]\s*(?:recovered|sourced|fact_checked|editorial_review))\b/i],
  ['personal_email', /\b[A-Z0-9._%+-]+@(?!example\.com\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
];

async function walk(root, prefix = '') {
  const paths = [];
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(root, path);
    const stat = await lstat(full);
    if (stat.isSymbolicLink()) throw new Error(`Publication cannot contain links: ${path}`);
    if (stat.isDirectory()) paths.push(...await walk(root, path));
    else if (stat.isFile()) paths.push(path);
    else throw new Error(`Unsupported publication entry: ${path}`);
  }
  return paths.sort();
}

export async function findPrivateContent(root = 'site') {
  const findings = [];
  for (const path of await walk(root)) {
    const extension = path.slice(path.lastIndexOf('.')).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension)) continue;
    const text = await readFile(join(root, path), 'utf8');
    for (const [code, pattern] of FORBIDDEN) {
      if (pattern.test(text)) findings.push({ code, path });
    }
  }
  return findings;
}

if (process.argv[1] && process.argv[1].endsWith('public-content-gate.mjs')) {
  const findings = await findPrivateContent();
  if (findings.length) {
    for (const finding of findings) console.error(`${finding.code}: ${finding.path}`);
    throw new Error(`Public content gate found ${findings.length} privacy marker(s).`);
  }
  console.log('Public content gate passed: no private-content markers found.');
}
