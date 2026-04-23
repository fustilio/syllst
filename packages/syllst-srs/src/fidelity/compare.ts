/**
 * Card Matching and Scoring Logic
 *
 * Compares Anki cards with generated SRS cards and produces
 * similarity scores.
 */

import type { SrsCard } from '../types.js';
import type {
  AnkiCardForComparison,
  CardPair,
  FidelityOptions,
  FieldFidelity,
} from './index.js';

export { compareCardSets, calculateSimilarity, normalizeText };

/**
 * Normalize text for comparison: strip HTML, lowercase, trim.
 */
function normalizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calculate string similarity using Levenshtein distance.
 * Returns a score between 0 (completely different) and 1 (identical).
 */
function calculateSimilarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  // Use a flat array for the DP matrix to avoid TS strict array issues
  const rows = b.length + 1;
  const cols = a.length + 1;
  const matrix = new Array<number>(rows * cols).fill(0);

  for (let i = 0; i < rows; i++) {
    matrix[i * cols] = i;
  }
  for (let j = 0; j < cols; j++) {
    matrix[j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const idx = i * cols + j;
      const diag = matrix[(i - 1) * cols + (j - 1)]!;
      const left = matrix[i * cols + (j - 1)]!;
      const up = matrix[(i - 1) * cols + j]!;

      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[idx] = diag;
      } else {
        matrix[idx] = Math.min(diag + 1, left + 1, up + 1);
      }
    }
  }

  return matrix[(rows - 1) * cols + (cols - 1)]!;
}

/**
 * Compare an Anki card with an SRS card and return a similarity score.
 */
function compareSingleCard(
  anki: AnkiCardForComparison,
  srs: SrsCard,
  options: FidelityOptions = {}
): number {
  const threshold = options.similarityThreshold ?? 0.6;

  // Compare front with prompt.text
  const frontScore = calculateSimilarity(anki.front, srs.prompt.text);
  // Compare back with answer.text
  const backScore = calculateSimilarity(anki.back, srs.answer.text);
  // Compare fields
  const fieldScores = Object.entries(anki.fields).map(([key, value]) => {
    const srsValue = findMatchingField(srs, key);
    return srsValue ? calculateSimilarity(value, srsValue) : 0;
  });

  const avgFieldScore =
    fieldScores.length > 0
      ? fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length
      : 0;

  // Weighted average: front 0.4, back 0.4, fields 0.2
  const score = frontScore * 0.4 + backScore * 0.4 + avgFieldScore * 0.2;

  return score >= threshold ? score : 0;
}

function findMatchingField(srs: SrsCard, fieldName: string): string | undefined {
  const normalized = fieldName.toLowerCase();
  if (['front', 'target', 'word', 'text'].some((k) => normalized.includes(k))) {
    return srs.prompt.text;
  }
  if (['back', 'translation', 'meaning', 'answer'].some((k) => normalized.includes(k))) {
    return srs.answer.text;
  }
  if (['transcription', 'reading', 'pronunciation'].some((k) => normalized.includes(k))) {
    return srs.prompt.transcription;
  }
  if (['example', 'context', 'sentence'].some((k) => normalized.includes(k))) {
    return srs.prompt.context;
  }
  return undefined;
}

/**
 * Match two sets of cards and return paired matches.
 */
function compareCardSets(
  ankiCards: AnkiCardForComparison[],
  srsCards: SrsCard[],
  options: FidelityOptions = {}
): CardPair[] {
  const pairs: CardPair[] = [];
  const matchedSrs = new Set<number>();

  for (const anki of ankiCards) {
    let bestMatch: { index: number; score: number } | null = null;

    for (let i = 0; i < srsCards.length; i++) {
      if (matchedSrs.has(i)) continue;

      const score = compareSingleCard(anki, srsCards[i]!, options);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { index: i, score };
      }
    }

    if (bestMatch && bestMatch.score > (options.similarityThreshold ?? 0.6)) {
      pairs.push({
        ankiCard: anki,
        srsCard: srsCards[bestMatch.index]!,
        similarity: bestMatch.score,
      });
      matchedSrs.add(bestMatch.index);
    }
  }

  return pairs;
}

/**
 * Compute per-field fidelity scores from matched pairs.
 */
function computeFieldFidelity(
  pairs: CardPair[],
  ankiCards: AnkiCardForComparison[]
): FieldFidelity[] {
  const fields = new Set<string>();
  for (const anki of ankiCards) {
    for (const key of Object.keys(anki.fields)) {
      fields.add(key);
    }
  }

  // Also track front/back as pseudo-fields
  const pseudoFields = ['front', 'back'];

  const results: FieldFidelity[] = [];

  for (const field of [...pseudoFields, ...Array.from(fields)]) {
    const scores: number[] = [];
    let ankiCardsWithField = 0;

    for (const anki of ankiCards) {
      const hasField =
        field === 'front'
          ? true
          : field === 'back'
            ? true
            : field in anki.fields;

      if (!hasField) continue;
      ankiCardsWithField++;

      // Find matching pair
      const pair = pairs.find((p) => p.ankiCard.id === anki.id);
      if (!pair) {
        scores.push(0);
        continue;
      }

      const ankiValue: string | undefined =
        field === 'front'
          ? anki.front
          : field === 'back'
            ? anki.back
            : anki.fields[field];
      const srsValue = findMatchingField(pair.srsCard, field);

      if (ankiValue && srsValue) {
        scores.push(calculateSimilarity(ankiValue, srsValue));
      } else {
        scores.push(0);
      }
    }

    const srsCardsMatched = scores.filter((s) => s > 0.6).length;
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

    results.push({
      field,
      ankiCardsWithField,
      srsCardsMatched,
      averageScore,
    });
  }

  return results;
}

export { compareSingleCard, computeFieldFidelity };
