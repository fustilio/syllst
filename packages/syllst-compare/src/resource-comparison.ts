/**
 * Resource Comparison
 *
 * Compares teaching resources: examples, exercises, content nodes,
 * cultural notes, and estimated time per lesson.
 */

import { visit } from 'unist-util-visit';
import type { Node as UnistNode } from 'unist';
import type { ComparisonInput, ResourceComparisonReport, LessonResourceMetrics } from './types.js';
import { extractLessons } from './utils.js';
import type { LessonAstNode } from '@syllst/core';

export function compareResources(
  a: ComparisonInput,
  b: ComparisonInput
): ResourceComparisonReport {
  const lessonsA = extractLessons(a);
  const lessonsB = extractLessons(b);

  const metricsA = lessonsA.map(computeLessonMetrics);
  const metricsB = lessonsB.map(computeLessonMetrics);

  const totalExamplesA = metricsA.reduce((sum, m) => sum + m.exampleCount, 0);
  const totalExamplesB = metricsB.reduce((sum, m) => sum + m.exampleCount, 0);

  const totalExercisesA = metricsA.reduce((sum, m) => sum + m.exerciseCount, 0);
  const totalExercisesB = metricsB.reduce((sum, m) => sum + m.exerciseCount, 0);

  const totalContentA = metricsA.reduce((sum, m) => sum + m.contentNodeCount, 0);
  const totalContentB = metricsB.reduce((sum, m) => sum + m.contentNodeCount, 0);

  const avgExamplesA = lessonsA.length > 0 ? totalExamplesA / lessonsA.length : 0;
  const avgExamplesB = lessonsB.length > 0 ? totalExamplesB / lessonsB.length : 0;

  const avgExercisesA = lessonsA.length > 0 ? totalExercisesA / lessonsA.length : 0;
  const avgExercisesB = lessonsB.length > 0 ? totalExercisesB / lessonsB.length : 0;

  // Determine enrichment direction
  const scoreA =
    avgExamplesA * 0.3 +
    avgExercisesA * 0.3 +
    (totalContentA / Math.max(lessonsA.length, 1)) * 0.2 +
    metricsA.filter((m) => m.culturalNotes).length * 0.2;

  const scoreB =
    avgExamplesB * 0.3 +
    avgExercisesB * 0.3 +
    (totalContentB / Math.max(lessonsB.length, 1)) * 0.2 +
    metricsB.filter((m) => m.culturalNotes).length * 0.2;

  const enrichmentDirection: 'a' | 'b' | 'equal' =
    scoreA > scoreB + 0.1 ? 'a' : scoreB > scoreA + 0.1 ? 'b' : 'equal';

  // Normalized resource score (0-1)
  const maxScore = Math.max(scoreA, scoreB, 1);
  const score = maxScore > 0 ? 1 - Math.abs(scoreA - scoreB) / maxScore : 1;

  return {
    avgExamplesPerLessonA: avgExamplesA,
    avgExamplesPerLessonB: avgExamplesB,
    avgExercisesPerLessonA: avgExercisesA,
    avgExercisesPerLessonB: avgExercisesB,
    totalContentNodesA: totalContentA,
    totalContentNodesB: totalContentB,
    lessonMetricsA: metricsA,
    lessonMetricsB: metricsB,
    enrichmentDirection,
    score,
  };
}

function computeLessonMetrics(lesson: LessonAstNode): LessonResourceMetrics {
  let exampleCount = 0;
  let exerciseCount = 0;
  let contentNodeCount = 0;

  visit(lesson as unknown as UnistNode, (node) => {
    const n = node as unknown as { type: string };
    if (n.type === 'example') exampleCount++;
    if (n.type === 'exercise') exerciseCount++;
    if (n.type === 'content') contentNodeCount++;
  });

  return {
    lessonId: lesson.id,
    title: lesson.title,
    exampleCount,
    exerciseCount,
    contentNodeCount,
    culturalNotes: !!lesson.metadata?.culturalNotes,
    estimatedTime: lesson.metadata?.estimatedTime,
  };
}
