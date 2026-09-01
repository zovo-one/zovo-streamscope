/* SPDX-License-Identifier: GPL-3.0-only */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({ AbortController, Date, fetch, setTimeout, clearTimeout, console, globalThis: {} });
vm.runInContext(readFileSync(new URL('../streamscope-src/scope-license.client.js', import.meta.url), 'utf8'), context);
const licence = context.globalThis.ScopeLicence;

test('normalizes and accepts only the four-group key shape', () => {
  assert.equal(licence.normalizeKey(' zovo-ab12-cd34-ef56-gh78 '), 'ZOVO-AB12-CD34-EF56-GH78');
  assert.equal(licence.keyHasValidShape('ZOVO-AB12-CD34-EF56-GH78'), true);
  assert.equal(licence.keyHasValidShape('ZOVO-AB12-CD34'), false);
  assert.equal(licence.keyHasValidShape('OTHER-AB12-CD34-EF56-GH78'), false);
});

function activationHarness(responseBody) {
  const writes = [];
  const source = readFileSync(new URL('../streamscope-src/scope-license.client.js', import.meta.url), 'utf8')
    .replace('__SUPABASE_ANON_KEY__', 'sb_publishable_test_key');
  const harness = vm.createContext({
    AbortController,
    Date,
    setTimeout,
    clearTimeout,
    console,
    globalThis: {},
    fetch: async () => ({ ok: true, json: async () => responseBody }),
    chrome: { storage: { sync: { set: async (value) => writes.push(value), remove: async () => {}, get: async () => ({}) } } }
  });
  vm.runInContext(source, harness);
  return { licence: harness.globalThis.ScopeLicence, writes };
}

test('does not grant when a pro tier lacks valid:true', async () => {
  const harness = activationHarness({ valid: false, tier: 'pro' });
  assert.equal(await harness.licence.activateLicense('ZOVO-AB12-CD34-EF56-GH78'), 'invalid');
  assert.equal(harness.writes.length, 0);
});

test('grants on valid:true without requiring a pro tier', async () => {
  const harness = activationHarness({ valid: true, tier: 'free' });
  assert.equal(await harness.licence.activateLicense('ZOVO-AB12-CD34-EF56-GH78'), 'ok');
  assert.equal(harness.writes.length, 1);
  const record = harness.writes[0]['ssx.scopeLicenceV1'];
  assert.equal(record.valid, true);
});
