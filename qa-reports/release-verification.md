# Release verification

## Fundamental baseline

- Upstream commit: `72d54e74583405fb5659fc8cf37e47c06bc8d754`
- Upstream manifest: MV3 with `js/background.js` service worker.
- Authoritative upstream build entry: load the repository root unpacked.
- Unmodified root-unpacked baseline: PASS in Chrome for Testing 152.
- Optional upstream `just quick`: FAILS unchanged because its root `*.js` glob has no match and the recipe does not stage `manifest.json`. This was recorded, not patched around.

See `upstream-baseline.md` for the complete evidence.

## Product gates

- deterministic build with required Supabase publishable key: PASS
- unit tests, including licence `valid: true` grant semantics: PASS
- MV3/package/forbidden-permission check: PASS
- JavaScript syntax check: PASS
- live request inventory, URL copy, autoplay enumeration, controls, badge, and session history: PASS
- mandatory phase-6 capture and four-round design critic loop: PASS
- compliance scan: CLEAN
- fleet divergence scan: `ready: true`
- GPL source and changes statement: PASS
- Chrome Web Store submission: intentionally NOT performed

Final test run: 9 tests passed, 0 failed. `check-dist` passed across 18 files. The
manifest reports MV3, version 1.0.0, and no `downloads` permission.

Final compliance output:

```text
COMPLIANCE: CLEAN — 0 violations.
```

Final fleet-divergence output:

```json
{
  "desc_len": 120,
  "brand": 1,
  "residual_zovo": 0,
  "files_compared": 477,
  "icons_compared": 17,
  "BLOCK": [],
  "FIX": [],
  "WARN": ["broad host_permissions ['<all_urls>'] (justify or narrow)"],
  "ready": true
}
```

The single warning is justified in the listing and reviewer note: media is
commonly served from cross-origin CDN hosts, and the listener is observe-only.

## Differentiation

The batch-1 sibling is a media-sniffing/downloader surface. This product is an observe-only per-tab diagnostic instrument with external-player URL handoff, live element controls, and session history. It uses a unique `ssx` DOM/storage namespace, unique `scope-*` scripts and `scope-deck.css`, and original optical-scope art.
