/*
 * Streamscope settings controller.
 * Copyright (C) 2026 Zovo · SPDX-License-Identifier: GPL-3.0-only
 */
(function scopeSettingsController() {
  const byId = (id) => document.getElementById(id);
  let toastTimer = null;

  function showToast(message) {
    const toast = byId('ssx-toast');
    toast.textContent = message;
    toast.dataset.show = 'true';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.dataset.show = 'false'; }, 2200);
  }

  async function renderLicence() {
    const licence = await ScopeLicence.getLicense();
    byId('ssx-licence-state').textContent = licence.valid === true ? 'PRO ACTIVE' : 'FREE';
    byId('ssx-licence-state').dataset.active = String(licence.valid === true);
    byId('ssx-deactivate').hidden = licence.valid !== true;
    byId('ssx-activate').hidden = licence.valid === true;
    byId('ssx-licence-key').disabled = licence.valid === true;
    byId('ssx-licence-key').value = licence.valid === true ? licence.key : '';
  }

  byId('ssx-activate').addEventListener('click', async () => {
    const button = byId('ssx-activate');
    button.disabled = true;
    button.textContent = 'Checking…';
    const outcome = await ScopeLicence.activateLicense(byId('ssx-licence-key').value);
    const messages = {
      ok: 'Licence activated. Session capacity is now 500 URLs.',
      shape: 'Use the key format shown below the field.',
      invalid: 'That key was not valid.',
      offline: 'Verification is unavailable. Your current access is unchanged.',
      config: 'This build is missing its verification configuration.'
    };
    showToast(messages[outcome] || 'Licence could not be checked.');
    button.disabled = false;
    button.textContent = 'Activate key';
    await renderLicence();
  });

  byId('ssx-deactivate').addEventListener('click', async () => {
    await ScopeLicence.deactivateLicense();
    await renderLicence();
    showToast('Licence removed from sync storage.');
  });

  byId('ssx-clear-session').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'ssx:clearHistory', tabId: -1 });
    showToast('Session history cleared.');
  });

  byId('ssx-get-key').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://zovo.one/pricing' });
  });

  renderLicence().catch(() => showToast('Licence status is unavailable.'));
})();
