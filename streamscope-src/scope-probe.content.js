/*
 * Media-element enumeration derived from xifangczy/cat-catch content-script.js.
 * Streamscope changes: autoplay provenance, frame reports, and bulk mute/pause.
 * Copyright (C) 2021-2026 xifangczy contributors
 * Copyright (C) 2026 Zovo
 * SPDX-License-Identifier: GPL-3.0-only
 */
(function scopeMediaProbe() {
  const ids = new WeakMap();
  const autoplaySeen = new WeakSet();
  let nextId = 1;
  let userInteracted = false;
  let reportTimer = null;

  addEventListener('pointerdown', () => { userInteracted = true; }, { capture: true, once: true });
  addEventListener('keydown', () => { userInteracted = true; }, { capture: true, once: true });

  function mediaId(element) {
    if (!ids.has(element)) ids.set(element, `media-${nextId++}`);
    return ids.get(element);
  }

  function sourceOf(element) {
    return element.currentSrc || element.src || element.querySelector('source[src]')?.src || '';
  }

  function describe(element) {
    return {
      id: mediaId(element),
      tag: element.tagName.toLowerCase(),
      source: sourceOf(element),
      autoplay: element.autoplay || autoplaySeen.has(element),
      playing: !element.paused && !element.ended,
      muted: element.muted,
      volume: element.volume,
      duration: Number.isFinite(element.duration) ? element.duration : 0,
      readyState: element.readyState,
      controls: element.controls
    };
  }

  function elements() {
    return Array.from(document.querySelectorAll('video, audio'));
  }

  function report() {
    clearTimeout(reportTimer);
    chrome.runtime.sendMessage({ type: 'ssx:mediaReport', elements: elements().map(describe) }).catch(() => {});
  }

  function scheduleReport() {
    clearTimeout(reportTimer);
    reportTimer = setTimeout(report, 120);
  }

  function control(action) {
    const list = elements();
    let affected = 0;
    for (const element of list) {
      if (action === 'mute') {
        if (!element.muted) affected += 1;
        element.muted = true;
      }
      if (action === 'pause') {
        if (!element.paused) affected += 1;
        element.pause();
      }
    }
    report();
    return affected;
  }

  document.addEventListener('play', (event) => {
    if (event.target instanceof HTMLMediaElement && (event.target.autoplay || !userInteracted)) autoplaySeen.add(event.target);
    scheduleReport();
  }, true);
  document.addEventListener('pause', scheduleReport, true);
  document.addEventListener('volumechange', scheduleReport, true);
  document.addEventListener('loadedmetadata', scheduleReport, true);

  new MutationObserver(scheduleReport).observe(document.documentElement || document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'autoplay']
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'ssx:control') return undefined;
    if (message.action === 'report') {
      report();
      sendResponse({ affected: 0 });
      return true;
    }
    sendResponse({ affected: control(message.action) });
    return true;
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', report, { once: true });
  else report();
})();
