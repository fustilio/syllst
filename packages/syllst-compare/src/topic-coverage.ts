/**
 * Topic Coverage Comparison
 *
 * Compares high-level topics, categories, CEFR levels, and
 * difficulty distributions between two syllabi.
 */

import type { ComparisonInput, TopicCoverageReport } from './types.js';
import { extractLessons } from './utils.js';
import type { LessonAstNode } from '@syllst/core';

export function compareTopicCoverage(
  a: ComparisonInput,
  b: ComparisonInput
): TopicCoverageReport {
  const lessonsA = extractLessons(a);
  const lessonsB = extractLessons(b);

  const categoriesA = collectCategories(lessonsA);
  const categoriesB = collectCategories(lessonsB);

  const onlyInA = Array.from(categoriesA).filter((c) => !categoriesB.has(c));
  const onlyInB = Array.from(categoriesB).filter((c) => !categoriesA.has(c));
  const inBoth = Array.from(categoriesA).filter((c) => categoriesB.has(c));

  const unionSize = categoriesA.size + categoriesB.size - inBoth.length;
  const score = unionSize > 0 ? inBoth.length / unionSize : 0;

  return {
    onlyInA,
    onlyInB,
    inBoth,
    cefrA: countCefrLevels(lessonsA),
    cefrB: countCefrLevels(lessonsB),
    difficultyA: countDifficulties(lessonsA),
    difficultyB: countDifficulties(lessonsB),
    score,
  };
}

function collectCategories(lessons: LessonAstNode[]): Set<string> {
  const categories = new Set<string>();
  for (const lesson of lessons) {
    for (const cat of lesson.categories ?? []) {
      categories.add(cat);
    }
  }
  return categories;
}

function countCefrLevels(lessons: LessonAstNode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const lesson of lessons) {
    const levels = lesson.cefrLevel;
    if (!levels) continue;
    const arr = Array.isArray(levels) ? levels : [levels];
    for (const level of arr) {
      counts[level] = (counts[level] ?? 0) + 1;
    }
  }
  return counts;
}

function countDifficulties(lessons: LessonAstNode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const lesson of lessons) {
    const diff = lesson.difficulty;
    if (!diff) continue;
    counts[diff] = (counts[diff] ?? 0) + 1;
  }
  return counts;
}
