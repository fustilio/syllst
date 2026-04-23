/**
 * Shared utilities for syllabi comparison
 */

import { visit } from 'unist-util-visit';
import type { Node as UnistNode } from 'unist';
import type { ComparisonInput } from './types.js';
import type { SyllabusRoot, CourseBundle, LessonAstNode } from '@syllst/core';

/**
 * Extract lessons from any comparison input format.
 */
export function extractLessons(input: ComparisonInput): LessonAstNode[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (input.type === 'courseBundle') {
    return (input as CourseBundle).lessons;
  }

  // SyllabusRoot
  const lessons: LessonAstNode[] = [];
  visit(input as unknown as UnistNode, 'lesson', (node) => {
    lessons.push(node as unknown as LessonAstNode);
  });
  return lessons;
}

/**
 * Extract syllabus metadata from input.
 */
export function extractMeta(input: ComparisonInput): { id: string; title: string } {
  if (Array.isArray(input)) {
    return { id: 'lessons-array', title: 'Lesson Array' };
  }

  if (input.type === 'courseBundle') {
    const bundle = input as CourseBundle;
    return { id: bundle.manifest.id, title: bundle.manifest.title };
  }

  const root = input as SyllabusRoot;
  return { id: root.meta.id, title: root.meta.title };
}

/**
 * Normalize text for comparison.
 */
export function normalizeText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calculate string similarity using Levenshtein distance.
 */
export function calculateSimilarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
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
 * Find the best match for a target string in an array of candidates.
 */
export function findBestMatch(
  target: string,
  candidates: string[],
  threshold = 0.6
): { match: string; score: number } | null {
  let best: { match: string; score: number } | null = null;

  for (const candidate of candidates) {
    const score = calculateSimilarity(target, candidate);
    if (!best || score > best.score) {
      best = { match: candidate, score };
    }
  }

  return best && best.score >= threshold ? best : null;
}
