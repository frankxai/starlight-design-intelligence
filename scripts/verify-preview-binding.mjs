import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function verifyPreviewBinding(expected, receipt, { now = Date.now() } = {}) {
  const fail = message => { throw new Error(message); };
  if (!/^[a-f0-9]{40}$/.test(expected.commit) || !/^[\w.-]+\/[\w.-]+$/.test(expected.repository) || typeof expected.project !== 'string' || !expected.project) fail('Expected immutable repository commit and project.');
  const d = receipt.deployment;
  if (!d || d.state !== 'READY' || !['preview', null].includes(d.target)) fail('A ready preview deployment is required.');
  if (d.repository !== expected.repository || d.commit !== expected.commit) fail('Preview repository or commit mismatch.');
  const url = new URL(d.url);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.vercel.app') || url.username || url.password || url.search || url.hash || url.pathname !== '/') fail('Exact Vercel deployment URL required.');
  if (!/^dpl_[A-Za-z0-9]+$/.test(d.id)) fail('Deployment identifier required.');
  if (d.project !== expected.project) fail('Preview project mismatch.');
  if (!receipt.observed_at || !Number.isFinite(Date.parse(receipt.observed_at)) || !['vercel-api', 'vercel-connector'].includes(receipt.source)) fail('Dated Vercel evidence required.');
  if (Date.parse(receipt.observed_at) > now + 300_000) fail('Observation timestamp is in the future.');
  return { schema_version: 'starlight.preview_binding.v1', repository: expected.repository, commit: expected.commit, deployment_id: d.id, url: url.href, observed_at: receipt.observed_at, verdict: 'IDENTITY_BOUND_ONLY', functional: 'NOT_TESTED', design: 'NOT_REVIEWED', user_value: 'NOT_VALIDATED' };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [expectedPath, receiptPath] = process.argv.slice(2);
  if (!expectedPath || !receiptPath) throw new Error('Usage: node scripts/verify-preview-binding.mjs expected.json deployment-receipt.json');
  console.log(JSON.stringify(verifyPreviewBinding(JSON.parse(readFileSync(expectedPath)), JSON.parse(readFileSync(receiptPath))), null, 2));
}
