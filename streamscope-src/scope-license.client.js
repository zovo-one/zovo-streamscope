/*
 * Zovo licence layer 5.95 for Streamscope.
 * Copyright (C) 2026 Zovo
 * SPDX-License-Identifier: GPL-3.0-only
 */
(function exposeScopeLicence(target) {
  const KEY_RE = /^ZOVO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  const VERIFY_URL = 'https://zgubxqomnbmxgbdhvwja.supabase.co/functions/v1/verify-extension-license';
  const API_KEY = '__SUPABASE_ANON_KEY__';
  const STORAGE_KEY = 'ssx.scopeLicenceV1';

  function normalizeKey(raw) {
    return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  }

  function keyHasValidShape(raw) {
    return KEY_RE.test(normalizeKey(raw));
  }

  async function getLicense() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      const saved = result[STORAGE_KEY];
      if (saved?.valid === true && keyHasValidShape(saved.key)) return saved;
    } catch (error) {
      console.warn('Could not read the saved licence.', error);
    }
    return { valid: false, key: '' };
  }

  async function activateLicense(raw) {
    const key = normalizeKey(raw);
    if (!KEY_RE.test(key)) return 'shape';
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(API_KEY)) return 'config';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: API_KEY,
          authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ license_key: key, extension: ['zovo', 'streamscope'].join('-') }),
        signal: controller.signal
      });
      if (!response.ok) return 'offline';
      const body = await response.json();
      if (body?.valid !== true) return 'invalid';
      await chrome.storage.sync.set({ [STORAGE_KEY]: { key, valid: true, activatedAt: Date.now() } });
      return 'ok';
    } catch (_error) {
      return 'offline';
    } finally {
      clearTimeout(timer);
    }
  }

  async function deactivateLicense() {
    await chrome.storage.sync.remove(STORAGE_KEY);
  }

  target.ScopeLicence = { STORAGE_KEY, normalizeKey, keyHasValidShape, getLicense, activateLicense, deactivateLicense };
})(globalThis);
