# @syllst/word-lists

## 0.6.1

### Patch Changes

- fc7e388: `@syllst/word-lists`: the compact-JSON expansion logic (`expandWordListJson` / `CompactWordListJson`) now has a single implementation in `utils/word-lists.ts`; the Node FS loader and the browser loader import it instead of carrying their own drifted copies. Docstrings that told consumers to import the loaders from `@syllst/content-shared` now name the correct package. `@syllst/ja`: the `@syllst/core` peer range is `>=0.6.1` instead of an exact `0.6.1` pin that no release of core could satisfy anymore.

## 0.6.0

### Minor Changes

- Add `reading?: string | Record<string, string>` to `WordListItem` for CJK script-internal readings (e.g. JA `{ hiragana: "あたま", romaji: "atama" }`) — semantically distinct from `transcription`. Add `partOfSpeech?: string` to `WordListSet` as an inheritable default; items without `partOfSpeech` resolve to the set's value via the new `resolveItemPartOfSpeech(set, item)` helper. Inheritance happens at resolution time, not parse time — parsed JSON stays faithful to source.

  Existing legacy-shape `transcription` objects in ingestion paths now build the canonical `{ schemes, primary? }` shape (read-compat for legacy reads is preserved via `@syllst/core`'s normalizer).

  Add `parseWordListSet(raw): WordListSet` — a tolerant parser that normalizes the variety of authoring shapes (peer-scheme, `{scheme, value}`, `{primary, ipa, ...}`, bare-string transcription, legacy flat `ipa`/`transliteration`, bare-string words, set-level `pos`/`cat`/`level` aliases, CJK `reading`) into the canonical `WordListSet`. Deprecation warnings (one-shot) fire for `transcriptions` plural and set-level `pos`. Adds `parsedJsonDescriptor(meta, loader)` — like `jsonDescriptor` but routes JSON through `parseWordListSet` so consumers always see canonical shape. 20 tests cover the tolerated shapes and the malformed-input throw cases.

### Patch Changes

- Updated dependencies
  - @syllst/core@0.7.0

## 0.5.0

### Minor Changes

- Change `jsonDescriptor` signature to accept a loader function instead of a string path.

  **Breaking change:** The second argument is now `() => Promise<{ default: unknown }>` instead of `string`. Consumers must pass `() => import("./json/...")` rather than the raw path string.

  This fixes module resolution: the `import()` call is now lexically in the consumer's module, so it resolves relative to the consumer's package instead of `@syllst/word-lists`.

## 0.4.0

### Minor Changes

- Add `jsonDescriptor` factory function and `WordListSource` type to `word-list-catalog`. The `jsonDescriptor` helper creates a `WordListSetDescriptor` that lazily loads and expands a JSON word list file. `WordListSource` provides structured metadata (name, url, license, accessedAt) for tracking where word list data originates.

## 0.3.1

### Patch Changes

- update config
- Updated dependencies
  - @syllst/core@0.6.1

## 0.3.0

### Minor Changes

- Add descriptor-based lazy loading API

  - New `WordListSetDescriptor` type: metadata eager, payload lazy via `load()`
  - New `WordListCatalog` type with filter utilities
  - New `createWordListCatalog(descriptors)` factory
  - Exports `expandWordListJson` for use in custom `load()` functions
  - Mirrors the parallel-text descriptor pattern used in polyglot-bundles

## 0.2.0

### Minor Changes

- New package: Extracted word list types, loaders, and utilities into dedicated @syllst/word-lists package. Includes word list types (WordListItem, WordListSet), Node.js and browser loaders, ingestion converters (Anki, CSV, frequency lists), word ID utilities, and merge/deduplication utilities.
