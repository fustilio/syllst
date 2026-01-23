/**
 * Thai Food Course Example Tests
 *
 * Demonstrates a complete course structure with meta.mdx and multiple lessons
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildLessonFromMDX } from '@syllst/processor';
import { validateNode } from '@syllst/core/schemas';
import type { SyllabusRoot, LessonAstNode } from '@syllst/core/types';

const EXAMPLES_DIR = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fallback
  }
  return __dirname || '.';
})();

const THAI_FOOD_DIR = join(EXAMPLES_DIR, 'thai-food-course');

function loadFile(path: string): string {
  return readFileSync(join(THAI_FOOD_DIR, path), 'utf-8');
}

describe('Thai Food Course Example', () => {
  describe('Course Metadata', () => {
    it('should have a complete meta.mdx file', () => {
      const metaContent = loadFile('meta.mdx');
      
      expect(metaContent).toContain('type: syllabusRoot');
      expect(metaContent).toContain('id: thai-food');
      expect(metaContent).toContain('title: "อาหารไทย (Thai Food & Restaurants)"');
      expect(metaContent).toContain('language: th-TH');
      expect(metaContent).toContain('version: "1.0.0"');
    });

    it('should demonstrate syllabus root structure', () => {
      // Create a SyllabusRoot from the meta structure
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'thai-food',
          title: 'อาหารไทย (Thai Food & Restaurants)',
          language: 'th-TH',
          version: '1.0.0',
          extractedAt: '2024-01-15T10:00:00Z',
          source: {
            title: 'Thai Food & Restaurants Course',
            authors: ['Lalia Language Learning'],
            year: 2024,
          },
          totalLessons: 8,
          totalItems: 80,
          estimatedTotalTime: 240,
          prerequisites: ['thai-essentials'],
          objectives: [
            'Order food at restaurants and street stalls',
            'Describe tastes and preferences',
            'Understand Thai cooking methods',
            'Navigate menus and make special requests',
          ],
        },
        children: [],
      };

      expect(syllabusRoot.type).toBe('syllabusRoot');
      expect(syllabusRoot.meta.id).toBe('thai-food');
      expect(syllabusRoot.meta.language).toBe('th-TH');
      expect(syllabusRoot.meta.objectives).toHaveLength(4);
    });

    it('should validate syllabus root structure', () => {
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'thai-food',
          title: 'Thai Food Course',
          language: 'th-TH',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Thai Food Course',
          },
        },
        children: [],
      };

      const validation = validateNode(syllabusRoot);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Lesson Structure', () => {
    it('should parse lesson 01 with vocabulary sets', async () => {
      const lessonContent = loadFile('lessons/lesson-01.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('thai-food-lesson-01');
      expect(lesson.title).toContain('คำศัพท์อาหารพื้นฐาน');
      expect(lesson.order).toBe(1);
      expect(lesson.parentId).toBe('thai-food');
      expect(lesson.difficulty).toBe('beginner');
      expect(lesson.cefrLevel).toBe('A2');
    });

    it('should have vocabulary sets in lesson 01', async () => {
      const lessonContent = loadFile('lessons/lesson-01.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      const vocabSets = lesson.children.filter((c) => c.type === 'vocabularySet');
      expect(vocabSets.length).toBeGreaterThan(0);

      const riceVocab = vocabSets.find((v) => v.id === 'thai-rice');
      expect(riceVocab).toBeDefined();
      if (riceVocab?.type === 'vocabularySet') {
        expect(riceVocab.children.length).toBeGreaterThan(0);
      }
    });

    it('should parse lesson 02 with taste vocabulary', async () => {
      const lessonContent = loadFile('lessons/lesson-02.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('thai-food-lesson-02');
      expect(lesson.title).toContain('รสชาติ');
      expect(lesson.order).toBe(2);
      expect(lesson.parentId).toBe('thai-food');
      
      // Check prerequisites
      if (lesson.metadata?.prerequisites) {
        expect(lesson.metadata.prerequisites).toContain('thai-food-lesson-01');
      }
    });

    it('should have exercises in lesson 02', async () => {
      const lessonContent = loadFile('lessons/lesson-02.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      const exercises = lesson.children.filter((c) => c.type === 'exercise');
      expect(exercises.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Course Structure', () => {
    it('should demonstrate course → lessons hierarchy', async () => {
      // Load lessons
      const lesson1Content = loadFile('lessons/lesson-01.mdx');
      const lesson2Content = loadFile('lessons/lesson-02.mdx');
      
      const lesson1 = await buildLessonFromMDX(lesson1Content);
      const lesson2 = await buildLessonFromMDX(lesson2Content);

      // Create course structure
      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'thai-food',
          title: 'อาหารไทย (Thai Food & Restaurants)',
          language: 'th-TH',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Thai Food Course',
          },
        },
        children: [
          {
            type: 'chapter',
            id: 'thai-food-chapter',
            title: 'Thai Food & Restaurants',
            order: 1,
            children: [lesson1, lesson2],
          },
        ],
      };

      // Verify structure
      expect(syllabusRoot.children.length).toBe(1);
      const chapter = syllabusRoot.children[0];
      expect(chapter.type).toBe('chapter');
      
      if (chapter.type === 'chapter') {
        expect(chapter.children.length).toBe(2);
        expect(chapter.children[0].type).toBe('lesson');
        expect(chapter.children[1].type).toBe('lesson');
        
        if (chapter.children[0].type === 'lesson') {
          expect(chapter.children[0].id).toBe('thai-food-lesson-01');
        }
        if (chapter.children[1].type === 'lesson') {
          expect(chapter.children[1].id).toBe('thai-food-lesson-02');
        }
      }
    });

    it('should validate complete course structure', () => {
      const lesson1: LessonAstNode = {
        type: 'lesson',
        id: 'thai-food-lesson-01',
        title: 'Lesson 1',
        order: 1,
        parentId: 'thai-food',
        children: [],
      };

      const lesson2: LessonAstNode = {
        type: 'lesson',
        id: 'thai-food-lesson-02',
        title: 'Lesson 2',
        order: 2,
        parentId: 'thai-food',
        children: [],
      };

      const syllabusRoot: SyllabusRoot = {
        type: 'syllabusRoot',
        meta: {
          id: 'thai-food',
          title: 'Thai Food Course',
          language: 'th-TH',
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          source: {
            title: 'Thai Food Course',
          },
        },
        children: [
          {
            type: 'chapter',
            id: 'chapter-01',
            title: 'Chapter 1',
            order: 1,
            children: [lesson1, lesson2],
          },
        ],
      };

      const validation = validateNode(syllabusRoot);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Real-world Features', () => {
    it('should demonstrate rich metadata', async () => {
      const lessonContent = loadFile('lessons/lesson-01.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      expect(lesson.metadata).toBeDefined();
      if (lesson.metadata) {
        expect(lesson.metadata.estimatedTime).toBe(30);
        expect(lesson.metadata.objectives).toBeDefined();
        expect(Array.isArray(lesson.metadata.objectives)).toBe(true);
      }
    });

    it('should demonstrate vocabulary with transliteration', async () => {
      const lessonContent = loadFile('lessons/lesson-01.mdx');
      const lesson = await buildLessonFromMDX(lessonContent);

      const vocabSets = lesson.children.filter((c) => c.type === 'vocabularySet');
      const riceSet = vocabSets.find((v) => v.id === 'thai-rice');
      
      if (riceSet?.type === 'vocabularySet') {
        const vocabItems = riceSet.children.filter((c) => c.type === 'vocabularyItem');
        expect(vocabItems.length).toBeGreaterThan(0);
        
        if (vocabItems[0]?.type === 'vocabularyItem') {
          expect(vocabItems[0].word).toBeDefined();
          expect(vocabItems[0].translation).toBeDefined();
          // Transliteration would be in transliteration field if supported
        }
      }
    });

    it('should demonstrate lesson progression', async () => {
      const lesson1Content = loadFile('lessons/lesson-01.mdx');
      const lesson2Content = loadFile('lessons/lesson-02.mdx');
      
      const lesson1 = await buildLessonFromMDX(lesson1Content);
      const lesson2 = await buildLessonFromMDX(lesson2Content);

      expect(lesson1.order).toBe(1);
      expect(lesson2.order).toBe(2);
      expect(lesson1.parentId).toBe('thai-food');
      expect(lesson2.parentId).toBe('thai-food');
      
      // Lesson 2 should have lesson 1 as prerequisite
      if (lesson2.metadata?.prerequisites) {
        expect(lesson2.metadata.prerequisites).toContain('thai-food-lesson-01');
      }
    });
  });
});
