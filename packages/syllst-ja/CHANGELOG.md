# @syllst/ja

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
