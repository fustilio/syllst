/**
 * Fidelity Test Types
 *
 * Types for round-trip testing: Anki → syllst → SRS cards,
 * comparing generated output against original Anki content.
 */

import type { SrsCard } from '../types.js';

export interface FidelityOptions {
  /** Minimum similarity score (0-1) to consider a field matched */
  similarityThreshold?: number;
  /** Normalize text before comparing (strip HTML, lowercase, etc.) */
  normalizeText?: boolean;
  /** Consider sourceRef matching when pairing cards */
  matchBySourceRef?: boolean;
}

export interface FieldFidelity {
  /** Field name (e.g. 'targetText', 'translation', 'transcription') */
  field: string;
  /** Number of Anki cards that had this field */
  ankiCardsWithField: number;
  /** Number of SRS cards that matched this field */
  srsCardsMatched: number;
  /** Average similarity score (0-1) */
  averageScore: number;
}

export interface FidelityReport {
  /** Source deck name/path */
  sourceDeck: string;
  /** Total Anki cards in source */
  totalAnkiCards: number;
  /** Total SRS cards generated */
  totalSrsCards: number;
  /** Coverage by content type */
  coverage: {
    vocabularyItems: number;
    grammarRules: number;
    examples: number;
    characterItems: number;
    exercises: number;
  };
  /** Per-field fidelity scores */
  fieldFidelity: FieldFidelity[];
  /** Anki card IDs with no matching SRS card */
  missingContent: string[];
  /** SRS cards with no matching Anki source */
  unmatchedSrsCards: string[];
  /** Overall fidelity score (0-1) */
  overallScore: number;
}

/** Anki card representation for comparison */
export interface AnkiCardForComparison {
  id: string;
  front: string;
  back: string;
  fields: Record<string, string>;
  tags: string[];
  deckName: string;
}

/** Pair of matched Anki and SRS cards */
export interface CardPair {
  ankiCard: AnkiCardForComparison;
  srsCard: SrsCard;
  similarity: number;
}
