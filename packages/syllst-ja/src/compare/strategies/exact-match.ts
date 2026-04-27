/**
 * Exact-match comparison strategy with optional normalization.
 */

import type { ComparableItem, MatchResult, MatchStrategy } from './types.js';

export interface ExactMatchOptions {
  normalizeFn?: (text: string) => string;
}

export class ExactMatchStrategy implements MatchStrategy {
  name = 'exact';
  private normalize: (text: string) => string;

  constructor(options: ExactMatchOptions = {}) {
    this.normalize = options.normalizeFn ?? defaultNormalize;
  }

  match(setA: ComparableItem[], setB: ComparableItem[]): MatchResult {
    const mapB = new Map<string, ComparableItem>();
    for (const b of setB) {
      const key = this.normalize(b.text);
      if (!mapB.has(key)) mapB.set(key, b);
    }

    const details: { itemA: ComparableItem; itemB: ComparableItem; similarity: number }[] = [];
    const matchedB = new Set<string>();

    for (const a of setA) {
      const key = this.normalize(a.text);
      if (mapB.has(key) && !matchedB.has(key)) {
        details.push({ itemA: a, itemB: mapB.get(key)!, similarity: 1 });
        matchedB.add(key);
      }
    }

    const matched = details.length;
    const onlyInA = setA.length - matched;
    const onlyInB = setB.length - matched;
    const union = setA.length + setB.length - matched;
    const score = union > 0 ? matched / union : 0;

    return { matched, onlyInA, onlyInB, score, details };
  }
}

function defaultNormalize(text: string): string {
  return text
    .replace(/[\s\n\r\t]+/g, ' ')
    .trim()
    .toLowerCase();
}
