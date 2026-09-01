# Zovo Streamscope

A passive, per-tab media inspector for handing observed stream URLs to an external
player. It inventories audio, video, image, HLS, and DASH requests; exposes format
and size hints; enumerates page media elements; and keeps a browser-session history.
It does not download media files.

## Build

Requirements: Node.js 20+ and a Supabase publishable anon key.

```sh
SUPABASE_ANON_KEY=sb_publishable_your_public_key npm test
SUPABASE_ANON_KEY=sb_publishable_your_public_key npm run build
SUPABASE_ANON_KEY=sb_publishable_your_public_key npm run check
```

Load `dist/` as an unpacked MV3 extension.

## Source layout

- `streamscope-src/` — the shipped, uniquely namespaced product source.
- `scripts/` and `test/` — deterministic build and verification.
- all original upstream files — retained complete for provenance and GPL compliance.
- `CHANGES-STREAMSCOPE.md` — clear statement of modifications.
- `LICENSE` — GPL-3.0 licence text from upstream.

Upstream copyright remains with the xifangczy/cat-catch contributors. Streamscope
changes are Copyright (C) 2026 Zovo and are released under GPL-3.0-only.
