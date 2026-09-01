/*
 * Zovo Streamscope build — Copyright (C) 2026 Zovo
 * SPDX-License-Identifier: GPL-3.0-only
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const source = join(root, 'streamscope-src');
const dist = join(root, 'dist');
const key = process.env.SUPABASE_ANON_KEY || '';

if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
  throw new Error('SUPABASE_ANON_KEY must be set to a publishable key for production builds.');
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of readdirSync(source)) {
  cpSync(join(source, entry), join(dist, entry), { recursive: true });
}
cpSync(join(root, 'LICENSE'), join(dist, 'LICENSE'));
cpSync(join(root, 'CHANGES-STREAMSCOPE.md'), join(dist, 'CHANGES.md'));
cpSync(join(root, 'SOURCE-OFFER.md'), join(dist, 'SOURCE-OFFER.md'));

const licencePath = join(dist, 'scope-license.client.js');
const licence = readFileSync(licencePath, 'utf8');
if (!licence.includes('__SUPABASE_ANON_KEY__')) throw new Error('Licence build token is missing.');
writeFileSync(licencePath, licence.replaceAll('__SUPABASE_ANON_KEY__', key));

const manifestPath = join(dist, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.manifest_version !== 3) throw new Error('Streamscope must ship as MV3.');
if (manifest.permissions?.includes('downloads')) throw new Error('Streamscope must never request downloads permission.');

console.log(`Built ${manifest.name} ${manifest.version} at ${dist}`);
