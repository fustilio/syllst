/**
 * Japanese-specific comparison types.
 */

import type { MatchResult } from './strategies/types.js';

export interface JaCompareOptions {
  /** Use semantic embedding matching for vocabulary (default: false) */
  useEmbeddings?: boolean;
  /** Ollama base URL for embeddings */
  ollamaUrl?: string;
  /** Embedding model name */
  embeddingModel?: string;
  /** Similarity threshold for embedding matches (0-1) */
  embeddingThreshold?: number;
  /** Cache embeddings to this path */
  embeddingCachePath?: string;
}

export interface JaCompareResult {
  /** Exact-match results */
  exact: {
    vocab: MatchResult;
    grammar: MatchResult;
    examples: MatchResult;
    characters: MatchResult;
  };
  /** Semantic-match results (if useEmbeddings is true) */
  semantic?: {
    vocab: MatchResult;
    grammar: MatchResult;
    examples: MatchResult;
    characters: MatchResult;
  };
  /** Overall score combining exact + semantic */
  overallScore: number;
  /** Statistics about the compared syllabi */
  stats: {
    countsA: Record<string, number>;
    countsB: Record<string, number>;
  };
}
