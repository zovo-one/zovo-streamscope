/* SPDX-License-Identifier: GPL-3.0-only */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
}
walk(dist);
const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'));
const code = files.filter((file) => file.endsWith('.js')).map((file) => readFileSync(file, 'utf8')).join('\n');
const reviewer = files.filter((file) => /\.(html|css|json|js)$/.test(file)).map((file) => readFileSync(file, 'utf8')).join('\n');

const failures = [];
if (manifest.manifest_version !== 3) failures.push('manifest is not MV3');
if (manifest.permissions.includes('downloads')) failures.push('downloads permission is present');
if (/chrome\.downloads\b|download\s*=/.test(code)) failures.push('file-download code is present');
const titleSurfaces = [manifest.name, manifest.short_name, manifest.description, manifest.action?.default_title]
  .filter(Boolean).join('\n') + files.filter((file) => file.endsWith('.html')).map((file) => {
    const html = readFileSync(file, 'utf8');
    return html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
  }).join('\n');
if (/\bcat-catch\b/i.test(titleSurfaces)) failures.push('forbidden upstream product token is present in a title surface');
if (reviewer.includes('__SUPABASE_ANON_KEY__')) failures.push('Supabase key placeholder was not replaced');
if (!/sb_publishable_[A-Za-z0-9_-]+/.test(code)) failures.push('publishable Supabase key is absent');
if (!code.includes("body?.valid !== true")) failures.push('licence grant is not anchored to valid:true');
if (/tier\s*={2,3}\s*['\"]pro['\"]/i.test(code)) failures.push('licence incorrectly grants on tier');
if (!code.includes('chrome.webRequest.onHeadersReceived')) failures.push('passive response logger is not wired');
if (!code.includes('navigator.clipboard.writeText')) failures.push('copy URL control is not wired');
if (!code.includes('chrome.action.setBadgeText')) failures.push('per-tab badge is not wired');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`dist-check: PASS (${files.length} files)`);
