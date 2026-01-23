/**
 * Tests for Base Zod Schemas
 */

import { describe, it, expect } from 'vitest';
import {
  PointSchema,
  PositionSchema,
  DataSchema,
  CEFRLevelSchema,
  GrammarDifficultySchema,
  CharacterTypeSchema,
  PhoneticCategorySchema,
  VoicingTypeSchema,
  ExerciseTypeSchema,
  ContentFormatSchema,
  GrammaticalGenderSchema,
  SyllabusSourceInfoSchema,
  LessonMetadataSchema,
  CharacterMnemonicSchema,
  CharacterTransliterationSchema,
  CharacterVariantSchema,
  ExerciseItemSchema,
} from './base';

describe('Base Zod Schemas', () => {
  describe('PointSchema', () => {
    it('should validate a valid point', () => {
      const result = PointSchema.safeParse({
        line: 1,
        column: 5,
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate a point with offset', () => {
      const result = PointSchema.safeParse({
        line: 10,
        column: 3,
        offset: 150,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject zero line', () => {
      const result = PointSchema.safeParse({
        line: 0,
        column: 5,
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject negative column', () => {
      const result = PointSchema.safeParse({
        line: 1,
        column: -1,
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const result = PointSchema.safeParse({
        line: 1,
        column: 1,
        offset: -5,
      });
      
      expect(result.success).toBe(false);
    });

    it('should accept offset of zero', () => {
      const result = PointSchema.safeParse({
        line: 1,
        column: 1,
        offset: 0,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject non-integer line', () => {
      const result = PointSchema.safeParse({
        line: 1.5,
        column: 1,
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('PositionSchema', () => {
    it('should validate a valid position', () => {
      const result = PositionSchema.safeParse({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 10 },
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject missing start', () => {
      const result = PositionSchema.safeParse({
        end: { line: 1, column: 10 },
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject missing end', () => {
      const result = PositionSchema.safeParse({
        start: { line: 1, column: 1 },
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid start point', () => {
      const result = PositionSchema.safeParse({
        start: { line: 0, column: 1 },
        end: { line: 1, column: 10 },
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('DataSchema', () => {
    it('should validate empty object', () => {
      const result = DataSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate object with various values', () => {
      const result = DataSchema.safeParse({
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: { deep: 'value' },
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('CEFRLevelSchema', () => {
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    it.each(validLevels)('should accept valid CEFR level: %s', (level) => {
      const result = CEFRLevelSchema.safeParse(level);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CEFR level', () => {
      expect(CEFRLevelSchema.safeParse('A3').success).toBe(false);
      expect(CEFRLevelSchema.safeParse('B3').success).toBe(false);
      expect(CEFRLevelSchema.safeParse('C3').success).toBe(false);
      expect(CEFRLevelSchema.safeParse('D1').success).toBe(false);
      expect(CEFRLevelSchema.safeParse('a1').success).toBe(false);
      expect(CEFRLevelSchema.safeParse('').success).toBe(false);
    });
  });

  describe('GrammarDifficultySchema', () => {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    
    it.each(validLevels)('should accept valid difficulty: %s', (level) => {
      const result = GrammarDifficultySchema.safeParse(level);
      expect(result.success).toBe(true);
    });

    it('should reject invalid difficulty levels', () => {
      expect(GrammarDifficultySchema.safeParse('easy').success).toBe(false);
      expect(GrammarDifficultySchema.safeParse('hard').success).toBe(false);
      expect(GrammarDifficultySchema.safeParse('Beginner').success).toBe(false);
    });
  });

  describe('CharacterTypeSchema', () => {
    it('should accept vowel', () => {
      expect(CharacterTypeSchema.safeParse('vowel').success).toBe(true);
    });

    it('should accept consonant', () => {
      expect(CharacterTypeSchema.safeParse('consonant').success).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(CharacterTypeSchema.safeParse('diphthong').success).toBe(false);
      expect(CharacterTypeSchema.safeParse('semivowel').success).toBe(false);
    });
  });

  describe('PhoneticCategorySchema', () => {
    const validCategories = ['stop', 'fricative', 'affricate', 'nasal', 'liquid', 'approximant', 'trill'];
    
    it.each(validCategories)('should accept valid category: %s', (category) => {
      const result = PhoneticCategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(PhoneticCategorySchema.safeParse('plosive').success).toBe(false);
      expect(PhoneticCategorySchema.safeParse('click').success).toBe(false);
    });
  });

  describe('VoicingTypeSchema', () => {
    const validTypes = ['voiced', 'voiceless', 'ejective', 'aspirated'];
    
    it.each(validTypes)('should accept valid voicing: %s', (type) => {
      const result = VoicingTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });

    it('should reject invalid voicing types', () => {
      expect(VoicingTypeSchema.safeParse('breathy').success).toBe(false);
    });
  });

  describe('ExerciseTypeSchema', () => {
    const validTypes = [
      'fill-in-blank',
      'multiple-choice',
      'translation',
      'transformation',
      'matching',
      'true-false',
      'open-ended',
      'pattern-practice',
      'dialogue',
    ];
    
    it.each(validTypes)('should accept valid exercise type: %s', (type) => {
      const result = ExerciseTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });

    it('should reject invalid exercise types', () => {
      expect(ExerciseTypeSchema.safeParse('quiz').success).toBe(false);
      expect(ExerciseTypeSchema.safeParse('drag-drop').success).toBe(false);
    });
  });

  describe('ContentFormatSchema', () => {
    const validFormats = ['markdown', 'text', 'html', 'glost', 'glost-dialogue'];
    
    it.each(validFormats)('should accept valid format: %s', (format) => {
      const result = ContentFormatSchema.safeParse(format);
      expect(result.success).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(ContentFormatSchema.safeParse('json').success).toBe(false);
      expect(ContentFormatSchema.safeParse('mdx').success).toBe(false);
    });
  });

  describe('GrammaticalGenderSchema', () => {
    const validGenders = ['masculine', 'feminine', 'neuter'];
    
    it.each(validGenders)('should accept valid gender: %s', (gender) => {
      const result = GrammaticalGenderSchema.safeParse(gender);
      expect(result.success).toBe(true);
    });

    it('should reject invalid genders', () => {
      expect(GrammaticalGenderSchema.safeParse('neutral').success).toBe(false);
      expect(GrammaticalGenderSchema.safeParse('common').success).toBe(false);
    });
  });

  describe('SyllabusSourceInfoSchema', () => {
    it('should validate minimal source info', () => {
      const result = SyllabusSourceInfoSchema.safeParse({
        title: 'Test Book',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete source info', () => {
      const result = SyllabusSourceInfoSchema.safeParse({
        title: 'Test Book',
        url: 'https://example.com/book',
        pdfUrl: 'https://example.com/book.pdf',
        authors: ['John Doe', 'Jane Smith'],
        year: 2024,
        publisher: 'Test Publisher',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = SyllabusSourceInfoSchema.safeParse({
        title: '',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL', () => {
      const result = SyllabusSourceInfoSchema.safeParse({
        title: 'Test',
        url: 'not-a-url',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid year', () => {
      const result = SyllabusSourceInfoSchema.safeParse({
        title: 'Test',
        year: -100,
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('LessonMetadataSchema', () => {
    it('should validate empty metadata', () => {
      const result = LessonMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate complete metadata', () => {
      const result = LessonMetadataSchema.safeParse({
        pageNumber: 42,
        sectionNumber: '3.2',
        estimatedTime: 30,
        prerequisites: ['lesson-01', 'lesson-02'],
        objectives: ['Learn greetings', 'Practice pronunciation'],
        takeaways: ['Key pattern 1', 'Key pattern 2'],
        culturalNotes: 'Important cultural context',
        notes: 'Additional notes',
        sourceFile: 'lesson-03.mdx',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject non-positive page number', () => {
      const result = LessonMetadataSchema.safeParse({
        pageNumber: 0,
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject non-positive estimated time', () => {
      const result = LessonMetadataSchema.safeParse({
        estimatedTime: -5,
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterMnemonicSchema', () => {
    it('should validate minimal mnemonic', () => {
      const result = CharacterMnemonicSchema.safeParse({
        text: 'Remember this character',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete mnemonic', () => {
      const result = CharacterMnemonicSchema.safeParse({
        text: 'Looks like a house',
        imageUrl: 'https://example.com/image.png',
        association: 'Home',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const result = CharacterMnemonicSchema.safeParse({
        text: '',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const result = CharacterMnemonicSchema.safeParse({
        text: 'Test',
        imageUrl: 'not-a-url',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterTransliterationSchema', () => {
    it('should validate minimal transliteration', () => {
      const result = CharacterTransliterationSchema.safeParse({
        primary: 'a',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete transliteration', () => {
      const result = CharacterTransliterationSchema.safeParse({
        primary: 'a',
        ipa: 'æ',
        national: 'ae',
        iso: 'a',
      });
      
      expect(result.success).toBe(true);
    });

    it('should allow additional keys (catchall)', () => {
      const result = CharacterTransliterationSchema.safeParse({
        primary: 'a',
        custom: 'custom-value',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty primary', () => {
      const result = CharacterTransliterationSchema.safeParse({
        primary: '',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterVariantSchema', () => {
    it('should validate valid variant', () => {
      const result = CharacterVariantSchema.safeParse({
        name: 'Initial form',
        form: 'ა',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = CharacterVariantSchema.safeParse({
        name: '',
        form: 'ა',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject empty form', () => {
      const result = CharacterVariantSchema.safeParse({
        name: 'Initial',
        form: '',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('ExerciseItemSchema', () => {
    it('should validate minimal exercise item', () => {
      const result = ExerciseItemSchema.safeParse({
        question: 'What is 2+2?',
        answer: '4',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate exercise item with hint', () => {
      const result = ExerciseItemSchema.safeParse({
        question: 'Translate: Hello',
        answer: 'สวัสดี',
        hint: 'Common greeting',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty question', () => {
      const result = ExerciseItemSchema.safeParse({
        question: '',
        answer: 'test',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject empty answer', () => {
      const result = ExerciseItemSchema.safeParse({
        question: 'Test?',
        answer: '',
      });
      
      expect(result.success).toBe(false);
    });
  });
});
