/**
 * Syllabi Comparison E2E Tests
 */

import { describe, it, expect } from 'vitest';
import { compareSyllabi, compareTopicCoverage, compareContentOverlap } from '../index.js';
import type { SyllabusRoot, LessonAstNode } from '@syllst/core';

function createMockSyllabus(
  id: string,
  title: string,
  lessons: LessonAstNode[]
): SyllabusRoot {
  return {
    type: 'syllabusRoot',
    meta: {
      id,
      title,
      language: 'th',
      source: { title: 'test' },
      version: '1.0.0',
      extractedAt: new Date().toISOString(),
    },
    children: lessons.map((l, i) => ({
      type: 'chapter',
      id: `ch-${i}`,
      title: `Chapter ${i + 1}`,
      order: i,
      children: [l],
    })),
  };
}

function createLesson(
  id: string,
  title: string,
  order: number,
  vocab: Array<{ word: string; translation: string }> = [],
  categories: string[] = []
): LessonAstNode {
  return {
    type: 'lesson',
    id,
    title,
    order,
    categories,
    children: vocab.map((v, i) => ({
      type: 'vocabularyItem',
      id: `${id}:vocab:${i}`,
      word: v.word,
      translation: v.translation,
      value: v.word,
    })),
  };
}

describe('compareSyllabi', () => {
  it('identifies identical syllabi as fully overlapping', () => {
    const vocab = [
      { word: 'hello', translation: 'สวัสดี' },
      { word: 'thank you', translation: 'ขอบคุณ' },
    ];
    const lessons = [
      createLesson('l1', 'Greetings', 1, vocab, ['greetings', 'basic']),
    ];
    const syllabusA = createMockSyllabus('a', 'Thai Basic', lessons);
    const syllabusB = createMockSyllabus('b', 'Thai Basic Copy', lessons);

    const report = compareSyllabi(syllabusA, syllabusB);

    expect(report.topicCoverage.inBoth).toContain('greetings');
    expect(report.topicCoverage.inBoth).toContain('basic');
    expect(report.topicCoverage.score).toBe(1);
    expect(report.contentOverlap.vocabScore).toBe(1);
    expect(report.structuralDiff.score).toBe(1);
  });

  it('detects missing topics in one syllabus', () => {
    const lessonsA = [
      createLesson('l1', 'Greetings', 1, [{ word: 'hello', translation: 'สวัสดี' }], ['greetings']),
      createLesson('l2', 'Numbers', 2, [{ word: 'one', translation: 'หนึ่ง' }], ['numbers']),
    ];
    const lessonsB = [
      createLesson('l1', 'Greetings', 1, [{ word: 'hello', translation: 'สวัสดี' }], ['greetings']),
    ];

    const report = compareSyllabi(
      createMockSyllabus('a', 'Full', lessonsA),
      createMockSyllabus('b', 'Partial', lessonsB)
    );

    expect(report.topicCoverage.onlyInA).toContain('numbers');
    expect(report.topicCoverage.inBoth).toContain('greetings');
    expect(report.topicCoverage.score).toBeLessThan(1);
  });

  it('detects vocabulary differences', () => {
    const lessonsA = [
      createLesson('l1', 'Greetings', 1, [
        { word: 'hello', translation: 'สวัสดี' },
        { word: 'goodbye', translation: 'ลาก่อน' },
      ]),
    ];
    const lessonsB = [
      createLesson('l1', 'Greetings', 1, [
        { word: 'hello', translation: 'สวัสดี' },
        { word: 'thank you', translation: 'ขอบคุณ' },
      ]),
    ];

    const report = compareSyllabi(
      createMockSyllabus('a', 'A', lessonsA),
      createMockSyllabus('b', 'B', lessonsB)
    );

    expect(report.contentOverlap.vocabMatched.length).toBe(1); // hello matched
    expect(report.contentOverlap.vocabOnlyInA).toContain('goodbye');
    expect(report.contentOverlap.vocabOnlyInB).toContain('thank you');
  });

  it('returns empty reports when levels are excluded', () => {
    const lessons = [createLesson('l1', 'Test', 1, [], ['basic'])];
    const report = compareSyllabi(
      createMockSyllabus('a', 'A', lessons),
      createMockSyllabus('b', 'B', lessons),
      { levels: ['topic'] }
    );

    expect(report.topicCoverage.score).toBe(1);
    expect(report.contentOverlap.overallScore).toBe(0); // skipped
    expect(report.structuralDiff.score).toBe(0); // skipped
    expect(report.resourceComparison.score).toBe(0); // skipped
  });
});

describe('compareTopicCoverage', () => {
  it('counts CEFR levels correctly', () => {
    const lessons: LessonAstNode[] = [
      { ...createLesson('l1', 'A', 1), cefrLevel: 'A1' },
      { ...createLesson('l2', 'B', 2), cefrLevel: 'A2' },
      { ...createLesson('l3', 'C', 3), cefrLevel: 'A1' },
    ];

    const result = compareTopicCoverage(
      createMockSyllabus('a', 'A', lessons),
      createMockSyllabus('b', 'B', lessons)
    );

    expect(result.cefrA['A1']).toBe(2);
    expect(result.cefrA['A2']).toBe(1);
  });
});
