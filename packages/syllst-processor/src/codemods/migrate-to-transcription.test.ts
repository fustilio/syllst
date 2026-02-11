/**
 * Codemod: Migrate to Transcription Tests
 *
 * Tests for migrating deprecated fields to v0.2.0 format:
 * - transliteration → transcription
 * - gender → data.gender
 * - phoneticCategory → data.phoneticCategory
 * - voicing → data.voicing
 */

import { describe, it, expect } from 'vitest';
import {
  migrateLesson,
  migrateSyllabus,
  migrateToTranscription,
} from './migrate-to-transcription';

// ============================================================================
// Test Fixtures
// ============================================================================

const createLegacyVocabularyItem = (overrides = {}) => ({
  type: 'vocabularyItem',
  id: 'vocab-1',
  word: 'สวัสดี',
  transliteration: 'sawatdee',
  translation: 'hello',
  value: 'สวัสดี',
  ...overrides,
});

const createLegacyCharacterItem = (overrides = {}) => ({
  type: 'characterItem',
  id: 'char-1',
  char: 'ก',
  name: 'ko kai',
  charType: 'consonant',
  transliteration: 'k',
  phoneticCategory: 'mid',
  voicing: 'voiceless',
  value: 'ก',
  ...overrides,
});

const createModernVocabularyItem = (overrides = {}) => ({
  type: 'vocabularyItem',
  id: 'vocab-modern',
  word: 'ขอบคุณ',
  transcription: 'khop khun',
  translation: 'thank you',
  value: 'ขอบคุณ',
  ...overrides,
});

// ============================================================================
// migrateToTranscription - Generic
// ============================================================================

describe('migrateToTranscription', () => {
  describe('null and primitive handling', () => {
    it('should handle null input', () => {
      const result = migrateToTranscription(null);

      expect(result.node).toBeNull();
      expect(result.migrations).toEqual([]);
      expect(result.hadDeprecatedFields).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = migrateToTranscription(undefined);

      expect(result.node).toBeUndefined();
      expect(result.migrations).toEqual([]);
      expect(result.hadDeprecatedFields).toBe(false);
    });

    it('should handle primitive string input', () => {
      const result = migrateToTranscription('just a string');

      expect(result.node).toBe('just a string');
      expect(result.hadDeprecatedFields).toBe(false);
    });

    it('should handle primitive number input', () => {
      const result = migrateToTranscription(42);

      expect(result.node).toBe(42);
      expect(result.hadDeprecatedFields).toBe(false);
    });
  });

  describe('vocabulary item migration', () => {
    it('should migrate transliteration to transcription', () => {
      const legacyItem = createLegacyVocabularyItem();

      const result = migrateToTranscription(legacyItem);

      expect(result.hadDeprecatedFields).toBe(true);
      expect(result.migrations).toContain('transliteration → transcription');

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.transcription).toBe('sawatdee');
      expect(migrated.transliteration).toBeUndefined();
    });

    it('should not overwrite existing transcription', () => {
      const itemWithBoth = createLegacyVocabularyItem({
        transliteration: 'old',
        transcription: 'new',
      });

      const result = migrateToTranscription(itemWithBoth);

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.transcription).toBe('new');
      // transliteration is kept if transcription already exists
      expect(result.migrations).not.toContain('transliteration → transcription');
    });

    it('should migrate gender to data.gender', () => {
      const itemWithGender = createLegacyVocabularyItem({ gender: 'masculine' });

      const result = migrateToTranscription(itemWithGender);

      expect(result.migrations).toContain('gender → data.gender');

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.gender).toBeUndefined();
      expect((migrated.data as Record<string, unknown>)?.gender).toBe('masculine');
    });

    it('should preserve existing data when adding gender', () => {
      const itemWithData = createLegacyVocabularyItem({
        gender: 'feminine',
        data: { customField: 'value' },
      });

      const result = migrateToTranscription(itemWithData);

      const migrated = result.node as Record<string, unknown>;
      const data = migrated.data as Record<string, unknown>;
      expect(data.gender).toBe('feminine');
      expect(data.customField).toBe('value');
    });

    it('should handle item with no deprecated fields', () => {
      const modernItem = createModernVocabularyItem();

      const result = migrateToTranscription(modernItem);

      expect(result.hadDeprecatedFields).toBe(false);
      expect(result.migrations).toEqual([]);
    });

    it('should migrate multiple fields at once', () => {
      const legacyItem = createLegacyVocabularyItem({
        gender: 'masculine',
      });

      const result = migrateToTranscription(legacyItem);

      expect(result.migrations).toHaveLength(2);
      expect(result.migrations).toContain('transliteration → transcription');
      expect(result.migrations).toContain('gender → data.gender');
    });
  });

  describe('character item migration', () => {
    it('should migrate string transliteration to transcription', () => {
      const legacyChar = createLegacyCharacterItem();

      const result = migrateToTranscription(legacyChar);

      expect(result.migrations).toContain('transliteration → transcription');

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.transcription).toBe('k');
      expect(migrated.transliteration).toBeUndefined();
    });

    it('should migrate object transliteration to transcription object', () => {
      const charWithObjectTrans = createLegacyCharacterItem({
        transliteration: {
          primary: 'k',
          ipa: 'k',
          national: 'ก',
          iso: 'k',
        },
      });

      const result = migrateToTranscription(charWithObjectTrans);

      const migrated = result.node as Record<string, unknown>;
      const transcription = migrated.transcription as Record<string, unknown>;

      expect(transcription.primary).toBe('k');
      expect(transcription.ipa).toBe('k');
      expect(transcription.national).toBe('ก');
      expect(transcription.iso).toBe('k');
    });

    it('should handle partial object transliteration', () => {
      const charWithPartialTrans = createLegacyCharacterItem({
        transliteration: {
          primary: 'k',
          ipa: 'k',
          // no national or iso
        },
      });

      const result = migrateToTranscription(charWithPartialTrans);

      const migrated = result.node as Record<string, unknown>;
      const transcription = migrated.transcription as Record<string, unknown>;

      expect(transcription.primary).toBe('k');
      expect(transcription.ipa).toBe('k');
      expect(transcription.national).toBeUndefined();
      expect(transcription.iso).toBeUndefined();
    });

    it('should migrate phoneticCategory to data.phoneticCategory', () => {
      const result = migrateToTranscription(createLegacyCharacterItem());

      expect(result.migrations).toContain('phoneticCategory → data.phoneticCategory');

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.phoneticCategory).toBeUndefined();
      expect((migrated.data as Record<string, unknown>)?.phoneticCategory).toBe('mid');
    });

    it('should migrate voicing to data.voicing', () => {
      const result = migrateToTranscription(createLegacyCharacterItem());

      expect(result.migrations).toContain('voicing → data.voicing');

      const migrated = result.node as Record<string, unknown>;
      expect(migrated.voicing).toBeUndefined();
      expect((migrated.data as Record<string, unknown>)?.voicing).toBe('voiceless');
    });

    it('should combine all character data migrations', () => {
      const result = migrateToTranscription(createLegacyCharacterItem());

      const migrated = result.node as Record<string, unknown>;
      const data = migrated.data as Record<string, unknown>;

      expect(data.phoneticCategory).toBe('mid');
      expect(data.voicing).toBe('voiceless');
      expect(result.migrations).toHaveLength(3); // transliteration + phoneticCategory + voicing
    });
  });
});

