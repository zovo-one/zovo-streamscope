/* SPDX-License-Identifier: GPL-3.0-only */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({ URL, Date, globalThis: {} });
vm.runInContext(readFileSync(new URL('../streamscope-src/scope-media.logic.js', import.meta.url), 'utf8'), context);
const logic = context.globalThis.ScopeMediaLogic;

test('reads content type and total content range', () => {
  const headers = logic.headersOf([
    { name: 'Content-Type', value: 'video/mp4; charset=binary' },
    { name: 'Content-Range', value: 'bytes 0-999/4500000' }
  ]);
  assert.equal(headers.mime, 'video/mp4');
  assert.equal(headers.bytes, 4500000);
});

test('classifies playlists, segments, audio, and images', () => {
  assert.equal(logic.kindFor('https://media.test/master.m3u8', ''), 'playlist');
  assert.equal(logic.kindFor('https://media.test/chunk.m4s', ''), 'segment');
  assert.equal(logic.kindFor('https://media.test/track.opus', ''), 'audio');
  assert.equal(logic.kindFor('https://media.test/frame.webp', ''), 'image');
});

test('accepts media response types without an extension', () => {
  const details = { url: 'https://media.test/playback?id=1', type: 'xmlhttprequest' };
  assert.equal(logic.isMedia(details, { mime: 'application/vnd.apple.mpegurl' }), true);
});

test('does not count failed image responses', () => {
  const details = { url: 'https://media.test/favicon.ico', type: 'image', statusCode: 404 };
  assert.equal(logic.isMedia(details, { mime: 'text/plain' }), false);
});

test('provides honest hint families', () => {
  assert.deepEqual({ ...logic.hintFor('https://media.test/movie.mp4', 'video/mp4') }, { container: 'MP4', codec: 'H.264 / AAC family' });
  assert.deepEqual({ ...logic.hintFor('https://media.test/manifest.mpd', 'application/dash+xml') }, { container: 'DASH', codec: '' });
});

test('strips URL userinfo without stripping stream query tokens', () => {
  assert.equal(logic.safeUrl('https://user:pass@media.test/master.m3u8?token=abc'), 'https://media.test/master.m3u8?token=abc');
});
