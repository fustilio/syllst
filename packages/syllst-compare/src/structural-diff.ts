/**
 * Structural Diff Comparison
 *
 * Compares lesson ordering, count, and prerequisite chains.
 */

import { visit } from 'unist-util-visit';
import type { Node as UnistNode } from 'unist';
import type { ComparisonInput, StructuralDiffReport, LessonDiff } from './types.js';
import { extractLessons, calculateSimilarity } from './utils.js';
import type { LessonAstNode } from '@syllst/core';

export function compareStructuralDiff(
  a: ComparisonInput,
  b: ComparisonInput
): StructuralDiffReport {
  const lessonsA = extractLessons(a);
  const lessonsB = extractLessons(b);

  const lessonDiffs = diffLessons(lessonsA, lessonsB);

  const chapterCountA = countChapters(a);
  const chapterCountB = countChapters(b);

  const prerequisitesA = extractPrerequisites(lessonsA);
  const prerequisitesB = extractPrerequisites(lessonsB);

  // Score: weighted average of lesson overlap and structure similarity
  const matchedCount = lessonDiffs.filter((d) => d.status === 'matched').length;
  const unionCount = lessonDiffs.length;
  const lessonScore = unionCount > 0 ? matchedCount / unionCount : 0;

  const prereqScore = comparePrerequisites(prerequisitesA, prerequisitesB);

  const score = lessonScore * 0.6 + prereqScore * 0.4;

  return {
    lessonCountA: lessonsA.length,
    lessonCountB: lessonsB.length,
    lessonDiffs,
    chapterCountA,
    chapterCountB,
    prerequisitesA,
    prerequisitesB,
    score,
  };
}

function diffLessons(
  lessonsA: LessonAstNode[],
  lessonsB: LessonAstNode[]
): LessonDiff[] {
  const diffs: LessonDiff[] = [];
  const matchedB = new Set<number>();

  for (const lessonA of lessonsA) {
    let bestMatch: { index: number; similarity: number } | null = null;

    for (let i = 0; i < lessonsB.length; i++) {
      if (matchedB.has(i)) continue;

      const similarity = calculateSimilarity(lessonA.title, lessonsB[i]!.title);
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { index: i, similarity };
      }
    }

    if (bestMatch && bestMatch.similarity >= 0.6) {
      diffs.push({
        lessonId: lessonA.id,
        title: lessonA.title,
        status: 'matched',
        similarity: bestMatch.similarity,
      });
      matchedB.add(bestMatch.index);
    } else {
      diffs.push({
        lessonId: lessonA.id,
        title: lessonA.title,
        status: 'only-in-a',
      });
    }
  }

  // Add unmatched lessons from B
  for (let i = 0; i < lessonsB.length; i++) {
    if (matchedB.has(i)) continue;
    const lessonB = lessonsB[i]!;
    diffs.push({
      lessonId: lessonB.id,
      title: lessonB.title,
      status: 'only-in-b',
    });
  }

  return diffs;
}

function countChapters(input: ComparisonInput): number {
  let count = 0;
  if (!Array.isArray(input) && input.type === 'syllabusRoot') {
    visit(input as unknown as UnistNode, 'chapter', () => {
      count++;
    });
  }
  return count;
}

function extractPrerequisites(
  lessons: LessonAstNode[]
): Record<string, string[]> {
  const prereqs: Record<string, string[]> = {};
  for (const lesson of lessons) {
    if (lesson.metadata?.prerequisites) {
      prereqs[lesson.id] = lesson.metadata.prerequisites;
    }
  }
  return prereqs;
}

function comparePrerequisites(
  a: Record<string, string[]>,
  b: Record<string, string[]>
): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (allKeys.size === 0) return 1;

  let matches = 0;
  for (const key of allKeys) {
    const prereqsA = a[key] ?? [];
    const prereqsB = b[key] ?? [];

    if (prereqsA.length === 0 && prereqsB.length === 0) {
      matches++;
      continue;
    }

    const common = prereqsA.filter((p) => prereqsB.includes(p));
    const union = new Set([...prereqsA, ...prereqsB]).size;
    matches += union > 0 ? common.length / union : 1;
  }

  return matches / allKeys.size;
}