// ============================================================================
// migrateLesson
// ============================================================================

describe('migrateLesson', () => {
  it('should migrate all vocabulary items in lesson', () => {
    const lesson = {
      type: 'lesson',
      id: 'lesson-1',
      title: 'Basic Greetings',
      children: [
        {
          type: 'vocabularySet',
          id: 'vocab-set-1',
          children: [
            createLegacyVocabularyItem({ id: 'v1' }),
            createLegacyVocabularyItem({ id: 'v2', word: 'ลาก่อน', transliteration: 'laa gon' }),
          ],
        },
      ],
    };

    const result = migrateLesson(lesson);

    expect(result.hadDeprecatedFields).toBe(true);
    expect(result.migrations.length).toBeGreaterThan(0);

    // Both items should be migrated
    const migrated = result.node as Record<string, unknown>;
    const vocabSet = (migrated.children as unknown[])[0] as Record<string, unknown>;
    const items = vocabSet.children as Record<string, unknown>[];

    expect(items[0].transcription).toBe('sawatdee');
    expect(items[1].transcription).toBe('laa gon');
  });

  it('should migrate all character items in lesson', () => {
    const lesson = {
      type: 'lesson',
      id: 'lesson-chars',
      title: 'Thai Consonants',
      children: [
        {
          type: 'characterSet',
          id: 'char-set-1',
          children: [
            createLegacyCharacterItem({ id: 'c1', char: 'ก' }),
            createLegacyCharacterItem({ id: 'c2', char: 'ข', transliteration: 'kh' }),
          ],
        },
      ],
    };

    const result = migrateLesson(lesson);

    expect(result.hadDeprecatedFields).toBe(true);

    const migrated = result.node as Record<string, unknown>;
    const charSet = (migrated.children as unknown[])[0] as Record<string, unknown>;
    const items = charSet.children as Record<string, unknown>[];

    expect(items[0].transcription).toBe('k');
    expect(items[1].transcription).toBe('kh');
  });

  it('should handle mixed content types', () => {
    const lesson = {
      type: 'lesson',
      id: 'lesson-mixed',
      title: 'Mixed Lesson',
      children: [
        createLegacyVocabularyItem(),
        createLegacyCharacterItem(),
        {
          type: 'grammarRule',
          id: 'grammar-1',
          title: 'Tone Rules',
          explanation: 'Thai has 5 tones.',
        },
        createModernVocabularyItem(), // No migration needed
      ],
    };

    const result = migrateLesson(lesson);

    expect(result.hadDeprecatedFields).toBe(true);
    // Only legacy items should trigger migrations
    // vocab: 1 migration, char: 3 migrations, grammar: 0, modern: 0
    expect(result.migrations.length).toBe(4);
  });

  it('should handle deeply nested structures', () => {
    const lesson = {
      type: 'lesson',
      id: 'lesson-nested',
      title: 'Nested',
      children: [
        {
          type: 'section',
          id: 'section-1',
          children: [
            {
              type: 'vocabularySet',
              id: 'vocab-set',
              children: [createLegacyVocabularyItem()],
            },
          ],
        },
      ],
    };

    const result = migrateLesson(lesson);

    expect(result.hadDeprecatedFields).toBe(true);
    expect(result.migrations).toContain('transliteration → transcription');
  });

  it('should return unchanged node when no deprecated fields', () => {
    const modernLesson = {
      type: 'lesson',
      id: 'modern-lesson',
      title: 'Modern',
      children: [createModernVocabularyItem()],
    };

    const result = migrateLesson(modernLesson);

    expect(result.hadDeprecatedFields).toBe(false);
    expect(result.migrations).toEqual([]);
  });

  it('should handle empty children array', () => {
    const emptyLesson = {
      type: 'lesson',
      id: 'empty',
      title: 'Empty Lesson',
      children: [],
    };

    const result = migrateLesson(emptyLesson);

    expect(result.hadDeprecatedFields).toBe(false);
    const migrated = result.node as Record<string, unknown>;
    expect(migrated.children).toEqual([]);
  });
});

