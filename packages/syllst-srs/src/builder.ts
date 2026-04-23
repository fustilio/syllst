/**
 * SRS Deck Builder
 *
 * High-level utilities for building complete SRS decks from
 * syllst lessons and syllabi.
 */

import type {
  LessonAstNode,
  SyllabusRoot,
} from '@syllst/core';
import { visit } from 'unist-util-visit';
import type { Node as UnistNode } from 'unist';
import type { SrsCard, DeckBuildOptions, SrsGenerator } from './types.js';
import {
  generateVocabularyCards,
  generateGrammarCards,
  generateExampleCards,
  generateCharacterCards,
  generateExerciseCards,
} from './generators/index.js';

const DEFAULT_GENERATORS: SrsGenerator[] = [
  generateVocabularyCards,
  generateGrammarCards,
  generateExampleCards,
  generateCharacterCards,
  generateExerciseCards,
];

function collectLessonNodes(syllabus: SyllabusRoot): LessonAstNode[] {
  const lessons: LessonAstNode[] = [];
  visit(syllabus as unknown as UnistNode, 'lesson', (node) => {
    lessons.push(node as unknown as LessonAstNode);
  });
  return lessons;
}

/**
 * Build SRS cards from a single lesson.
 */
export function buildSrsDeckFromLesson(
  lesson: LessonAstNode,
  options: DeckBuildOptions = {}
): SrsCard[] {
  const generators = options.generators ?? DEFAULT_GENERATORS;
  const cards: SrsCard[] = [];

  visit(lesson as unknown as UnistNode, (node) => {
    for (const gen of generators) {
      const generated = gen(node, options);
      for (const card of generated) {
        cards.push({ ...card, lessonId: lesson.id });
      }
    }
  });

  return deduplicateIfNeeded(cards, options);
}

/**
 * Build SRS cards from an entire syllabus.
 */
export function buildSrsDeckFromSyllabus(
  syllabus: SyllabusRoot,
  options: DeckBuildOptions = {}
): SrsCard[] {
  const lessons = collectLessonNodes(syllabus);
  const cards: SrsCard[] = [];

  for (const lesson of lessons) {
    cards.push(...buildSrsDeckFromLesson(lesson, options));
  }

  return deduplicateIfNeeded(cards, options);
}

/**
 * Build SRS cards from an array of lessons.
 */
export function buildSrsDeckFromLessons(
  lessons: LessonAstNode[],
  options: DeckBuildOptions = {}
): SrsCard[] {
  const cards: SrsCard[] = [];
  for (const lesson of lessons) {
    cards.push(...buildSrsDeckFromLesson(lesson, options));
  }
  return deduplicateIfNeeded(cards, options);
}

function deduplicateIfNeeded(
  cards: SrsCard[],
  options: DeckBuildOptions
): SrsCard[] {
  if (!options.deduplicate) return cards;

  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = `${card.sourceRef}:${card.activityType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
