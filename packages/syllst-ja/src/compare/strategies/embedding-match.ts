/**
 * Embedding-based semantic comparison strategy.
 *
 * Uses a local embedding model (e.g. Ollama bge-m3) to compute
 * cosine similarity between items.
 */

import type { ComparableItem, MatchResult, MatchStrategy, EmbeddingProvider } from './types.js';

export interface EmbeddingMatchOptions {
  provider: EmbeddingProvider;
  threshold?: number;
}

export class EmbeddingMatchStrategy implements MatchStrategy {
  name = 'embedding';
  private provider: EmbeddingProvider;
  private threshold: number;

  constructor(options: EmbeddingMatchOptions) {
    this.provider = options.provider;
    this.threshold = options.threshold ?? 0.82;
  }

  async match(setA: ComparableItem[], setB: ComparableItem[]): Promise<MatchResult> {
    // Fast path: exact match dedup
    const exactMapB = new Map<string, ComparableItem>();
    for (const b of setB) {
      const key = normalize(b.text);
      if (!exactMapB.has(key)) exactMapB.set(key, b);
    }

    const details: { itemA: ComparableItem; itemB: ComparableItem; similarity: number }[] = [];
    const matchedBExact = new Set<string>();

    for (const a of setA) {
      const key = normalize(a.text);
      if (exactMapB.has(key) && !matchedBExact.has(key)) {
        details.push({ itemA: a, itemB: exactMapB.get(key)!, similarity: 1 });
        matchedBExact.add(key);
      }
    }

    const remainingA = setA.filter((a) => !details.some((d) => d.itemA.id === a.id));
    const remainingB = setB.filter((b) => !matchedBExact.has(normalize(b.text)));

    if (remainingA.length === 0 || remainingB.length === 0) {
      const matched = details.length;
      const union = setA.length + setB.length - matched;
      return {
        matched,
        onlyInA: setA.length - matched,
        onlyInB: setB.length - matched,
        score: union > 0 ? matched / union : 0,
        details,
      };
    }

    // Semantic match on remaining items
    const embeddingsA = await this.provider.embed(remainingA.map((i) => i.text));
    const embeddingsB = await this.provider.embed(remainingB.map((i) => i.text));

    const matchedBIdx = new Set<number>();

    for (let i = 0; i < remainingA.length; i++) {
      const embA = embeddingsA[i];
      if (!embA) continue;
      let bestIdx = -1;
      let bestSim = -1;
      for (let j = 0; j < remainingB.length; j++) {
        if (matchedBIdx.has(j)) continue;
        const embB = embeddingsB[j];
        if (!embB) continue;
        const sim = cosineSimilarity(embA, embB);
        if (sim > bestSim) {
          bestSim = sim;
          bestIdx = j;
        }
      }
      if (bestIdx >= 0 && bestSim >= this.threshold) {
        const itemA = remainingA[i];
        const itemB = remainingB[bestIdx];
        if (itemA && itemB) {
          details.push({
            itemA,
            itemB,
            similarity: bestSim,
          });
          matchedBIdx.add(bestIdx);
        }
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

function normalize(text: string): string {
  return text.replace(/[\s\n\r\t]+/g, ' ').trim().toLowerCase();
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
