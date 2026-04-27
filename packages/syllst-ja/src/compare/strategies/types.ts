/**
 * Japanese-specific comparison strategy types.
 *
 * Core interfaces are imported from @syllst/compare.
 * This file only defines Japanese-specific extensions.
 */

export type {
  ComparableItem,
  StrategyMatchResult as MatchResult,
  StrategyMatchedPair as MatchedPair,
  MatchStrategy,
} from '@syllst/compare';

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  batchSize?: number;
}
