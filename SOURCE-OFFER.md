# Complete corresponding source

This program is free software licensed under GPL-3.0-only. The complete modified
source, upstream notices, build scripts, tests, and change record are published at:

https://github.com/theluckystrike/zovo-streamscope

Build the Chrome MV3 distribution with:

```sh
SUPABASE_ANON_KEY=sb_publishable_your_public_key npm run build
```

The publishable Supabase anon key is embedded in the extension package by design;
no service-role or secret key belongs in this source or build.
