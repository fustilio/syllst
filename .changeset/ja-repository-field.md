---
"@syllst/ja": patch
---

Add the `repository` field so npm OIDC provenance validation passes. `@syllst/ja` was the only publishable package missing it, which caused its publish to fail with `E422 ... "repository.url" is ""`.
