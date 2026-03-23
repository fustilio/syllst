/**
 * Content Loader Factory
 *
 * Creates loader instances for syllabus content.
 */

import type { SyllabusConfig } from '@syllst/core/types';
import type { LessonAstNode } from '@syllst/core';
import { buildLessonFromMDX } from '../builders/syllabus-builder.js';
import { readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';

/**
 * Lesson data returned by loader
 */
export interface LessonData {
  id: string;
  title: string;
  content: string;
  order: number;
}

/**
 * Content loader interface
 */
export interface ContentLoader {
  /**
   * Load a lesson by its order number
   */
  loadLesson(order: number): Promise<LessonData>;

  /**
   * Get list of available lessons
   */
  getAvailableLessons(): LessonData[];

  /**
   * Build lesson AST from MDX content
   */
  buildLesson(mdxContent: string): Promise<LessonAstNode>;

  /**
   * Get syllabus configuration
   */
  getConfig(): SyllabusConfig;
}

/**
 * Lesson source definition
 */
export interface LessonSource {
  id: string;
  title: string;
  order: number;
  mdxContent: string;
}

/**
 * Create a content loader for the given syllabus config
 *
 * This function creates a loader that can:
 * 1. Load lessons from a provided array of lesson sources
 * 2. Dynamically discover and load lessons from a lessons directory
 *
 * @param config - Syllabus configuration
 * @param lessonsDir - Optional directory path containing lesson MDX files
 * @returns Content loader instance
 */
export function createLoader(
  config: SyllabusConfig,
  lessonsDir?: string
): ContentLoader {
  let lessonSources: LessonSource[] = [];

  // Pre-load lessons if directory is provided
  if (lessonsDir) {
    lessonSources = loadLessonsFromDir(lessonsDir);
  }

  return {
    async loadLesson(order: number): Promise<LessonData> {
      const lesson = lessonSources.find((l) => l.order === order);
      if (!lesson) {
        throw new Error(`Lesson with order ${order} not found`);
      }
      return {
        id: lesson.id,
        title: lesson.title,
        content: lesson.mdxContent,
        order: lesson.order,
      };
    },

    getAvailableLessons(): LessonData[] {
      return lessonSources.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.mdxContent,
        order: lesson.order,
      }));
    },

    async buildLesson(mdxContent: string): Promise<LessonAstNode> {
      return buildLessonFromMDX(mdxContent);
    },

    getConfig(): SyllabusConfig {
      return config;
    },
  };
}

/**
 * Load lessons from a directory containing MDX files
 *
 * @param dirPath - Path to directory containing lesson MDX files
 * @returns Array of lesson sources
 */
function loadLessonsFromDir(dirPath: string): LessonSource[] {
  const lessons: LessonSource[] = [];

  try {
    const files = readdirSync(dirPath).filter((f) => f.endsWith('.mdx'));

    for (const file of files.sort()) {
      const filePath = join(dirPath, file);
      const content = readFileSync(filePath, 'utf-8');
      const order = parseInt(basename(file).replace('.mdx', ''), 10);

      // Extract id and title from frontmatter if present
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let id = `lesson-${order}`;
      let title = `Lesson ${order}`;

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1] ?? '';
        const idMatch = frontmatter.match(/id:\s*(.+)/);
        const titleMatch = frontmatter.match(/title:\s*["']?(.+)["']?/);

        if (idMatch?.[1]) {
          id = idMatch[1].trim();
        }
        if (titleMatch?.[1]) {
          title = titleMatch[1].trim().replace(/["']/g, '');
        }
      }

      lessons.push({
        id,
        title,
        order,
        mdxContent: content,
      });
    }
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty array
    // The caller can handle this case
  }

  return lessons;
}
