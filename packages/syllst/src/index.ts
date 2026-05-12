/**
 * @syllst/core
 *
 * Syllabus Syntax Tree (syllst) - Unist-based type definitions for language learning syllabi.
 *
 * This package provides type definitions and Zod schemas for runtime validation.
 * For processing MDX and transforming to syllst AST, use a separate processor package.
 *
 * @example
 * ```typescript
 * // Types only
 * import type { LessonAstNode, VocabularySetNode } from '@syllst/core';
 *
 * const lesson: LessonAstNode = {
 *   type: 'lesson',
 *   id: 'lesson-01',
 *   title: 'Basic Greetings',
 *   children: []
 * };
 *
 * // With Zod validation
 * import { validateLesson, LessonAstNodeSchema } from '@syllst/core/schemas';
 *
 * const result = validateLesson(lesson);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */

// Export all types
export * from './types/index.js';

// Runtime helpers
export {
  isCanonicalTranscriptionObject,
  isLegacyTranscriptionObject,
  isValidTranscription,
  normalizeTranscription,
} from './utils/transcription.js';
