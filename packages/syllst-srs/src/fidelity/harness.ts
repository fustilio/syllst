/**
 * Round-Trip Fidelity Test Harness
 *
 * End-to-end runner: Anki deck → syllst → SRS cards → fidelity report.
 *
 * This is a thin orchestration layer. The actual Anki extraction
 * and syllst conversion live in polyglot-bundles. This harness
 * wires them together with the SRS generators and comparison logic.
 */

import type { SrsCard } from '../types.js';
import type {
  AnkiCardForComparison,
  FidelityOptions,
  FidelityReport,
} from './index.js';
import { compareCardSets, computeFieldFidelity } from './compare.js';

/**
 * Dependencies injected so this package stays independent of
 * polyglot-bundles and anki-reader.
 */
export interface FidelityHarnessDeps {
  /** Extract Anki cards from an APKG file path */
  extractAnkiCards: (apkgPath: string) => Promise<AnkiCardForComparison[]>;
  /** Convert Anki cards to syllst lessons */
  convertToSyllst: (
    cards: AnkiCardForComparison[],
    options: { fieldMap: Record<string, string>; deckName: string }
  ) => Promise<unknown[]>; // LessonAstNode[]
  /** Build SRS cards from syllst lessons */
  generateSrsCards: (lessons: unknown[]) => SrsCard[];
}

/**
 * Run a complete round-trip fidelity test.
 */
export async function runFidelityTest(
  apkgPath: string,
  deps: FidelityHarnessDeps,
  options: FidelityOptions & {
    fieldMap?: Record<string, string>;
    deckName?: string;
  } = {}
): Promise<FidelityReport> {
  const ankiCards = await deps.extractAnkiCards(apkgPath);
  const lessons = await deps.convertToSyllst(ankiCards, {
    fieldMap: options.fieldMap ?? {},
    deckName: options.deckName ?? 'unknown-deck',
  });
  const srsCards = deps.generateSrsCards(lessons);

  const pairs = compareCardSets(ankiCards, srsCards, options);
  const fieldFidelity = computeFieldFidelity(pairs, ankiCards);

  const matchedAnkiIds = new Set(pairs.map((p) => p.ankiCard.id));
  const matchedSrsIds = new Set(pairs.map((p) => p.srsCard.id));

  const missingContent = ankiCards
    .filter((c) => !matchedAnkiIds.has(c.id))
    .map((c) => c.id);

  const unmatchedSrsCards = srsCards
    .filter((c) => !matchedSrsIds.has(c.id))
    .map((c) => c.id);

  // Count coverage by sourceType
  const coverage = {
    vocabularyItems: srsCards.filter((c) => c.sourceType === 'vocabularyItem').length,
    grammarRules: srsCards.filter((c) => c.sourceType === 'grammarRule').length,
    examples: srsCards.filter((c) => c.sourceType === 'example').length,
    characterItems: srsCards.filter((c) => c.sourceType === 'characterItem').length,
    exercises: srsCards.filter((c) => c.sourceType === 'exercise').length,
  };

  const overallScore =
    pairs.length > 0
      ? pairs.reduce((sum, p) => sum + p.similarity, 0) / pairs.length
      : 0;

  return {
    sourceDeck: apkgPath,
    totalAnkiCards: ankiCards.length,
    totalSrsCards: srsCards.length,
    coverage,
    fieldFidelity,
    missingContent,
    unmatchedSrsCards,
    overallScore,
  };
}
