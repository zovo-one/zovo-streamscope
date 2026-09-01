/* Runtime-only fixture server. SPDX-License-Identifier: GPL-3.0-only */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const icon = readFileSync(new URL('../streamscope-src/icons/scope-128.png', import.meta.url));
const playlist = Buffer.from('#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:4,\n/clip.mp4\n');
const clip = Buffer.from('000000206674797069736F6D0000020069736F6D69736F32', 'hex');
const page = `<!doctype html><html><head><title>Streamscope runtime fixture</title></head><body>
  <h1>Runtime fixture</h1>
  <img src="/image.png" alt="fixture art">
  <video autoplay muted loop src="/clip.mp4"></video>
  <audio autoplay src="/clip.mp4"></audio>
  <script>fetch('/master.m3u8').then(r => r.text());</script>
</body></html>`;

createServer((request, response) => {
  const routes = {
    '/': ['text/html; charset=utf-8', Buffer.from(page)],
    '/next': ['text/html; charset=utf-8', Buffer.from(page.replace('Runtime fixture', 'Runtime fixture next'))],
    '/image.png': ['image/png', icon],
    '/clip.mp4': ['video/mp4', clip],
    '/master.m3u8': ['application/vnd.apple.mpegurl', playlist]
  };
  const [type, body] = routes[request.url] || ['text/plain; charset=utf-8', Buffer.from('not found')];
  response.writeHead(routes[request.url] ? 200 : 404, { 'content-type': type, 'content-length': body.length, 'cache-control': 'no-store' });
  response.end(body);
}).listen(8765, '127.0.0.1', () => console.log('runtime fixture listening on 8765'));
