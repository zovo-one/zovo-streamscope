# Zovo Streamscope upstream baseline

- Recorded: 2026-09-01 (Asia/Ho_Chi_Minh)
- Upstream: `https://github.com/xifangczy/cat-catch.git`
- Commit: `72d54e74583405fb5659fc8cf37e47c06bc8d754`
- Upstream commit date: `2026-08-31T23:12:46+08:00`
- Version: `2.7.2`
- Manifest: MV3 (`manifest_version: 3`), service worker `js/background.js`
- Baseline source: `/Users/mike/Desktop/zovo-ext/_source-builds/zovo-streamscope-upstream-baseline`

## Unmodified build entry

The fleet fundamentals README specifies **no build command** for this upstream: load the repository root unpacked because `manifest.json` is at the root. That required baseline passed in Chrome as recorded below.

For completeness, the repository also contains an upstream `justfile`. Its optional `just quick` packaging recipe was tested unchanged and failed.

Result: **FAILED (upstream finding; baseline was not patched).**

```text
验证 manifest.json...
Extension name: __MSG_catCatch__
Version: 2.7.2
准备构建目录...
mkdir -p build
cp -r ./{catch-script,css,img,js,lib,_locales} build/
cp -r ./*.{js,html} build/
cp: ./*.js: No such file or directory
error: recipe `prepare` failed on line 30 with exit code 1
```

The upstream recipe also does not stage `manifest.json` into `build/`, so that output cannot be loaded as an extension even if the unmatched `*.js` glob is ignored. This is recorded as an upstream build defect rather than silently changed in the baseline.

The first attempt also found that `just` was absent from the machine. After installing `just 1.58.0`, the command above reached the source-level failure.

## Unmodified Chrome runtime proof

Because upstream documents loading the source directory unpacked, the untouched source root was loaded with Chrome for Testing `152.0.7977.64` using `--disable-extensions-except` and `--load-extension`.

Observed extension ID: `hhnmbcpbllknbopcljegbmhhlapaimpn`.

Authoritative DevTools targets included:

```text
Service Worker chrome-extension://hhnmbcpbllknbopcljegbmhhlapaimpn/js/background.js
chrome-extension://hhnmbcpbllknbopcljegbmhhlapaimpn/install.html
chrome-extension://hhnmbcpbllknbopcljegbmhhlapaimpn/popup.html?tabId=1&type=tab
```

Install page runtime evidence:

```json
{"ready":"complete","title":"猫抓扩展安装成功","heading":"Installation Successful!","scripts":["js/function.js","js/install.js"],"styles":["css/install.css"]}
```

Popup runtime evidence:

```json
{"ready":"complete","title":"cat-catch","body":"Current Page\nOther Page\nMedia Control / Settings\nNo Fish\nMerge\nDownload\nCopy\nToggle\nFilter\nClear\nSearch\nCapture\nMore\nPause\nPopup","panels":0}
```

Baseline conclusion: the documented root-unpacked baseline passes. The current upstream is already MV3 and its runtime demonstrably loads and renders, so no MV3 port is required. Its optional repository packaging recipe is broken and must remain a disclosed upstream finding on the ship handoff.
