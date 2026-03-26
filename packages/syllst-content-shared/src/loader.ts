/**
 * MDX content loading utilities
 */

import { buildLessonFromMDX } from '@syllst/processor';
import type { LessonAstNode } from '@syllst/core';
import type { SyllabusConfig, LoadedLesson, ContentLoader } from './types';

/**
 * Creates a content loader for a syllabus package.
 *
 * @param config - Syllabus configuration
 * @param lessonLoader - Function that imports MDX content for a lesson number
 * @returns ContentLoader implementation
 *
 * @example
 * ```ts
 * const loader = createContentLoader(
 *   { id: 'th-alphabet', title: 'Thai Alphabet', ... },
 *   async (n) => import(`./lessons/lesson-${n.toString().padStart(2, '0')}.mdx?raw`)
 * );
 * ```
 */
export function createContentLoader(
  config: SyllabusConfig,
  lessonLoader: (lessonNumber: number) => Promise<{ default: string }>,
): ContentLoader {
  return {
    config,

    async loadLesson(lessonNumber: number): Promise<LoadedLesson | null> {
      if (lessonNumber < 1 || lessonNumber > config.lessonCount) {
        return null;
      }

      try {
        const { default: rawContent } = await lessonLoader(lessonNumber);
        const ast = await buildLessonFromMDX(rawContent);
        return {
          lessonNumber,
          ast,
          rawContent,
        };
      } catch (error) {
        console.error(`Failed to load lesson ${lessonNumber}:`, error);
        return null;
      }
    },

    async loadAllLessons(): Promise<LoadedLesson[]> {
      const lessons: LoadedLesson[] = [];
      for (let i = 1; i <= config.lessonCount; i++) {
        const lesson = await this.loadLesson(i);
        if (lesson) {
          lessons.push(lesson);
        }
      }
      return lessons;
    },

    getAvailableLessons(): number[] {
      return Array.from({ length: config.lessonCount }, (_, i) => i + 1);
    },
  };
}

/**
 * Extracts vocabulary items from a lesson AST.
 */
export function extractVocabularyItems(lesson: LessonAstNode) {
  const items: Array<{
    id: string;
    word: string;
    translation: string;
    romanization?: string;
  }> = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; children?: unknown[]; [key: string]: unknown };

    if (n.type === 'vocabularyItem') {
      items.push({
        id: n.id as string,
        word: n.word as string,
        translation: n.translation as string,
        romanization: n.romanization as string | undefined,
      });
    }

    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(lesson);
  return items;
}

/**
 * Extracts character items from a lesson AST.
 */
export function extractCharacterItems(lesson: LessonAstNode) {
  const items: Array<{
    id: string;
    char: string;
    name: string;
    romanization?: string;
    charType: string;
  }> = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; children?: unknown[]; [key: string]: unknown };

    if (n.type === 'characterItem') {
      items.push({
        id: n.id as string,
        char: n.char as string,
        name: n.name as string,
        romanization: (typeof n.romanization === 'string' ? n.romanization : undefined),
        charType: n.charType as string,
      });
    }

    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(lesson);
  return items;
}

/**
 * Extracts exercise skill information from a lesson AST.
 */
export function extractExerciseSkills(lesson: LessonAstNode) {
  const items: Array<{
    id: string;
    skill?: string;
    tests?: string[];
    objectiveId?: string;
    exerciseType: string;
  }> = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; children?: unknown[]; [key: string]: unknown };

    if (n.type === 'exercise') {
      items.push({
        id: n.id as string,
        skill: n.skill as string | undefined,
        tests: n.tests as string[] | undefined,
        objectiveId: n.objectiveId as string | undefined,
        exerciseType: n.exerciseType as string,
      });
    }

    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(lesson);
  return items;
}

/**
 * Extracts phonological rule nodes from a lesson AST.
 */
export function extractPhonologicalRules(lesson: LessonAstNode) {
  const items: Array<{
    id: string;
    title: string;
    ruleType: string;
    conditionCount: number;
  }> = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; children?: unknown[]; [key: string]: unknown };

    if (n.type === 'phonologicalRule') {
      const children = (n.children as unknown[]) || [];
      const conditionCount = children.filter(
        (c: any) => c?.type === 'ruleCondition',
      ).length;

      items.push({
        id: n.id as string,
        title: n.title as string,
        ruleType: n.ruleType as string,
        conditionCount,
      });
    }

    if (Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(lesson);
  return items;
}
