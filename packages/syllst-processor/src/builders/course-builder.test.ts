import { describe, it, expect } from 'vitest';
import {
  buildCourseBundle,
  buildCourseBundleFromSyllabus,
} from './course-builder';
import type {
  LessonAstNode,
  SyllabusRoot,
  SyllabusSourceInfo,
} from '@syllst/core/types';

// ============================================================================
// Test Fixtures — minimal valid node shapes
// ============================================================================

const source: SyllabusSourceInfo = {
  title: 'Test Textbook',
  authors: ['Author A'],
};

function makeLesson(
  overrides: Partial<LessonAstNode> & { id: string; order: number }
): LessonAstNode {
  return {
    type: 'lesson',
    title: overrides.id,
    children: [],
    ...overrides,
  } as LessonAstNode;
}

function makeVocabSet(
  id: string,
  items: { id: string; word: string; translation: string; category?: string; tags?: string[] }[]
) {
  return {
    type: 'vocabularySet' as const,
    id,
    children: items.map((item) => ({
      type: 'vocabularyItem' as const,
      id: item.id,
      word: item.word,
      translation: item.translation,
      value: item.word,
      category: item.category,
      tags: item.tags,
    })),
  };
}

function makeGrammarRule(
  id: string,
  title: string,
  explanation: string,
  relatedRules?: string[]
) {
  return {
    type: 'grammarRule' as const,
    id,
    title,
    explanation,
    relatedRules,
    children: [],
  };
}

function makeExercise(
  id: string,
  exerciseType: string,
  difficulty?: string
) {
  return {
    type: 'exercise' as const,
    id,
    exerciseType,
    question: `Question for ${id}`,
    answer: 'answer',
    difficulty,
    children: [],
  };
}

const defaultOptions = {
  id: 'course-001',
  title: 'Test Course',
  version: '1.0.0',
  language: 'th',
};

// ============================================================================
// buildCourseBundle
// ============================================================================

