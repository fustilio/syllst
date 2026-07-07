---
"@syllst/word-lists": patch
"@syllst/ja": patch
---

`@syllst/word-lists`: the compact-JSON expansion logic (`expandWordListJson` / `CompactWordListJson`) now has a single implementation in `utils/word-lists.ts`; the Node FS loader and the browser loader import it instead of carrying their own drifted copies. Docstrings that told consumers to import the loaders from `@syllst/content-shared` now name the correct package. `@syllst/ja`: the `@syllst/core` peer range is `>=0.6.1` instead of an exact `0.6.1` pin that no release of core could satisfy anymore.
