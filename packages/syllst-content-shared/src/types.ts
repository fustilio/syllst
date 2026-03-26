/**
 * Shared types for content packages
 */

import type { LessonAstNode, SyllabusRoot } from '@syllst/core';

/**
 * Configuration for a syllabus content package
 */
export interface SyllabusConfig {
  /** Unique syllabus ID */
  id: string;
  /** Display title */
  title: string;
  /** Description */
  description: string;
  /** Language code (ISO 639-1) */
  language: string;
  /** Locale code (e.g., 'th-TH', 'fr-FR') */
  locale?: string;
  /** Total number of lessons */
  lessonCount: number;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** CEFR level range */
  cefrLevel?: string;
  /** Icon for display */
  icon?: string;
  /** Version */
  version: string;
}

/**
 * A loaded lesson with its content
 */
export interface LoadedLesson {
  /** Lesson number (1-indexed) */
  lessonNumber: number;
  /** Parsed AST */
  ast: LessonAstNode;
  /** Raw MDX content (optional) */
  rawContent?: string;
}

/**
 * Content loader interface that each package exports
 */
export interface ContentLoader {
  /** Syllabus configuration */
  config: SyllabusConfig;

  /** Load a single lesson by number (1-indexed) */
  loadLesson(lessonNumber: number): Promise<LoadedLesson | null>;

  /** Load all lessons */
  loadAllLessons(): Promise<LoadedLesson[]>;

  /** Get list of available lesson numbers */
  getAvailableLessons(): number[];
}
