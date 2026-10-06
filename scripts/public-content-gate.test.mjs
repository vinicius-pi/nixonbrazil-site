import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findPrivateContent } from './public-content-gate.mjs';

test('rejects local paths, draft markers and personal email addresses', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nixon-public-gate-'));
  try {
    await writeFile(join(root, 'index.html'), [
      '<p>C:\\Users\\vinic\\private</p>',
      '<p>draft: true</p>',
      '<p>owner@example.net</p>',
    ].join('\n'));
    const findings = await findPrivateContent(root);
    assert.deepEqual(findings.map(({ code }) => code), [
      'windows_local_path',
      'editorial_draft_marker',
      'personal_email',
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('allows public editorial prose and example addresses', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nixon-public-gate-'));
  try {
    await writeFile(join(root, 'index.html'), '<p>Fontes e direitos permanecem explícitos. owner@example.com</p>');
    assert.deepEqual(await findPrivateContent(root), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
