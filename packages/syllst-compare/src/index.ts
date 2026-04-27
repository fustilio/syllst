/**
 * Syllst Compare — Syllabi Comparison Framework
 *
 * Multi-level comparison of syllst syllabi:
 * - Topic coverage (categories, CEFR, difficulty)
 * - Content overlap (vocabulary, grammar, examples)
 * - Structural diff (lessons, prerequisites)
 * - Resource comparison (examples, exercises, content depth)
 */

export type {
  ComparisonInput,
  ComparisonLevel,
  ComparisonOptions,
  ComparisonReport,
  TopicCoverageReport,
  ContentOverlapReport,
  MatchedItem,
  StructuralDiffReport,
  LessonDiff,
  ResourceComparisonReport,
  LessonResourceMetrics,
  ComparableItem,
  StrategyMatchedPair,
  StrategyMatchResult,
  MatchStrategy,
} from './types.js';
export { SyllabiIndex } from './indexer.js';
export type { IndexedNode } from './indexer.js';

export { compareTopicCoverage } from './topic-coverage.js';
export { compareContentOverlap } from './content-overlap.js';
export { compareStructuralDiff } from './structural-diff.js';
export { compareResources } from './resource-comparison.js';
export { extractLessons, extractMeta, normalizeText, calculateSimilarity } from './utils.js';

import type { ComparisonInput, ComparisonOptions, ComparisonReport } from './types.js';
import { compareTopicCoverage } from './topic-coverage.js';
import { compareContentOverlap } from './content-overlap.js';
import { compareStructuralDiff } from './structural-diff.js';
import { compareResources } from './resource-comparison.js';
import { extractMeta } from './utils.js';

/**
 * Run a full multi-level comparison between two syllabi.
 */
export function compareSyllabi(
  a: ComparisonInput,
  b: ComparisonInput,
  options: ComparisonOptions = {}
): ComparisonReport {
  const levels = options.levels ?? ['topic', 'content', 'structural', 'resource'];

  const metaA = extractMeta(a);
  const metaB = extractMeta(b);

  return {
    syllabusA: metaA,
    syllabusB: metaB,
    topicCoverage: levels.includes('topic')
      ? compareTopicCoverage(a, b)
      : emptyTopicCoverage(),
    contentOverlap: levels.includes('content')
      ? compareContentOverlap(a, b, options)
      : emptyContentOverlap(),
    structuralDiff: levels.includes('structural')
      ? compareStructuralDiff(a, b)
      : emptyStructuralDiff(),
    resourceComparison: levels.includes('resource')
      ? compareResources(a, b)
      : emptyResourceComparison(),
  };
}

function emptyTopicCoverage() {
  return {
    onlyInA: [],
    onlyInB: [],
    inBoth: [],
    cefrA: {},
    cefrB: {},
    difficultyA: {},
    difficultyB: {},
    score: 0,
  };
}

function emptyContentOverlap() {
  return {
    vocabOnlyInA: [],
    vocabOnlyInB: [],
    vocabMatched: [],
    vocabScore: 0,
    grammarOnlyInA: [],
    grammarOnlyInB: [],
    grammarMatched: [],
    grammarScore: 0,
    examplesOnlyInA: [],
    examplesOnlyInB: [],
    examplesMatched: [],
    examplesScore: 0,
    overallScore: 0,
  };
}

function emptyStructuralDiff() {
  return {
    lessonCountA: 0,
    lessonCountB: 0,
    lessonDiffs: [],
    chapterCountA: 0,
    chapterCountB: 0,
    prerequisitesA: {},
    prerequisitesB: {},
    score: 0,
  };
}

function emptyResourceComparison() {
  return {
    avgExamplesPerLessonA: 0,
    avgExamplesPerLessonB: 0,
    avgExercisesPerLessonA: 0,
    avgExercisesPerLessonB: 0,
    totalContentNodesA: 0,
    totalContentNodesB: 0,
    lessonMetricsA: [],
    lessonMetricsB: [],
    enrichmentDirection: 'equal' as const,
    score: 0,
  };
}
