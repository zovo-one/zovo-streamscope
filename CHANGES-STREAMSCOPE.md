# Changes from upstream

Zovo Streamscope 1.0.0 is a differentiated GPL-3.0-only fork based on
`xifangczy/cat-catch` commit `72d54e74583405fb5659fc8cf37e47c06bc8d754`.

The complete upstream source and history remain in this repository. The shipped
extension is built from `streamscope-src/` and retains the proven passive
`webRequest` response-header inspection, per-tab cache/badge pattern, and
content-script media-element enumeration.

Material changes:

- Reframed the product around passive per-tab stream inspection and external-player URL handoff.
- Added audio, video, image, HLS, DASH, and segment classification with container/codec hints and content-length metadata.
- Added one-click clipboard copy for every observed URL.
- Added autoplay provenance plus per-tab live audio/video enumeration, mute-all, and pause-all controls.
- Added a toolbar count and bounded `chrome.storage.session` history across page navigations.
- Added a uniquely namespaced popup/settings UI, original icon art, dark mode, keyboard focus, and reduced-motion support.
- Added the licence layer 5.95 key shape, build-time Supabase configuration gate, and `valid: true` grant rule.
- Removed all shipped download, recorder, merge, media-fetch, and file-write paths; the extension does not request the `downloads` permission.

The paid wall controls only the shipped history-retention limit. Under GPL-3.0,
recipients may modify or rebuild the source without that limit.