describe('buildCourseBundle', () => {
  describe('empty inputs', () => {
    it('should handle zero lessons', () => {
      const bundle = buildCourseBundle([], defaultOptions);

      expect(bundle.type).toBe('courseBundle');
      expect(bundle.lessons).toHaveLength(0);
      expect(bundle.statistics.totalLessons).toBe(0);
      expect(bundle.statistics.totalVocabularyItems).toBe(0);
      expect(bundle.statistics.uniqueVocabularyItems).toBe(0);
      expect(bundle.statistics.totalGrammarRules).toBe(0);
      expect(bundle.statistics.totalExercises).toBe(0);
      expect(bundle.statistics.estimatedTotalTime).toBe(0);
      expect(bundle.indices.vocabulary.byWord.size).toBe(0);
      expect(bundle.indices.grammarRules.byId.size).toBe(0);
      expect(bundle.indices.exercises.byId.size).toBe(0);
    });
  });

  describe('manifest', () => {
    it('should populate manifest from options', () => {
      const lessons = [makeLesson({ id: 'L1', order: 1 })];

      const bundle = buildCourseBundle(lessons, {
        ...defaultOptions,
        sourceLanguage: 'en',
        description: 'A test course',
        cefrRange: { min: 'A1', max: 'B1' },
        prerequisites: ['prereq-1'],
        objectives: ['obj-1'],
        source,
      });

      expect(bundle.manifest.id).toBe('course-001');
      expect(bundle.manifest.title).toBe('Test Course');
      expect(bundle.manifest.version).toBe('1.0.0');
      expect(bundle.manifest.language).toBe('th');
      expect(bundle.manifest.sourceLanguage).toBe('en');
      expect(bundle.manifest.description).toBe('A test course');
      expect(bundle.manifest.cefrRange).toEqual({ min: 'A1', max: 'B1' });
      expect(bundle.manifest.prerequisites).toEqual(['prereq-1']);
      expect(bundle.manifest.objectives).toEqual(['obj-1']);
      expect(bundle.manifest.source).toEqual(source);
      expect(bundle.manifest.bundledAt).toBeDefined();
      expect(bundle.manifest.lessonOrder).toEqual(['L1']);
    });
  });

  describe('lesson ordering', () => {
    it('should sort lessons by order field', () => {
      const lessons = [
        makeLesson({ id: 'L3', order: 3 }),
        makeLesson({ id: 'L1', order: 1 }),
        makeLesson({ id: 'L2', order: 2 }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.lessons.map((l) => l.id)).toEqual(['L1', 'L2', 'L3']);
      expect(bundle.manifest.lessonOrder).toEqual(['L1', 'L2', 'L3']);
    });

    it('should use custom lessonOrder when provided', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1 }),
        makeLesson({ id: 'L2', order: 2 }),
        makeLesson({ id: 'L3', order: 3 }),
      ];

      const bundle = buildCourseBundle(lessons, {
        ...defaultOptions,
        lessonOrder: ['L3', 'L1', 'L2'],
      });

      expect(bundle.lessons.map((l) => l.id)).toEqual(['L3', 'L1', 'L2']);
      expect(bundle.manifest.lessonOrder).toEqual(['L3', 'L1', 'L2']);
    });

    it('should skip unknown IDs in lessonOrder', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1 }),
        makeLesson({ id: 'L2', order: 2 }),
      ];

      const bundle = buildCourseBundle(lessons, {
        ...defaultOptions,
        lessonOrder: ['L2', 'MISSING', 'L1'],
      });

      expect(bundle.lessons.map((l) => l.id)).toEqual(['L2', 'L1']);
    });
  });

  // --------------------------------------------------------------------------
  // Vocabulary Index
  // --------------------------------------------------------------------------

  describe('vocabulary index', () => {
    it('should index vocabulary items by word, id, category, and lesson', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'hello', translation: 'สวัสดี', category: 'greetings' },
              { id: 'v2', word: 'bye', translation: 'ลาก่อน' },
            ]),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const vocab = bundle.indices.vocabulary;

      // byWord
      expect(vocab.byWord.size).toBe(2);
      expect(vocab.byWord.get('hello')?.translation).toBe('สวัสดี');

      // byId
      expect(vocab.byId.get('v1')?.word).toBe('hello');
      expect(vocab.byId.get('v2')?.word).toBe('bye');

      // byCategory
      expect(vocab.byCategory.get('greetings')).toHaveLength(1);
      expect(vocab.byCategory.get('greetings')?.[0].word).toBe('hello');

      // byLesson
      expect(vocab.byLesson.get('L1')).toHaveLength(2);
    });

    it('should deduplicate vocabulary by word across lessons', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'hello', translation: 'สวัสดี' },
            ]),
          ] as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          children: [
            makeVocabSet('vs2', [
              { id: 'v1-dup', word: 'hello', translation: 'สวัสดี' },
              { id: 'v3', word: 'thanks', translation: 'ขอบคุณ' },
            ]),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const vocab = bundle.indices.vocabulary;

      // Deduplicated by word
      expect(vocab.byWord.size).toBe(2);

      // Entry appears in both lessons
      const helloEntry = vocab.byWord.get('hello');
      expect(helloEntry?.lessonIds).toEqual(['L1', 'L2']);
      expect(helloEntry?.firstAppearance).toBe('L1');

      // Original ID preserved (first occurrence)
      expect(helloEntry?.id).toBe('v1');
    });

    it('should handle lessons with no vocabulary', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [makeGrammarRule('g1', 'Rule', 'Explanation')] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.indices.vocabulary.byWord.size).toBe(0);
      expect(bundle.indices.vocabulary.byLesson.get('L1')).toEqual([]);
    });

    it('should handle empty vocabulary sets', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [makeVocabSet('vs1', [])] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.indices.vocabulary.byWord.size).toBe(0);
    });

    it('should index vocabulary with tags', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'cat', translation: 'แมว', tags: ['animal', 'pet'] },
            ]),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.indices.vocabulary.byWord.get('cat')?.tags).toEqual(['animal', 'pet']);
    });
  });

  // --------------------------------------------------------------------------
  // Grammar Rule Index
  // --------------------------------------------------------------------------

  describe('grammar rule index', () => {
    it('should index grammar rules by id and lesson', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeGrammarRule('g1', 'Subject Verb', 'SVO pattern'),
            makeGrammarRule('g2', 'Tones', 'Five tones'),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const grammar = bundle.indices.grammarRules;

      expect(grammar.byId.size).toBe(2);
      expect(grammar.byId.get('g1')?.title).toBe('Subject Verb');
      expect(grammar.byId.get('g2')?.explanation).toBe('Five tones');
      expect(grammar.byLesson.get('L1')).toHaveLength(2);
    });

    it('should deduplicate rules across lessons', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [makeGrammarRule('g1', 'SVO', 'Subject-Verb-Object')] as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          children: [makeGrammarRule('g1', 'SVO', 'Subject-Verb-Object')] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const entry = bundle.indices.grammarRules.byId.get('g1');

      expect(entry?.lessonIds).toEqual(['L1', 'L2']);
      expect(entry?.firstAppearance).toBe('L1');
    });

    it('should build dependency graph from relatedRules', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeGrammarRule('g1', 'Base', 'Base rule'),
            makeGrammarRule('g2', 'Advanced', 'Extends base', ['g1']),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const deps = bundle.indices.grammarRules.dependencies;

      expect(deps.get('g2')).toEqual(['g1']);
      expect(deps.has('g1')).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Exercise Index
  // --------------------------------------------------------------------------

  describe('exercise index', () => {
    it('should index exercises by id, type, lesson, and difficulty', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'multiple-choice', 'beginner'),
            makeExercise('ex2', 'fill-in-blank', 'intermediate'),
            makeExercise('ex3', 'multiple-choice'),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const exercises = bundle.indices.exercises;

      // byId
      expect(exercises.byId.size).toBe(3);
      expect(exercises.byId.get('ex1')?.exerciseType).toBe('multiple-choice');

      // byType
      expect(exercises.byType.get('multiple-choice' as any)).toHaveLength(2);
      expect(exercises.byType.get('fill-in-blank' as any)).toHaveLength(1);

      // byLesson
      expect(exercises.byLesson.get('L1')).toHaveLength(3);

      // byDifficulty
      expect(exercises.byDifficulty.get('beginner')).toHaveLength(1);
      expect(exercises.byDifficulty.get('intermediate')).toHaveLength(1);
    });

    it('should handle exercises without difficulty', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [makeExercise('ex1', 'true-false')] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const entry = bundle.indices.exercises.byId.get('ex1');

      expect(entry?.difficulty).toBeUndefined();
      expect(bundle.indices.exercises.byDifficulty.size).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Statistics
  // --------------------------------------------------------------------------

  describe('statistics', () => {
    it('should count all items correctly', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          difficulty: 'beginner' as any,
          cefrLevel: 'A1' as any,
          metadata: { estimatedTime: 30 } as any,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'hello', translation: 'hi' },
              { id: 'v2', word: 'bye', translation: 'bye' },
            ]),
            makeGrammarRule('g1', 'Rule 1', 'Explanation'),
            makeExercise('ex1', 'multiple-choice'),
          ] as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          difficulty: 'intermediate' as any,
          cefrLevel: 'A2' as any,
          metadata: { estimatedTime: 45 } as any,
          children: [
            makeVocabSet('vs2', [
              { id: 'v3', word: 'hello', translation: 'hi' }, // duplicate word
              { id: 'v4', word: 'thanks', translation: 'thanks' },
            ]),
            makeGrammarRule('g2', 'Rule 2', 'Explanation 2'),
            makeExercise('ex2', 'fill-in-blank', 'intermediate'),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);
      const stats = bundle.statistics;

      expect(stats.totalLessons).toBe(2);
      expect(stats.totalVocabularyItems).toBe(4); // total including duplicate "hello"
      expect(stats.uniqueVocabularyItems).toBe(3); // "hello", "bye", "thanks"
      expect(stats.totalGrammarRules).toBe(2);
      expect(stats.totalExercises).toBe(2);
      expect(stats.estimatedTotalTime).toBe(75);
    });

    it('should calculate CEFR level coverage', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1, cefrLevel: 'A1' as any }),
        makeLesson({ id: 'L2', order: 2, cefrLevel: 'A1' as any }),
        makeLesson({ id: 'L3', order: 3, cefrLevel: 'B1' as any }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.statistics.cefrLevelCoverage).toEqual({
        A1: 2,
        B1: 1,
      });
    });

    it('should handle array CEFR levels on a lesson', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1, cefrLevel: ['A1', 'A2'] as any }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.statistics.cefrLevelCoverage).toEqual({
        A1: 1,
        A2: 1,
      });
    });

    it('should calculate difficulty distribution', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1, difficulty: 'beginner' as any }),
        makeLesson({ id: 'L2', order: 2, difficulty: 'beginner' as any }),
        makeLesson({ id: 'L3', order: 3, difficulty: 'advanced' as any }),
        makeLesson({ id: 'L4', order: 4 }), // no difficulty
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.statistics.difficultyDistribution).toEqual({
        beginner: 2,
        advanced: 1,
      });
    });

    it('should calculate exercise type distribution', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'multiple-choice'),
            makeExercise('ex2', 'multiple-choice'),
            makeExercise('ex3', 'translation'),
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.statistics.exerciseTypeDistribution).toEqual({
        'multiple-choice': 2,
        'translation': 1,
      });
    });

    it('should default estimatedTotalTime to 0 when no metadata', () => {
      const lessons = [makeLesson({ id: 'L1', order: 1 })];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.estimatedTotalTime).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Mixed content lesson
  // --------------------------------------------------------------------------

  describe('mixed content', () => {
    it('should handle a lesson with all node types', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'word1', translation: 't1', category: 'cat1' },
            ]),
            makeGrammarRule('g1', 'Rule', 'Explanation', ['g0']),
            makeExercise('ex1', 'matching', 'beginner'),
            { type: 'content', format: 'markdown', value: '# Hello' },
            { type: 'dialogue', id: 'd1', participants: [], children: [] },
          ] as any,
        }),
      ];

      const bundle = buildCourseBundle(lessons, defaultOptions);

      expect(bundle.statistics.totalVocabularyItems).toBe(1);
      expect(bundle.statistics.totalGrammarRules).toBe(1);
      expect(bundle.statistics.totalExercises).toBe(1);
      expect(bundle.indices.grammarRules.dependencies.get('g1')).toEqual(['g0']);
    });
  });
});

