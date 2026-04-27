/**
 * @syllst/ja — Japanese-specific extensions for the Syllst ecosystem.
 *
 * Exports:
 *   - {@link normalizeJapanese} — text normalization
 *   - {@link compareJaSyllabi} — Japanese-aware comparison
 *   - {@link SyllabiIndex} — one-pass AST indexer
 *   - {@link ExactMatchStrategy}, {@link EmbeddingMatchStrategy} — pluggable matchers
 */

export { normalizeJapanese } from './normalize.js';
export { compareJaSyllabi } from './compare/index.js';
export { SyllabiIndex } from './compare/syllabi-index.js';
export {
  ExactMatchStrategy,
  EmbeddingMatchStrategy,
  OllamaEmbedder,
} from './compare/strategies/index.js';
export type {
  JaCompareOptions,
  JaCompareResult,
} from './compare/types.js';
export type {
  MatchStrategy,
  ComparableItem,
  MatchResult,
  EmbeddingProvider,
} from './compare/strategies/types.js';
