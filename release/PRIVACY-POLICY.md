# Zovo Streamscope privacy policy

Effective: 1 September 2026

Zovo Streamscope passively observes media request URLs and selected response headers in your browser so it can show an inventory for the current tab. It also reads the state of audio and video elements on a page so you can identify autoplay and invoke mute-all or pause-all.

Observed media URLs, derived format metadata, page media-element state, and bounded history are stored only in `chrome.storage.session`. Chrome removes session storage when the browser session ends. Zovo Streamscope does not download media, read response bodies, record playback, bypass DRM, or write media files.

The extension does not sell data, display ads, run analytics, or transmit browsing history. It makes no network request of its own during normal inspection. If you enter an optional licence key and press Verify, the key and product identifier are sent over HTTPS to Zovo's Supabase licence-verification function. The response is used only to decide whether the packaged history limit should be raised. Do not enter secrets other than a licence key in that field.

The extension uses these Chrome capabilities: tabs and webNavigation for per-tab state, webRequest and host access for passive response classification, storage for session and licence state, and clipboardWrite for a copy action the user initiates.

Complete source code is published at https://github.com/theluckystrike/zovo-streamscope under GPL-3.0-only. Questions may be sent through the support contact at https://zovo.one.