// ============================================================================
// buildCourseBundleFromSyllabus
// ============================================================================

describe('buildCourseBundleFromSyllabus', () => {
  const makeSyllabus = (children: unknown[]): SyllabusRoot =>
    ({
      type: 'syllabusRoot',
      meta: {
        id: 'syllabus-001',
        title: 'Thai for Beginners',
        language: 'th',
        version: '1.0.0',
        source,
        extractedAt: '2025-01-01T00:00:00Z',
      },
      children,
    }) as SyllabusRoot;

  it('should extract lessons from flat syllabus', () => {
    const syllabus = makeSyllabus([
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Chapter 1',
        order: 1,
        children: [
          makeLesson({ id: 'L1', order: 1 }),
          makeLesson({ id: 'L2', order: 2 }),
        ],
      },
    ]);

    const bundle = buildCourseBundleFromSyllabus(syllabus);

    expect(bundle.lessons).toHaveLength(2);
    expect(bundle.manifest.id).toBe('syllabus-001');
    expect(bundle.manifest.title).toBe('Thai for Beginners');
    expect(bundle.manifest.language).toBe('th');
    expect(bundle.manifest.version).toBe('1.0.0');
    expect(bundle.manifest.source).toEqual(source);
    expect(bundle.syllabusRoot).toBe(syllabus);
  });

  it('should extract lessons from nested chapters and sections', () => {
    const syllabus = makeSyllabus([
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Chapter 1',
        order: 1,
        children: [
          {
            type: 'section',
            id: 'sec1',
            title: 'Section 1',
            order: 1,
            children: [
              makeLesson({ id: 'L1', order: 1 }),
            ],
          },
          {
            type: 'section',
            id: 'sec2',
            title: 'Section 2',
            order: 2,
            children: [
              makeLesson({ id: 'L2', order: 1 }),
              makeLesson({ id: 'L3', order: 2 }),
            ],
          },
        ],
      },
      {
        type: 'chapter',
        id: 'ch2',
        title: 'Chapter 2',
        order: 2,
        children: [
          makeLesson({ id: 'L4', order: 1 }),
        ],
      },
    ]);

    const bundle = buildCourseBundleFromSyllabus(syllabus);

    expect(bundle.lessons).toHaveLength(4);
    expect(bundle.statistics.totalLessons).toBe(4);
  });

  it('should allow option overrides', () => {
    const syllabus = makeSyllabus([
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Ch1',
        order: 1,
        children: [makeLesson({ id: 'L1', order: 1 })],
      },
    ]);

    const bundle = buildCourseBundleFromSyllabus(syllabus, {
      id: 'custom-id',
      title: 'Custom Title',
    });

    expect(bundle.manifest.id).toBe('custom-id');
    expect(bundle.manifest.title).toBe('Custom Title');
    // Non-overridden fields fall back to syllabus meta
    expect(bundle.manifest.language).toBe('th');
  });

  it('should handle empty syllabus', () => {
    const syllabus = makeSyllabus([]);
    const bundle = buildCourseBundleFromSyllabus(syllabus);

    expect(bundle.lessons).toHaveLength(0);
    expect(bundle.statistics.totalLessons).toBe(0);
  });

  it('should handle deeply nested sections', () => {
    const syllabus = makeSyllabus([
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Ch1',
        order: 1,
        children: [
          {
            type: 'section',
            id: 'sec1',
            title: 'Sec1',
            order: 1,
            children: [
              {
                type: 'section',
                id: 'sec1-1',
                title: 'Sub-section',
                order: 1,
                children: [
                  makeLesson({ id: 'deep-lesson', order: 1 }),
                ],
              },
            ],
          },
        ],
      },
    ]);

    const bundle = buildCourseBundleFromSyllabus(syllabus);

    expect(bundle.lessons).toHaveLength(1);
    expect(bundle.lessons[0].id).toBe('deep-lesson');
  });

  it('should build full indices from syllabus lessons', () => {
    const syllabus = makeSyllabus([
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Ch1',
        order: 1,
        children: [
          makeLesson({
            id: 'L1',
            order: 1,
            children: [
              makeVocabSet('vs1', [
                { id: 'v1', word: 'สวัสดี', translation: 'hello' },
              ]),
              makeGrammarRule('g1', 'Polite particles', 'Use ครับ/ค่ะ'),
              makeExercise('ex1', 'multiple-choice', 'beginner'),
            ] as any,
          }),
        ],
      },
    ]);

    const bundle = buildCourseBundleFromSyllabus(syllabus);

    expect(bundle.indices.vocabulary.byWord.get('สวัสดี')).toBeDefined();
    expect(bundle.indices.grammarRules.byId.get('g1')?.title).toBe('Polite particles');
    expect(bundle.indices.exercises.byId.get('ex1')?.exerciseType).toBe('multiple-choice');
    expect(bundle.statistics.totalVocabularyItems).toBe(1);
    expect(bundle.statistics.totalGrammarRules).toBe(1);
    expect(bundle.statistics.totalExercises).toBe(1);
  });
});

