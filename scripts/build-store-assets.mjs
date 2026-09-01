/* SPDX-License-Identifier: GPL-3.0-only */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url).pathname;
const source = join(root, 'store-assets-src');
const output = join(root, 'store-assets');
const candidates = [
  process.env.QA_CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/tmp/zovo-streamscope-browser-tools/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
].filter(Boolean);
const chrome = candidates.find(existsSync);
if (!chrome) throw new Error('Set QA_CHROME_PATH to Chrome or Chrome for Testing.');
mkdirSync(output, { recursive: true });

const assets = [
  ['screenshot-01.html', 'screenshot-01.png', '1280,800'],
  ['screenshot-02.html', 'screenshot-02.png', '1280,800'],
  ['screenshot-03.html', 'screenshot-03.png', '1280,800'],
  ['promo-small.html', 'promo-small.png', '440,280'],
  ['promo-marquee.html', 'promo-marquee.png', '1400,560']
];
for (const [input, file, size] of assets) {
  const target = join(output, file);
  const run = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${size}`, `--screenshot=${target}`, pathToFileURL(join(source, input)).href], { stdio: 'inherit' });
  if (run.status !== 0 || !existsSync(target)) throw new Error(`Could not render ${file}`);
}
copyFileSync(join(root, 'streamscope-src/icons/scope-128.png'), join(output, 'store-icon-128.png'));
console.log(`Built ${assets.length + 1} store assets at ${output}`);
