# Zovo Streamscope ship handoff

Status: **submit-ready draft — do not submit**

The launcher card for this product states that all four publisher accounts are at their publish cap. No Chrome Web Store submission or draft mutation was attempted. Free a slot before upload.

## Upload fields

- Name: Zovo Streamscope
- Version: 1.0.0
- Category: Productivity
- Language: English
- Remote code: No
- Source: https://github.com/theluckystrike/zovo-streamscope
- Pricing: https://zovo.one/pricing
- Privacy policy: `PRIVACY-POLICY.md`
- Listing copy and permission answers: `CWS-LISTING.md`

## Required upload assets

- package: `Zovo-Streamscope-v1.0.0.zip`
- store icon: `store-assets/store-icon-128.png`
- screenshots: `store-assets/screenshot-01.png` through `screenshot-03.png`
- small promo tile: `store-assets/promo-small.png`
- marquee promo tile: `store-assets/promo-marquee.png`

## Reviewer note

The extension observes URLs and response headers with non-blocking `webRequest` so it can classify media loaded by the active tab. It does not read response bodies or alter traffic. Broad host access is required because page media is commonly served by unrelated CDN origins. It requests no downloads permission and contains no download, recording, merge, DRM-capture, or media-fetch path.

## Legal note

This is a modified GPL-3.0-only fork. Upstream notices and full history are preserved in the public repository, changes are documented, and the complete corresponding source is available at the link above. The optional packaged history limit is not a technical restriction on GPL recipients: anyone may modify or rebuild the source without it.
