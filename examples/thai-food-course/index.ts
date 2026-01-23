/**
 * Thai Food Course Example
 *
 * This demonstrates a complete course structure with:
 * - SyllabusRoot (meta.mdx)
 * - Multiple lessons (lessons/*.mdx)
 * - Course metadata and organization
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = typeof import.meta !== 'undefined' && import.meta.url
  ? dirname(fileURLToPath(import.meta.url))
  : __dirname || '.';

export const THAI_FOOD_COURSE_PATH = __dirname;
export const THAI_FOOD_META_PATH = join(__dirname, 'meta.mdx');
export const THAI_FOOD_LESSONS_DIR = join(__dirname, 'lessons');

export const THAI_FOOD_LESSON_PATHS = {
  lesson01: join(THAI_FOOD_LESSONS_DIR, 'lesson-01.mdx'),
  lesson02: join(THAI_FOOD_LESSONS_DIR, 'lesson-02.mdx'),
} as const;

/**
 * Course configuration
 */
export const THAI_FOOD_COURSE_CONFIG = {
  id: 'thai-food',
  title: 'อาหารไทย (Thai Food & Restaurants)',
  language: 'th-TH' as const,
  totalLessons: 8,
} as const;
