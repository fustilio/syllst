# @syllst/word-lists

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
