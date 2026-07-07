# @syllst/ja

## 0.2.2

### Patch Changes

- fc7e388: `@syllst/word-lists`: the compact-JSON expansion logic (`expandWordListJson` / `CompactWordListJson`) now has a single implementation in `utils/word-lists.ts`; the Node FS loader and the browser loader import it instead of carrying their own drifted copies. Docstrings that told consumers to import the loaders from `@syllst/content-shared` now name the correct package. `@syllst/ja`: the `@syllst/core` peer range is `>=0.6.1` instead of an exact `0.6.1` pin that no release of core could satisfy anymore.

## 0.2.1

### Patch Changes

- update config
- Updated dependencies
  - @syllst/compare@0.2.1
  - @syllst/core@0.6.1

## 0.2.0

### Minor Changes

- Add @syllst/ja package with Japanese-specific syllabus comparison tools.

  **New package: @syllst/ja**

  - `compareJaSyllabi()` — Japanese-aware comparison combining exact + semantic matching
  - `SyllabiIndex` — one-pass AST indexer (upstreamed to @syllst/compare)
  - `ExactMatchStrategy` — O(n+m) hash-based exact matching
  - `EmbeddingMatchStrategy` — semantic matching via Ollama embeddings with batch API
  - `OllamaEmbedder` — batch embedder with disk cache (64 items/batch)
  - `normalizeJapanese()` — Japanese text normalization

  **Upstreamed to @syllst/compare:**

  - `MatchStrategy` interface — pluggable comparison strategy
  - `ComparableItem`, `StrategyMatchResult`, `StrategyMatchedPair` types
  - `SyllabiIndex` class — one-pass AST indexer with typed node accessors

### Patch Changes

- Updated dependencies
  - @syllst/compare@0.2.0
