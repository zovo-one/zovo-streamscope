/*
 * Derived from the response-header and file-type parsing core in xifangczy/cat-catch.
 * Streamscope changes: passive inventory-only classification, image support, codec hints,
 * bounded session records, and no download/fetch/write paths.
 * Copyright (C) 2021-2026 xifangczy contributors
 * Copyright (C) 2026 Zovo
 * SPDX-License-Identifier: GPL-3.0-only
 */
(function exposeScopeMediaLogic(target) {
  const EXTENSIONS = new Set([
    'aac', 'apng', 'avif', 'avi', 'bmp', 'flac', 'flv', 'gif', 'heic', 'jpeg', 'jpg',
    'm3u8', 'm4a', 'm4s', 'mkv', 'mov', 'mp3', 'mp4', 'mpd', 'mpeg', 'mpg', 'oga',
    'ogg', 'ogv', 'opus', 'png', 'svg', 'ts', 'wav', 'webm', 'webp', 'wmv'
  ]);
  const AUDIO = new Set(['aac', 'flac', 'm4a', 'mp3', 'oga', 'ogg', 'opus', 'wav']);
  const IMAGE = new Set(['apng', 'avif', 'bmp', 'gif', 'heic', 'jpeg', 'jpg', 'png', 'svg', 'webp']);

  function cleanMime(value) {
    return String(value || '').split(';')[0].trim().toLowerCase();
  }

  function extensionOf(url) {
    try {
      const name = new URL(url).pathname.split('/').pop() || '';
      const dot = name.lastIndexOf('.');
      return dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
    } catch (_error) {
      return '';
    }
  }

  function headersOf(responseHeaders) {
    const parsed = { mime: '', bytes: 0, disposition: '' };
    for (const raw of responseHeaders || []) {
      const name = String(raw.name || '').toLowerCase();
      const value = String(raw.value || '');
      if (name === 'content-type') parsed.mime = cleanMime(value);
      if (name === 'content-disposition') parsed.disposition = value;
      if (name === 'content-length' && Number.isFinite(Number(value))) parsed.bytes = Number(value);
      if (name === 'content-range') {
        const total = value.split('/')[1];
        if (total && total !== '*' && Number.isFinite(Number(total))) parsed.bytes = Number(total);
      }
    }
    return parsed;
  }

  function isMedia(details, headers) {
    if (Number(details.statusCode || 0) >= 400) return false;
    const mime = headers.mime;
    const ext = extensionOf(details.url);
    if (/^(audio|video|image)\//.test(mime)) return true;
    if (/mpegurl|dash\+xml/.test(mime)) return true;
    if (details.type === 'media' || details.type === 'image') return true;
    return EXTENSIONS.has(ext);
  }

  function hintFor(url, mime) {
    const ext = extensionOf(url);
    const normalized = cleanMime(mime);
    let container = ext ? ext.toUpperCase() : 'MEDIA';
    let codec = '';
    if (ext === 'm3u8' || /mpegurl/.test(normalized)) container = 'HLS';
    else if (ext === 'mpd' || /dash\+xml/.test(normalized)) container = 'DASH';
    else if (['m4s', 'ts'].includes(ext)) container = `${ext.toUpperCase()} segment`;
    else if (/mp4/.test(normalized) || ['mp4', 'm4a', 'm4s'].includes(ext)) {
      container = ext === 'm4a' ? 'M4A' : 'MP4';
      codec = ext === 'm4a' ? 'AAC family' : 'H.264 / AAC family';
    } else if (/webm/.test(normalized) || ext === 'webm') {
      container = 'WebM';
      codec = 'VPx / Opus family';
    } else if (/ogg/.test(normalized) || ['ogg', 'oga', 'ogv', 'opus'].includes(ext)) {
      container = ext === 'opus' ? 'Opus' : 'Ogg';
      codec = 'Vorbis / Opus family';
    } else if (/image\//.test(normalized) && !ext) {
      container = normalized.split('/')[1]?.toUpperCase() || 'IMAGE';
    }
    return { container, codec };
  }

  function kindFor(url, mime) {
    const ext = extensionOf(url);
    const normalized = cleanMime(mime);
    if (normalized.startsWith('image/') || IMAGE.has(ext)) return 'image';
    if (normalized.startsWith('audio/') || AUDIO.has(ext)) return 'audio';
    if (ext === 'm3u8' || ext === 'mpd' || /mpegurl|dash\+xml/.test(normalized)) return 'playlist';
    if (['m4s', 'ts'].includes(ext)) return 'segment';
    return 'video';
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      url.username = '';
      url.password = '';
      return url.href;
    } catch (_error) {
      return String(value || '');
    }
  }

  function makeEntry(details, tab) {
    const headers = headersOf(details.responseHeaders);
    const url = safeUrl(details.url);
    const hint = hintFor(url, headers.mime);
    return {
      id: `${details.tabId}:${details.requestId}`,
      tabId: details.tabId,
      url,
      pageUrl: tab?.url || details.initiator || '',
      pageTitle: tab?.title || 'Untitled tab',
      kind: kindFor(url, headers.mime),
      mime: headers.mime || 'unknown',
      bytes: headers.bytes || 0,
      container: hint.container,
      codec: hint.codec,
      requestType: details.type || 'other',
      statusCode: details.statusCode || 0,
      seenAt: Date.now()
    };
  }

  target.ScopeMediaLogic = { extensionOf, headersOf, isMedia, hintFor, kindFor, safeUrl, makeEntry };
})(globalThis);
