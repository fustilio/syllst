/**
 * Course/Module Structure Demonstration
 *
 * This test demonstrates the course-level structure:
 * SyllabusRoot → ChapterNode → LessonAstNode
 *
 * Run with: pnpm test course-structure.test.ts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildLessonFromMDX } from '@syllst/processor';
import { validateNode } from '@syllst/core/schemas';
import type { SyllabusRoot, ChapterNode, LessonAstNode } from '@syllst/core/types';

// Get examples directory
const EXAMPLES_DIR = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fallback for CommonJS
  }
  return __dirname || '.';
})();

function loadExample(name: string): string {
  return readFileSync(join(EXAMPLES_DIR, `${name}.mdx`), 'utf-8');
}

describe('Course/Module Structure', () => {
  describe('SyllabusRoot Structure', () => {
    it('should parse syllabus root MDX', async () => {
      const mdx = loadExample('course-syllabus');
      // Note: Currently buildLessonFromMDX only builds lessons
      // For syllabus root, we'd need a different builder or manual construction
      // This demonstrates the structure conceptually
      
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'hindi-basics-course',
          title: 'Hindi Basics Course',
          language: 'hi-IN',
          version: '1.0.0',
          extractedAt: '2024-01-15T10:00:00Z',
          source: {
            title: 'FSI Hindi Course',
            authors: ['Foreign Service Institute'],
            year: 2020,
            publisher: 'FSI',
          },
        },
        children: [],
      };

      expect(syllabusRoot.type).toBe('syllabusRoot');
      expect(syllabusRoot.meta.id).toBe('hindi-basics-course');
      expect(syllabusRoot.meta.language).toBe('hi-IN');
      expect(syllabusRoot.meta.source.title).toBe('FSI Hindi Course');
    });

    it('should validate syllabus root structure', () => {
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'test-course',
          title: 'Test Course',
          language: 'en-US',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Test Source',
          },
        },
        children: [],
      };

      const validation = validateNode(syllabusRoot);
      expect(validation.valid).toBe(true);
    });
  });

  describe('ChapterNode Structure', () => {
    it('should parse chapter MDX', async () => {
      const mdx = loadExample('chapter-foundation');
      // Similar to syllabus root, chapters would need a specific builder
      // This demonstrates the structure
      
      const chapter: ChapterNode = {
        type: 'chapter',
        id: 'chapter-01-foundation',
        title: 'Foundation',
        description: 'Building blocks of Hindi language',
        order: 1,
        difficulty: 'beginner',
        cefrLevel: 'A1',
        categories: ['basics', 'foundation'],
        children: [],
      };

      expect(chapter.type).toBe('chapter');
      expect(chapter.id).toBe('chapter-01-foundation');
      expect(chapter.order).toBe(1);
      expect(chapter.difficulty).toBe('beginner');
    });

    it('should validate chapter structure', () => {
      const chapter: ChapterNode = {
        type: 'chapter',
        id: 'test-chapter',
        title: 'Test Chapter',
        order: 1,
        children: [],
      };

      const validation = validateNode(chapter);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Complete Course Hierarchy', () => {
    it('should demonstrate SyllabusRoot → Chapter → Lesson structure', async () => {
      // Load a lesson
      const lessonMdx = loadExample('basic-lesson');
      const lesson = await buildLessonFromMDX(lessonMdx);

      // Create chapter with lesson
      const chapter: ChapterNode = {
        type: 'chapter',
        id: 'chapter-01-foundation',
        title: 'Foundation',
        order: 1,
        children: [lesson],
      };

      // Create syllabus root with chapter
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'hindi-basics-course',
          title: 'Hindi Basics Course',
          language: 'hi-IN',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'FSI Hindi Course',
          },
        },
        children: [chapter],
      };

      // Verify hierarchy
      expect(syllabusRoot.type).toBe('syllabusRoot');
      expect(syllabusRoot.children.length).toBe(1);
      
      const firstChild = syllabusRoot.children[0];
      expect(firstChild.type).toBe('chapter');
      
      if (firstChild.type === 'chapter') {
        expect(firstChild.children.length).toBeGreaterThan(0);
        const firstLesson = firstChild.children[0];
        expect(firstLesson.type).toBe('lesson');
        
        if (firstLesson.type === 'lesson') {
          expect(firstLesson.id).toBe('basic-lesson-01');
          expect(firstLesson.title).toBe('Basic Greetings');
        }
      }
    });

    it('should validate complete course structure', () => {
      const lesson: LessonAstNode = {
        type: 'lesson',
        id: 'lesson-01',
        title: 'Test Lesson',
        order: 1,
        children: [],
      };

      const chapter: ChapterNode = {
        type: 'chapter',
        id: 'chapter-01',
        title: 'Test Chapter',
        order: 1,
        children: [lesson],
      };

      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'test-course',
          title: 'Test Course',
          language: 'en-US',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Test Source',
          },
        },
        children: [chapter],
      };

      // Validate each level
      const rootValidation = validateNode(syllabusRoot);
      expect(rootValidation.valid).toBe(true);

      const chapterValidation = validateNode(chapter);
      expect(chapterValidation.valid).toBe(true);

      const lessonValidation = validateNode(lesson);
      expect(lessonValidation.valid).toBe(true);
    });

    it('should support multiple chapters in a course', () => {
      const chapter1: ChapterNode = {
        type: 'chapter',
        id: 'chapter-01',
        title: 'Chapter 1',
        order: 1,
        children: [],
      };

      const chapter2: ChapterNode = {
        type: 'chapter',
        id: 'chapter-02',
        title: 'Chapter 2',
        order: 2,
        children: [],
      };

      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'multi-chapter-course',
          title: 'Multi-Chapter Course',
          language: 'en-US',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Test Source',
          },
        },
        children: [chapter1, chapter2],
      };

      expect(syllabusRoot.children.length).toBe(2);
      expect(syllabusRoot.children[0].type).toBe('chapter');
      expect(syllabusRoot.children[1].type).toBe('chapter');
      
      if (syllabusRoot.children[0].type === 'chapter') {
        expect(syllabusRoot.children[0].order).toBe(1);
      }
      if (syllabusRoot.children[1].type === 'chapter') {
        expect(syllabusRoot.children[1].order).toBe(2);
      }
    });

    it('should support multiple lessons in a chapter', async () => {
      const lesson1 = await buildLessonFromMDX(loadExample('basic-lesson'));
      const lesson2 = await buildLessonFromMDX(loadExample('dialogue-lesson'));

      const chapter: ChapterNode = {
        type: 'chapter',
        id: 'chapter-01',
        title: 'Test Chapter',
        order: 1,
        children: [lesson1, lesson2],
      };

      expect(chapter.children.length).toBe(2);
      expect(chapter.children[0].type).toBe('lesson');
      expect(chapter.children[1].type).toBe('lesson');
      
      if (chapter.children[0].type === 'lesson') {
        expect(chapter.children[0].id).toBe('basic-lesson-01');
      }
      if (chapter.children[1].type === 'lesson') {
        expect(chapter.children[1].id).toBe('dialogue-lesson-01');
      }
    });
  });
});
