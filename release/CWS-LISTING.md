# Chrome Web Store listing draft

## Product name

Zovo Streamscope

## Summary

Passive per-tab media inspector for stream URLs, format hints, page players, and session history. Never downloads files.

## Category

Productivity

## Detailed description

See the media a page loads without turning your browser into a downloader.

Zovo Streamscope is a passive per-tab inspector for audio, video, image, HLS, and DASH requests. Open the popup to see the request type, container or codec family, content length, and the exact stream URL. Copy a URL with one click and hand it to the external player or diagnostic tool you already trust.

The Elements view inventories the live audio and video elements on the current page, identifies autoplay, and gives you mute-all and pause-all controls. The toolbar badge shows the number of media requests observed in the active tab. Session History keeps a bounded list of streams from earlier page navigations until the browser session ends.

Privacy by design:

- no media downloads, recording, merging, fetching, or file writes
- no DRM bypass or protected-media capture
- no analytics, advertising, or sale of browsing data
- observed URLs and session history remain in Chrome session storage
- a network request is made only when you choose to verify an optional licence key

Free includes the complete live inspector and controls, with an 80-item session-history limit. Optional Pro raises that limit to 500. Because this is GPL-3.0 software, recipients may inspect, modify, and rebuild the source, including without the packaged limit.

Pricing: https://zovo.one/pricing

Complete modified source: https://github.com/theluckystrike/zovo-streamscope

## Store questionnaire

- Single purpose: inspect media requests and live page media elements for the active tab.
- Remote code: No.
- Data sale: No.
- Analytics: No.
- Ads: No.
- Account required: No.
- Website content handled: request URLs and response headers needed to classify media; audio/video element state needed for user-invoked controls.

## Permission justifications

- `tabs`: identify the active tab, associate observations with it, and update its badge.
- `webRequest`: observe response headers and URLs so media requests can be classified. It is non-blocking and does not alter traffic.
- `storage`: hold bounded live inventory, session history, element state, and licence state.
- `webNavigation`: archive a tab's inventory when its top-level page changes.
- `clipboardWrite`: copy a user-selected stream URL.
- `<all_urls>`: media may be served from a CDN or origin different from the visible page. Inspection is passive and no request body is read.

## Submission status

Draft only. Do not submit until an account slot is freed; the launcher entry records all four publisher accounts at their publish cap.