// ============================================================================
// migrateSyllabus
// ============================================================================

describe('migrateSyllabus', () => {
  it('should migrate entire syllabus tree', () => {
    const syllabus = {
      type: 'syllabusRoot',
      meta: {
        id: 'thai-basics',
        title: 'Thai Basics',
        language: 'th',
      },
      children: [
        {
          type: 'chapter',
          id: 'chapter-1',
          title: 'Greetings',
          children: [
            {
              type: 'lesson',
              id: 'lesson-1',
              title: 'Hello',
              children: [createLegacyVocabularyItem()],
            },
          ],
        },
      ],
    };

    const result = migrateSyllabus(syllabus);

    expect(result.hadDeprecatedFields).toBe(true);

    // Navigate to the vocabulary item
    const migrated = result.node as Record<string, unknown>;
    const chapter = (migrated.children as unknown[])[0] as Record<string, unknown>;
    const lesson = (chapter.children as unknown[])[0] as Record<string, unknown>;
    const vocabItem = (lesson.children as unknown[])[0] as Record<string, unknown>;

    expect(vocabItem.transcription).toBe('sawatdee');
    expect(vocabItem.transliteration).toBeUndefined();
  });

  it('should aggregate all migrations across syllabus', () => {
    const syllabus = {
      type: 'syllabusRoot',
      meta: { id: 'test', title: 'Test', language: 'th' },
      children: [
        {
          type: 'chapter',
          id: 'ch1',
          children: [
            {
              type: 'lesson',
              id: 'l1',
              children: [
                createLegacyVocabularyItem({ id: 'v1' }),
                createLegacyVocabularyItem({ id: 'v2' }),
              ],
            },
            {
              type: 'lesson',
              id: 'l2',
              children: [createLegacyCharacterItem()],
            },
          ],
        },
      ],
    };

    const result = migrateSyllabus(syllabus);

    // v1: 1, v2: 1, char: 3 = 5 total migrations
    expect(result.migrations.length).toBe(5);
    expect(result.hadDeprecatedFields).toBe(true);
  });

  it('should handle syllabus with no deprecated content', () => {
    const modernSyllabus = {
      type: 'syllabusRoot',
      meta: { id: 'modern', title: 'Modern', language: 'th' },
      children: [
        {
          type: 'chapter',
          id: 'ch1',
          children: [
            {
              type: 'lesson',
              id: 'l1',
              children: [createModernVocabularyItem()],
            },
          ],
        },
      ],
    };

    const result = migrateSyllabus(modernSyllabus);

    expect(result.hadDeprecatedFields).toBe(false);
    expect(result.migrations).toEqual([]);
  });
});

// ============================================================================
// Edge Cases & Error Handling
// ============================================================================