// ============================================================================
// Difficulty Breakdown
// ============================================================================

describe('difficulty breakdown', () => {
  describe('exercise complexity', () => {
    it('should score 0 when no exercises exist', () => {
      const lessons = [makeLesson({ id: 'L1', order: 1 })];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.exerciseComplexity).toBe(0);
    });

    it('should score low for simple exercise types (matching)', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'matching'),
            makeExercise('ex2', 'matching'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.exerciseComplexity).toBe(0);
    });

    it('should score medium for moderate exercise types (multiple-choice)', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'multiple-choice'),
            makeExercise('ex2', 'multiple-choice'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const score = bundle.statistics.difficultyBreakdown.factors.exerciseComplexity;
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(50);
    });

    it('should score high for complex exercise types (translation, open-ended)', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'translation'),
            makeExercise('ex2', 'open-ended'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.exerciseComplexity).toBeGreaterThan(70);
    });

    it('should calculate weighted average for mixed exercise types', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeExercise('ex1', 'matching'),
            makeExercise('ex2', 'translation'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const score = bundle.statistics.difficultyBreakdown.factors.exerciseComplexity;
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(80);
    });
  });

  describe('vocabulary density', () => {
    it('should score 0 when no lessons exist', () => {
      const bundle = buildCourseBundle([], defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.vocabularyDensity).toBe(0);
    });

    it('should score low for few vocabulary items per lesson', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'word1', translation: 't1' },
            ]),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.vocabularyDensity).toBeLessThan(30);
    });

    it('should score medium for moderate vocabulary density', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'word1', translation: 't1' },
              { id: 'v2', word: 'word2', translation: 't2' },
              { id: 'v3', word: 'word3', translation: 't3' },
              { id: 'v4', word: 'word4', translation: 't4' },
              { id: 'v5', word: 'word5', translation: 't5' },
              { id: 'v6', word: 'word6', translation: 't6' },
              { id: 'v7', word: 'word7', translation: 't7' },
              { id: 'v8', word: 'word8', translation: 't8' },
            ]),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const score = bundle.statistics.difficultyBreakdown.factors.vocabularyDensity;
      expect(score).toBeGreaterThan(25);
      expect(score).toBeLessThan(70);
    });

    it('should score high for many vocabulary items per lesson', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', Array.from({ length: 20 }, (_, i) => ({
              id: `v${i}`,
              word: `word${i}`,
              translation: `t${i}`,
            }))),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.vocabularyDensity).toBeGreaterThan(70);
    });

    it('should add bonus for high vocab-per-exercise ratio', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'word1', translation: 't1' },
              { id: 'v2', word: 'word2', translation: 't2' },
              { id: 'v3', word: 'word3', translation: 't3' },
              { id: 'v4', word: 'word4', translation: 't4' },
            ]),
            makeExercise('ex1', 'multiple-choice'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const score = bundle.statistics.difficultyBreakdown.factors.vocabularyDensity;
      expect(score).toBeGreaterThan(20);
    });
  });

  describe('prerequisite depth', () => {
    it('should score 0 when no prerequisites exist', () => {
      const lessons = [makeLesson({ id: 'L1', order: 1 })];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.prerequisiteDepth).toBe(0);
    });

    it('should score low for shallow prerequisite chains', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          metadata: { prerequisites: [] } as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          metadata: { prerequisites: ['L1'] } as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const score = bundle.statistics.difficultyBreakdown.factors.prerequisiteDepth;
      expect(score).toBeLessThan(30);
    });

    it('should score high for deep prerequisite chains', () => {
      const lessons = [
        makeLesson({ id: 'L1', order: 1 }),
        makeLesson({
          id: 'L2',
          order: 2,
          metadata: { prerequisites: ['L1'] } as any,
        }),
        makeLesson({
          id: 'L3',
          order: 3,
          metadata: { prerequisites: ['L2'] } as any,
        }),
        makeLesson({
          id: 'L4',
          order: 4,
          metadata: { prerequisites: ['L3'] } as any,
        }),
        makeLesson({
          id: 'L5',
          order: 5,
          metadata: { prerequisites: ['L4'] } as any,
        }),
        makeLesson({
          id: 'L6',
          order: 6,
          metadata: { prerequisites: ['L5'] } as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.prerequisiteDepth).toBeGreaterThan(60);
    });

    it('should consider grammar rule dependencies', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeGrammarRule('g1', 'Base', 'Base rule'),
            makeGrammarRule('g2', 'Level2', 'Extends g1', ['g1']),
            makeGrammarRule('g3', 'Level3', 'Extends g2', ['g2']),
            makeGrammarRule('g4', 'Level4', 'Extends g3', ['g3']),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.prerequisiteDepth).toBeGreaterThan(30);
    });
  });

  describe('content mix score', () => {
    it('should score 0 for empty lessons', () => {
      const bundle = buildCourseBundle([], defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.contentMixScore).toBe(0);
    });

    it('should score low for single content type', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [{ id: 'v1', word: 'word1', translation: 't1' }]),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.contentMixScore).toBe(20);
    });

    it('should score medium for 2-3 content types', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [{ id: 'v1', word: 'word1', translation: 't1' }]),
            makeGrammarRule('g1', 'Rule', 'Explanation'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.contentMixScore).toBe(40);
    });

    it('should score high for diverse content types', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [{ id: 'v1', word: 'word1', translation: 't1' }]),
            makeGrammarRule('g1', 'Rule', 'Explanation'),
            makeExercise('ex1', 'multiple-choice'),
            { type: 'content', format: 'markdown', value: '# Content' },
            { type: 'dialogue', id: 'd1', participants: [], children: [] },
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      expect(bundle.statistics.difficultyBreakdown.factors.contentMixScore).toBe(100);
    });

    it('should calculate average across multiple lessons', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [{ id: 'v1', word: 'word1', translation: 't1' }]),
          ] as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          children: [
            makeVocabSet('vs2', [{ id: 'v2', word: 'word2', translation: 't2' }]),
            makeGrammarRule('g1', 'Rule', 'Explanation'),
            makeExercise('ex1', 'multiple-choice'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      // L1: 20, L2: 60, average: 40
      expect(bundle.statistics.difficultyBreakdown.factors.contentMixScore).toBe(40);
    });
  });

  describe('overall difficulty score', () => {
    it('should classify as beginner for simple courses', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [
              { id: 'v1', word: 'word1', translation: 't1' },
            ]),
            makeExercise('ex1', 'matching'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const breakdown = bundle.statistics.difficultyBreakdown;
      expect(breakdown.overall).toBe('beginner');
      expect(breakdown.score).toBeLessThan(35);
    });

    it('should classify as intermediate for moderate courses', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', Array.from({ length: 10 }, (_, i) => ({
              id: `v${i}`,
              word: `word${i}`,
              translation: `t${i}`,
            }))),
            makeGrammarRule('g1', 'Rule', 'Explanation'),
            makeExercise('ex1', 'fill-in-blank'),
            makeExercise('ex2', 'multiple-choice'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const breakdown = bundle.statistics.difficultyBreakdown;
      expect(breakdown.overall).toBe('intermediate');
      expect(breakdown.score).toBeGreaterThanOrEqual(35);
      expect(breakdown.score).toBeLessThan(70);
    });

    it('should classify as advanced for complex courses', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', Array.from({ length: 20 }, (_, i) => ({
              id: `v${i}`,
              word: `word${i}`,
              translation: `t${i}`,
            }))),
            makeGrammarRule('g1', 'Rule 1', 'Explanation'),
            makeGrammarRule('g2', 'Rule 2', 'Depends on g1', ['g1']),
            makeGrammarRule('g3', 'Rule 3', 'Depends on g2', ['g2']),
            makeExercise('ex1', 'translation'),
            makeExercise('ex2', 'open-ended'),
            { type: 'dialogue', id: 'd1', participants: [], children: [] },
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const breakdown = bundle.statistics.difficultyBreakdown;
      expect(breakdown.overall).toBe('advanced');
      expect(breakdown.score).toBeGreaterThanOrEqual(70);
    });

    it('should return all factor scores between 0 and 100', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', [{ id: 'v1', word: 'word1', translation: 't1' }]),
            makeExercise('ex1', 'multiple-choice'),
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const { factors } = bundle.statistics.difficultyBreakdown;

      expect(factors.exerciseComplexity).toBeGreaterThanOrEqual(0);
      expect(factors.exerciseComplexity).toBeLessThanOrEqual(100);

      expect(factors.vocabularyDensity).toBeGreaterThanOrEqual(0);
      expect(factors.vocabularyDensity).toBeLessThanOrEqual(100);

      expect(factors.prerequisiteDepth).toBeGreaterThanOrEqual(0);
      expect(factors.prerequisiteDepth).toBeLessThanOrEqual(100);

      expect(factors.contentMixScore).toBeGreaterThanOrEqual(0);
      expect(factors.contentMixScore).toBeLessThanOrEqual(100);
    });

    it('should calculate overall score as weighted average', () => {
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          children: [
            makeVocabSet('vs1', Array.from({ length: 10 }, (_, i) => ({
              id: `v${i}`,
              word: `word${i}`,
              translation: `t${i}`,
            }))),
            makeGrammarRule('g1', 'Rule', 'Explanation'),
            makeExercise('ex1', 'translation'),
            { type: 'dialogue', id: 'd1', participants: [], children: [] },
          ] as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const { factors, score } = bundle.statistics.difficultyBreakdown;

      // Verify it's approximately the weighted average
      const expectedScore = Math.round(
        factors.exerciseComplexity * 0.35 +
        factors.vocabularyDensity * 0.35 +
        factors.prerequisiteDepth * 0.15 +
        factors.contentMixScore * 0.15
      );

      expect(score).toBe(expectedScore);
    });
  });

  describe('edge cases', () => {
    it('should handle empty course', () => {
      const bundle = buildCourseBundle([], defaultOptions);
      const breakdown = bundle.statistics.difficultyBreakdown;

      expect(breakdown.overall).toBe('beginner');
      expect(breakdown.score).toBe(0);
      expect(breakdown.factors.exerciseComplexity).toBe(0);
      expect(breakdown.factors.vocabularyDensity).toBe(0);
      expect(breakdown.factors.prerequisiteDepth).toBe(0);
      expect(breakdown.factors.contentMixScore).toBe(0);
    });

    it('should handle lessons with no children', () => {
      const lessons = [makeLesson({ id: 'L1', order: 1, children: [] as any })];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      const breakdown = bundle.statistics.difficultyBreakdown;

      expect(breakdown.overall).toBe('beginner');
      expect(breakdown.score).toBeLessThan(35);
    });

    it('should handle circular prerequisite references safely', () => {
      // This would be an authoring error, but we should not crash
      const lessons = [
        makeLesson({
          id: 'L1',
          order: 1,
          metadata: { prerequisites: ['L2'] } as any,
        }),
        makeLesson({
          id: 'L2',
          order: 2,
          metadata: { prerequisites: ['L1'] } as any,
        }),
      ];
      const bundle = buildCourseBundle(lessons, defaultOptions);
      // Should complete without errors
      expect(bundle.statistics.difficultyBreakdown).toBeDefined();
    });
  });
});
