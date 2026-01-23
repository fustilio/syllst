import { describe, it, expect } from 'vitest';
import { buildLessonFromMDX, validateLessonStructure } from './syllabus-builder';
import type { LessonAstNode } from '@syllst/core/types';

describe('Syllabus Builder', () => {
  describe('buildLessonFromMDX', () => {
    it('should build lesson from simple MDX', async () => {
      const mdx = `---
type: lesson
id: test-lesson
title: "Test Lesson"
order: 1
difficulty: beginner
cefrLevel: A1
categories:
  - grammar
---

# Test Lesson

This is a test lesson.
`;

      const lesson = await buildLessonFromMDX(mdx);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('test-lesson');
      expect(lesson.title).toBe('Test Lesson');
      expect(lesson.order).toBe(1);
      expect(lesson.difficulty).toBe('beginner');
      expect(lesson.cefrLevel).toBe('A1');
      expect(lesson.categories).toContain('grammar');
    });

    it('should build lesson with grammar rules', async () => {
      const mdx = `---
type: lesson
id: unit-01
title: "Unit 1"
order: 1
---

:::grammar-rule{id="rule-001" title="Basic Pattern"}
The pattern **यह (X) है** means "This is (X)".

:::example{id="ex-001" text="यह चीन है ।" translation="This is China."}
:::

:::
`;

      const lesson = await buildLessonFromMDX(mdx);

      expect(lesson.children).toBeDefined();
      const grammarRule = lesson.children.find(child => child.type === 'grammarRule');
      expect(grammarRule).toBeDefined();

      if (grammarRule?.type === 'grammarRule') {
        expect(grammarRule.id).toBe('rule-001');
        expect(grammarRule.title).toBe('Basic Pattern');
        expect(grammarRule.explanation).toContain('यह (X) है');
      }
    });

    it('should build lesson with vocabulary sets', async () => {
      const mdx = `---
type: lesson
id: unit-01
title: "Unit 1"
order: 1
---

:::vocabulary-set{id="vocab-set-1" title="Basic Words"}

::vocab{id="vocab-yah" word="यह" translation="this" partOfSpeech="pronoun"}
::

::vocab{id="vocab-hai" word="है" translation="is" partOfSpeech="verb"}
::

:::
`;

      const lesson = await buildLessonFromMDX(mdx);

      const vocabSet = lesson.children.find(child => child.type === 'vocabularySet');
      expect(vocabSet).toBeDefined();

      if (vocabSet?.type === 'vocabularySet') {
        expect(vocabSet.id).toBe('vocab-set-1');
        expect(vocabSet.title).toBe('Basic Words');
        expect(vocabSet.children).toHaveLength(2);

        const firstVocab = vocabSet.children[0];
        if (firstVocab && firstVocab.type === 'vocabularyItem') {
          expect(firstVocab.word).toBe('यह');
          expect(firstVocab.translation).toBe('this');
          expect(firstVocab.partOfSpeech).toBe('pronoun');
        }
      }
    });

    it('should build lesson with examples', async () => {
      const mdx = `---
type: lesson
id: unit-01
title: "Unit 1"
order: 1
---

:::example-set{id="examples-1" title="Common Expressions"}

::example{id="ex-1" text="मालूम नहीं ।" translation="I don't know."}
::

::example{id="ex-2" text="याद नहीं ।" translation="I don't remember."}
::

:::
`;

      const lesson = await buildLessonFromMDX(mdx);

      const exampleSet = lesson.children.find(child => child.type === 'exampleSet');
      expect(exampleSet).toBeDefined();

      if (exampleSet?.type === 'exampleSet') {
        expect(exampleSet.id).toBe('examples-1');
        expect(exampleSet.title).toBe('Common Expressions');
        expect(exampleSet.children).toHaveLength(2);

        const firstExample = exampleSet.children[0];
        if (firstExample && firstExample.type === 'example') {
          expect(firstExample.text).toBe('मालूम नहीं ।');
          expect(firstExample.translation).toBe("I don't know.");
        }
      }
    });

    it('should build lesson with exercises', async () => {
      const mdx = `---
type: lesson
id: unit-01
title: "Unit 1"
order: 1
---

:::exercise{id="ex-fill-1" type="fill-in-blank" difficulty="beginner"}
**Question:** यह _____ है। (This is China)

**Answer:** चीन

**Explanation:** चीन means China in Hindi.
:::
`;

      const lesson = await buildLessonFromMDX(mdx);

      const exercise = lesson.children.find(child => child.type === 'exercise');
      expect(exercise).toBeDefined();

      if (exercise?.type === 'exercise') {
        expect(exercise.id).toBe('ex-fill-1');
        expect(exercise.exerciseType).toBe('fill-in-blank');
        expect(exercise.difficulty).toBe('beginner');
        expect(exercise.question).toContain('यह _____ है');
        expect(exercise.answer).toContain('चीन');
        expect(exercise.explanation).toContain('चीन means China');
      }
    });

    it('should handle complex lesson with multiple sections', async () => {
      const mdx = `---
type: lesson
id: unit-01-complex
title: "Complex Unit"
order: 1
difficulty: beginner
cefrLevel: A1
categories:
  - grammar
  - vocabulary
metadata:
  pageNumber: 1
  estimatedTime: 30
---

# Complex Lesson

Introduction text.

:::grammar-rule{id="rule-001" title="Pattern 1"}
Explanation of pattern 1.
:::

:::vocabulary-set{id="vocab-1"}
::vocab{word="word1" translation="translation1"}
::
::vocab{word="word2" translation="translation2"}
::
:::

:::example-set{id="examples-1"}
::example{text="example1" translation="trans1"}
::
:::

:::exercise{id="ex-1" type="translation"}
**Question:** Translate this.
**Answer:** The answer.
:::
`;

      const lesson = await buildLessonFromMDX(mdx);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('unit-01-complex');
      expect(lesson.metadata?.pageNumber).toBe(1);
      expect(lesson.metadata?.estimatedTime).toBe(30);

      // Check all directive types are present
      const hasGrammar = lesson.children.some(c => c.type === 'grammarRule');
      const hasVocab = lesson.children.some(c => c.type === 'vocabularySet');
      const hasExamples = lesson.children.some(c => c.type === 'exampleSet');
      const hasExercises = lesson.children.some(c => c.type === 'exercise');

      expect(hasGrammar).toBe(true);
      expect(hasVocab).toBe(true);
      expect(hasExamples).toBe(true);
      expect(hasExercises).toBe(true);
    });
  });

  describe('validateLessonStructure', () => {
    it('should validate correct lesson', async () => {
      const mdx = `---
type: lesson
id: valid-lesson
title: "Valid Lesson"
order: 1
---

:::grammar-rule{id="rule-001" title="Rule"}
Explanation.
:::
`;

      const lesson = await buildLessonFromMDX(mdx);
      const validation = validateLessonStructure(lesson);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing ID', () => {
      const lesson: LessonAstNode = {
        type: 'lesson',
        id: '',
        title: 'Test',
        order: 1,
        children: [],
      };

      const validation = validateLessonStructure(lesson);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Lesson must have an id');
    });

    it('should detect missing children', () => {
      const lesson: LessonAstNode = {
        type: 'lesson',
        id: 'test',
        title: 'Test',
        order: 1,
        children: [],
      };

      const validation = validateLessonStructure(lesson);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Lesson must have children (grammar rules, vocabulary, etc.)');
    });
  });
});