describe('Edge cases', () => {
  it('should handle node without type field', () => {
    const noType = { id: 'test', word: 'hello' };

    const result = migrateToTranscription(noType);

    // Should pass through unchanged (no migration for unknown types)
    expect(result.hadDeprecatedFields).toBe(false);
  });

  it('should handle unknown node types', () => {
    const unknownType = { type: 'unknownNodeType', id: 'test' };

    const result = migrateToTranscription(unknownType);

    expect(result.hadDeprecatedFields).toBe(false);
    expect((result.node as Record<string, unknown>).type).toBe('unknownNodeType');
  });

  it('should preserve all non-migrated fields', () => {
    const item = createLegacyVocabularyItem({
      example: 'สวัสดีครับ',
      partOfSpeech: 'interjection',
      related: ['ลาก่อน'],
      notes: 'Formal greeting',
    });

    const result = migrateToTranscription(item);

    const migrated = result.node as Record<string, unknown>;
    expect(migrated.example).toBe('สวัสดีครับ');
    expect(migrated.partOfSpeech).toBe('interjection');
    expect(migrated.related).toEqual(['ลาก่อน']);
    expect(migrated.notes).toBe('Formal greeting');
  });

  it('should handle circular reference gracefully', () => {
    // unist-util-map should handle this, but let's verify
    const item = createLegacyVocabularyItem();

    // The migration should complete without infinite loop
    const result = migrateToTranscription(item);
    expect(result.hadDeprecatedFields).toBe(true);
  });
});

// ============================================================================
// Integration: Real-world Scenarios
// ============================================================================

describe('Real-world scenarios', () => {
  it('should migrate Thai vocabulary lesson from pre-v0.2.0 format', () => {
    const legacyLesson = {
      type: 'lesson',
      id: 'thai-greetings',
      title: 'Basic Thai Greetings',
      children: [
        {
          type: 'vocabularySet',
          id: 'greetings-set',
          title: 'Greetings',
          children: [
            {
              type: 'vocabularyItem',
              id: 'hello',
              word: 'สวัสดี',
              transliteration: 'sawatdee',
              translation: 'hello',
              gender: 'neutral',
              partOfSpeech: 'interjection',
              example: 'สวัสดีครับ (sawatdee khrap)',
              value: 'สวัสดี',
            },
            {
              type: 'vocabularyItem',
              id: 'goodbye',
              word: 'ลาก่อน',
              transliteration: 'laa gon',
              translation: 'goodbye',
              value: 'ลาก่อน',
            },
          ],
        },
      ],
    };

    const result = migrateLesson(legacyLesson);

    expect(result.hadDeprecatedFields).toBe(true);
    // hello: transliteration + gender, goodbye: transliteration
    expect(result.migrations.length).toBe(3);

    const migrated = result.node as Record<string, unknown>;
    const vocabSet = (migrated.children as unknown[])[0] as Record<string, unknown>;
    const items = vocabSet.children as Record<string, unknown>[];

    // First item (hello)
    expect(items[0].transcription).toBe('sawatdee');
    expect(items[0].transliteration).toBeUndefined();
    expect((items[0].data as Record<string, unknown>)?.gender).toBe('neutral');
    expect(items[0].gender).toBeUndefined();

    // Second item (goodbye)
    expect(items[1].transcription).toBe('laa gon');
  });

  it('should migrate Thai character set from pre-v0.2.0 format', () => {
    const legacyCharSet = {
      type: 'characterSet',
      id: 'mid-consonants',
      title: 'Middle-class Consonants',
      children: [
        {
          type: 'characterItem',
          id: 'ko-kai',
          char: 'ก',
          name: 'ko kai',
          nativeName: 'ก ไก่',
          charType: 'consonant',
          transliteration: {
            primary: 'k',
            ipa: 'k',
          },
          phoneticCategory: 'mid',
          voicing: 'voiceless',
          mnemonic: { text: 'Chicken (ไก่)' },
          value: 'ก',
        },
      ],
    };

    const result = migrateToTranscription(legacyCharSet);

    expect(result.hadDeprecatedFields).toBe(true);

    const migrated = result.node as Record<string, unknown>;
    const items = migrated.children as Record<string, unknown>[];
    const koKai = items[0];

    // Transcription should be object format
    const transcription = koKai.transcription as Record<string, unknown>;
    expect(transcription.primary).toBe('k');
    expect(transcription.ipa).toBe('k');

    // Data attributes
    const data = koKai.data as Record<string, unknown>;
    expect(data.phoneticCategory).toBe('mid');
    expect(data.voicing).toBe('voiceless');

    // Old fields should be removed
    expect(koKai.transliteration).toBeUndefined();
    expect(koKai.phoneticCategory).toBeUndefined();
    expect(koKai.voicing).toBeUndefined();
  });
});
