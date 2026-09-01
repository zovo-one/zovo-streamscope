# Runtime verification

Chrome for Testing 152 loaded the final MV3 build from `dist/` with extension ID `aiofomoohdnaioekjbankniihikacnnm`. A local fixture page requested an MP4, an HLS playlist, and a PNG and contained live video and audio elements.

## Passive request inventory

The service worker recorded exactly three successful media responses for the fixture tab:

| Request | Kind | Container / codec family | Content length |
|---|---|---|---:|
| `clip.mp4` | video | MP4 · H264/AAC | 24 B |
| `playlist.m3u8` | playlist | HLS | 46 B |
| `pixel.png` | image | PNG | 13,568 B |

The toolbar badge read `3`. The popup rendered the same three records and did not include a deliberately failed response.

## Media-element controls

- Content script reported two elements: one video and one audio.
- Autoplay detection reported `true` before first user interaction.
- Mute all returned one affected element and the audio element became muted.
- Pause all was dispatched through the same all-frames control channel.
- After top-level navigation, the three live entries were present in session history.

## URL handoff and safety

- Clicking Copy placed `http://127.0.0.1:8765/clip.mp4` on the clipboard and displayed `Stream URL copied`.
- `chrome.downloads` was absent from the extension runtime.
- The manifest has no `downloads` permission.

## Popup DOM proof

```json
{
  "ready": "complete",
  "title": "Zovo Streamscope",
  "heroCount": "3",
  "requestCards": 3,
  "elementCards": 2,
  "elementsPanelHidden": false,
  "toast": "Stream URL copied"
}
```

Result: **PASS**.
