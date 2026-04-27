/**
 * Japanese-specific syllabus comparison.
 *
 * Combines exact matching (fast) with optional semantic embedding
 * matching (slow but more accurate) for Japanese syllabi.
 *
 * Usage:
 *   import { compareJaSyllabi } from '@syllst/ja/compare';
 *   const result = await compareJaSyllabi(jaSyllabus, jlptSyllabus, {
 *     useEmbeddings: true,
 *     embeddingModel: 'bge-m3',
 *   });
 */

import type { SyllabusRoot } from '@syllst/core/types';
import { SyllabiIndex } from './syllabi-index.js';
import { ExactMatchStrategy, EmbeddingMatchStrategy, OllamaEmbedder } from './strategies/index.js';
import type { JaCompareOptions, JaCompareResult } from './types.js';
import { normalizeJapanese } from '../normalize.js';

export async function compareJaSyllabi(
  a: SyllabusRoot,
  b: SyllabusRoot,
  options: JaCompareOptions = {}
): Promise<JaCompareResult> {
  const start = Date.now();

  // Index both syllabi once
  const idxA = new SyllabiIndex(a);
  const idxB = new SyllabiIndex(b);

  console.log(`[ja-compare] Indexed A: ${JSON.stringify(idxA.stats())} in ${Date.now() - start}ms`);
  console.log(`[ja-compare] Indexed B: ${JSON.stringify(idxB.stats())}`);

  // Always run exact match first (fast baseline)
  const exactStrategy = new ExactMatchStrategy({ normalizeFn: normalizeJapanese });

  const exactVocab = exactStrategy.match(idxA.vocab(), idxB.vocab());
  const exactGrammar = exactStrategy.match(idxA.grammar(), idxB.grammar());
  const exactExamples = exactStrategy.match(idxA.examples(), idxB.examples());
  const exactChars = exactStrategy.match(idxA.characters(), idxB.characters());

  const exactOverall =
    exactVocab.score * 0.4 +
    exactGrammar.score * 0.25 +
    exactExamples.score * 0.2 +
    exactChars.score * 0.15;

  let semantic: JaCompareResult['semantic'] | undefined;
  let overallScore = exactOverall;

  // Optional: semantic matching via embeddings
  if (options.useEmbeddings) {
    const embedStart = Date.now();
    console.log('[ja-compare] Running semantic matching...');

    const embedder = new OllamaEmbedder({
      baseUrl: options.ollamaUrl,
      model: options.embeddingModel || 'bge-m3',
      cachePath: options.embeddingCachePath,
    });

    const embeddingStrategy = new EmbeddingMatchStrategy({
      provider: embedder,
      threshold: options.embeddingThreshold || 0.82,
    });

    const semVocab = await embeddingStrategy.match(idxA.vocab(), idxB.vocab());
    const semGrammar = await embeddingStrategy.match(idxA.grammar(), idxB.grammar());
    const semExamples = await embeddingStrategy.match(idxA.examples(), idxB.examples());
    const semChars = await embeddingStrategy.match(idxA.characters(), idxB.characters());

    const semanticOverall =
      semVocab.score * 0.4 +
      semGrammar.score * 0.25 +
      semExamples.score * 0.2 +
      semChars.score * 0.15;

    semantic = {
      vocab: semVocab,
      grammar: semGrammar,
      examples: semExamples,
      characters: semChars,
    };

    // Combine: if semantic found more matches, use it; otherwise exact
    overallScore = Math.max(exactOverall, semanticOverall);
    console.log(`[ja-compare] Semantic done in ${Date.now() - embedStart}ms`);
  }

  return {
    exact: {
      vocab: exactVocab,
      grammar: exactGrammar,
      examples: exactExamples,
      characters: exactChars,
    },
    semantic,
    overallScore,
    stats: {
      countsA: idxA.stats(),
      countsB: idxB.stats(),
    },
  };
}

// Re-export types
export type { JaCompareOptions, JaCompareResult } from './types.js';
export { SyllabiIndex } from './syllabi-index.js';
export { ExactMatchStrategy, EmbeddingMatchStrategy, OllamaEmbedder } from './strategies/index.js';
