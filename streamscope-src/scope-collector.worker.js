/*
 * Passive per-tab collector derived from xifangczy/cat-catch's proven MV3
 * webRequest → response headers → per-tab cache → badge pipeline.
 * Streamscope changes: inventory-only records, chrome.storage session history,
 * live media-element state, and no download/fetch/write behavior.
 * Copyright (C) 2021-2026 xifangczy contributors
 * Copyright (C) 2026 Zovo
 * SPDX-License-Identifier: GPL-3.0-only
 */
importScripts('scope-media.logic.js', 'scope-license.client.js');

const LIVE_KEY = 'ssx.liveInventoryV1';
const HISTORY_KEY = 'ssx.sessionHistoryV1';
const ELEMENT_KEY = 'ssx.mediaElementsV1';
const FREE_HISTORY_LIMIT = 80;
const PRO_HISTORY_LIMIT = 500;
const LIVE_LIMIT = 250;
let liveByTab = {};
let history = [];
let elementsByTab = {};
let persistTimer = null;

async function hydrate() {
  const saved = await chrome.storage.session.get([LIVE_KEY, HISTORY_KEY, ELEMENT_KEY]);
  liveByTab = saved[LIVE_KEY] || {};
  history = saved[HISTORY_KEY] || [];
  elementsByTab = saved[ELEMENT_KEY] || {};
  for (const [tabId, entries] of Object.entries(liveByTab)) updateBadge(Number(tabId), entries.length);
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    const licence = await ScopeLicence.getLicense();
    const limit = licence.valid === true ? PRO_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
    history = history.slice(0, limit);
    await chrome.storage.session.set({
      [LIVE_KEY]: liveByTab,
      [HISTORY_KEY]: history,
      [ELEMENT_KEY]: elementsByTab
    });
  }, 120);
}

function updateBadge(tabId, count) {
  if (!Number.isInteger(tabId) || tabId < 0) return;
  const text = count > 999 ? '999+' : count ? String(count) : '';
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#0E7490' });
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setTitle({ tabId, title: count ? `${count} media request${count === 1 ? '' : 's'} observed` : 'No media observed on this page' });
}

function notifyChanged(tabId) {
  chrome.runtime.sendMessage({ type: 'ssx:changed', tabId }).catch(() => {});
}

async function recordResponse(details) {
  if (details.tabId < 0) return;
  const headers = ScopeMediaLogic.headersOf(details.responseHeaders);
  if (!ScopeMediaLogic.isMedia(details, headers)) return;
  let tab = null;
  try { tab = await chrome.tabs.get(details.tabId); } catch (_error) { return; }
  const entry = ScopeMediaLogic.makeEntry(details, tab);
  const key = String(details.tabId);
  const list = liveByTab[key] || [];
  const existing = list.findIndex((item) => item.url === entry.url);
  if (existing >= 0) list[existing] = { ...list[existing], ...entry, id: list[existing].id };
  else list.unshift(entry);
  liveByTab[key] = list.slice(0, LIVE_LIMIT);
  updateBadge(details.tabId, liveByTab[key].length);
  schedulePersist();
  notifyChanged(details.tabId);
}

function archiveTab(tabId, reason) {
  const key = String(tabId);
  const items = liveByTab[key] || [];
  if (items.length) {
    const endedAt = Date.now();
    const archived = items.map((item) => ({ ...item, endedAt, archiveReason: reason }));
    history = [...archived, ...history.filter((old) => !archived.some((item) => item.url === old.url && item.pageUrl === old.pageUrl))];
  }
  delete liveByTab[key];
  delete elementsByTab[key];
  updateBadge(tabId, 0);
  schedulePersist();
  notifyChanged(tabId);
}

async function sendControlToFrames(tabId, action) {
  let frames = [];
  try { frames = await chrome.webNavigation.getAllFrames({ tabId }); } catch (_error) { return { affected: 0 }; }
  const results = await Promise.all(frames.map(async (frame) => {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'ssx:control', action }, { frameId: frame.frameId });
      return Number(response?.affected || 0);
    } catch (_error) {
      return 0;
    }
  }));
  return { affected: results.reduce((sum, value) => sum + value, 0) };
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => { recordResponse(details).catch(() => {}); },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0 && details.tabId >= 0) archiveTab(details.tabId, 'navigation');
});

chrome.tabs.onRemoved.addListener((tabId) => archiveTab(tabId, 'tab-closed'));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return undefined;

  if (message.type === 'ssx:mediaReport' && sender.tab?.id >= 0) {
    const tabKey = String(sender.tab.id);
    const frameKey = String(sender.frameId || 0);
    elementsByTab[tabKey] ||= {};
    elementsByTab[tabKey][frameKey] = Array.isArray(message.elements) ? message.elements.slice(0, 50) : [];
    schedulePersist();
    notifyChanged(sender.tab.id);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'ssx:getSnapshot') {
    const tabId = Number(message.tabId);
    const frameMap = elementsByTab[String(tabId)] || {};
    sendResponse({
      live: liveByTab[String(tabId)] || [],
      history,
      elements: Object.values(frameMap).flat(),
      limits: { freeHistory: FREE_HISTORY_LIMIT, proHistory: PRO_HISTORY_LIMIT }
    });
    return true;
  }

  if (message.type === 'ssx:clearLive') {
    archiveTab(Number(message.tabId), 'manual-clear');
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'ssx:clearHistory') {
    history = [];
    schedulePersist();
    notifyChanged(Number(message.tabId));
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'ssx:controlAll') {
    sendControlToFrames(Number(message.tabId), message.action).then(sendResponse);
    return true;
  }

  if (message.type === 'ssx:refreshElements') {
    sendControlToFrames(Number(message.tabId), 'report').then(sendResponse);
    return true;
  }

  return undefined;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#0E7490' });
});

hydrate().catch(() => {});
