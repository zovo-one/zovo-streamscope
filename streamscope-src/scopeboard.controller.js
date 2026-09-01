/*
 * Streamscope popup controller.
 * Copyright (C) 2026 Zovo · SPDX-License-Identifier: GPL-3.0-only
 */
(function scopeboardController() {
  let tabId = -1;
  let snapshot = { live: [], history: [], elements: [], limits: { freeHistory: 80, proHistory: 500 } };
  let licence = { valid: false };
  let toastTimer = null;

  const byId = (id) => document.getElementById(id);
  const liveList = byId('ssx-live-list');
  const historyList = byId('ssx-history-list');
  const elementList = byId('ssx-element-list');

  function formatBytes(bytes) {
    if (!bytes) return 'Size unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
    return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
  }

  function fileLabel(item) {
    try {
      const name = decodeURIComponent(new URL(item.url).pathname.split('/').pop() || 'stream');
      return name || item.container || 'stream';
    } catch (_error) {
      return item.container || 'stream';
    }
  }

  function hostOf(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.host : 'Current tab ready';
    } catch (_error) { return 'Current tab ready'; }
  }

  function showToast(message) {
    const toast = byId('ssx-toast');
    toast.textContent = message;
    toast.dataset.show = 'true';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.dataset.show = 'false'; }, 1800);
  }

  function iconFor(kind) {
    const wrap = document.createElement('span');
    wrap.className = 'ssx-kind-icon';
    wrap.innerHTML = kind === 'image'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>'
      : kind === 'audio'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>'
        : kind === 'playlist'
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h12M4 11h12M4 16h8"/><path d="m17 14 4 3-4 3Z"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/></svg>';
    return wrap;
  }

  function emptyState(title, detail) {
    const empty = document.createElement('div');
    empty.className = 'ssx-empty';
    const art = document.createElement('div');
    art.className = 'ssx-empty-illustration';
    art.setAttribute('aria-hidden', 'true');
    const heading = document.createElement('strong');
    heading.textContent = title;
    const copy = document.createElement('p');
    copy.textContent = detail;
    empty.append(art, heading, copy);
    return empty;
  }

  function streamCard(item, historical = false) {
    const card = document.createElement('article');
    card.className = 'ssx-stream-card';
    const head = document.createElement('div');
    head.className = 'ssx-stream-head';
    const title = document.createElement('div');
    title.className = 'ssx-stream-title';
    const titleText = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = fileLabel(item);
    strong.title = strong.textContent;
    const small = document.createElement('small');
    small.textContent = historical ? hostOf(item.pageUrl) : item.mime;
    titleText.append(strong, small);
    title.append(iconFor(item.kind), titleText);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'ssx-copy-button';
    copy.textContent = 'Copy URL';
    copy.setAttribute('aria-label', `Copy URL for ${strong.textContent}`);
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(item.url); showToast('Stream URL copied'); }
      catch (_error) { showToast('Clipboard access was unavailable'); }
    });
    head.append(title, copy);
    const meta = document.createElement('div');
    meta.className = 'ssx-stream-meta';
    [item.kind, item.codec ? `${item.container} · ${item.codec}` : item.container, formatBytes(item.bytes)].forEach((value) => {
      const chip = document.createElement('span');
      chip.className = 'ssx-chip';
      chip.textContent = value;
      meta.append(chip);
    });
    const url = document.createElement('code');
    url.className = 'ssx-stream-url';
    url.textContent = item.url;
    url.title = item.url;
    card.append(head, meta, url);
    return card;
  }

  function renderStreams(list, target, historical, emptyTitle, emptyDetail) {
    target.replaceChildren();
    if (!list.length) { target.append(emptyState(emptyTitle, emptyDetail)); return; }
    const fragment = document.createDocumentFragment();
    list.forEach((item) => fragment.append(streamCard(item, historical)));
    target.append(fragment);
  }

  function renderElements() {
    elementList.replaceChildren();
    if (!snapshot.elements.length) {
      elementList.append(emptyState('No live players yet', 'Video and audio elements will appear here as the page creates them.'));
      return;
    }
    snapshot.elements.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'ssx-element-card';
      const head = document.createElement('div');
      head.className = 'ssx-element-head';
      const title = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = item.tag;
      title.append(strong);
      if (item.autoplay) {
        const badge = document.createElement('span');
        badge.className = 'ssx-autoplay';
        badge.textContent = 'AUTOPLAY';
        title.append(badge);
      }
      const state = document.createElement('span');
      state.className = 'ssx-state';
      state.textContent = `${item.playing ? 'Playing' : 'Paused'} · ${item.muted ? 'Muted' : 'Sound on'}`;
      head.append(title, state);
      const source = document.createElement('p');
      source.textContent = item.source || 'Source assigned by the page';
      source.title = source.textContent;
      card.append(head, source);
      elementList.append(card);
    });
  }

  function render() {
    byId('ssx-live-count').textContent = String(snapshot.live.length);
    byId('ssx-element-count').textContent = String(snapshot.elements.length);
    byId('ssx-history-count').textContent = String(snapshot.history.length);
    byId('ssx-history-limit').textContent = licence.valid
      ? `Pro keeps up to ${snapshot.limits.proHistory} observed URLs in this browser session.`
      : `Free keeps up to ${snapshot.limits.freeHistory} observed URLs in this browser session.`;
    byId('ssx-upgrade').hidden = licence.valid === true;
    renderStreams(snapshot.live, liveList, false, 'Listening for media', 'Start playback or scroll the page. Observed stream and image URLs will appear automatically.');
    renderStreams(snapshot.history, historyList, true, 'History is clear', 'URLs from previous page visits in this browser session will collect here.');
    renderElements();
  }

  async function refresh() {
    if (tabId < 0) return;
    try {
      snapshot = await chrome.runtime.sendMessage({ type: 'ssx:getSnapshot', tabId });
      licence = await ScopeLicence.getLicense();
      render();
    } catch (_error) {
      byId('ssx-status').lastChild.textContent = ' Unavailable';
    }
  }

  function selectPanel(name) {
    document.querySelectorAll('[role="tab"]').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.panel === name)));
    ['live', 'elements', 'history'].forEach((panel) => { byId(`ssx-${panel}-panel`).hidden = panel !== name; });
  }

  document.querySelectorAll('[role="tab"]').forEach((tab) => tab.addEventListener('click', () => selectPanel(tab.dataset.panel)));
  byId('ssx-clear-live').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'ssx:clearLive', tabId }); await refresh(); showToast('Current page archived'); });
  byId('ssx-clear-history').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'ssx:clearHistory', tabId }); await refresh(); showToast('Session history cleared'); });
  byId('ssx-mute-all').addEventListener('click', async () => { const result = await chrome.runtime.sendMessage({ type: 'ssx:controlAll', tabId, action: 'mute' }); showToast(`${result.affected} player${result.affected === 1 ? '' : 's'} muted`); await refresh(); });
  byId('ssx-pause-all').addEventListener('click', async () => { const result = await chrome.runtime.sendMessage({ type: 'ssx:controlAll', tabId, action: 'pause' }); showToast(`${result.affected} player${result.affected === 1 ? '' : 's'} paused`); await refresh(); });
  byId('ssx-open-settings').addEventListener('click', () => chrome.runtime.openOptionsPage());

  chrome.runtime.onMessage.addListener((message) => { if (message?.type === 'ssx:changed' && message.tabId === tabId) refresh(); });
  chrome.storage.onChanged.addListener((changes) => { if (Object.keys(changes).some((key) => key.startsWith('ssx.'))) refresh(); });

  const requestedTabId = Number(new URL(location.href).searchParams.get('tabId'));
  const tabPromise = requestedTabId > 0
    ? chrome.tabs.get(requestedTabId).then((tab) => [tab]).catch(() => [])
    : chrome.tabs.query({ active: true, currentWindow: true });
  tabPromise.then(async ([tab]) => {
    tabId = tab?.id ?? -1;
    byId('ssx-tab-host').textContent = hostOf(tab?.url || '');
    if (tabId >= 0) await chrome.runtime.sendMessage({ type: 'ssx:refreshElements', tabId }).catch(() => {});
    await refresh();
  });
})();
