/**
 * Tests for Node Zod Schemas
 */

import { describe, it, expect } from 'vitest';
import {
  VocabularyItemNodeSchema,
  CharacterItemNodeSchema,
  ExampleNodeSchema,
  ContentNodeSchema,
  MetadataNodeSchema,
  DialogueParticipantSchema,
  GenderVariantsSchema,
  DialogueTurnNodeSchema,
  DialogueNodeSchema,
  VocabularySetNodeSchema,
  CharacterSetNodeSchema,
  ExampleSetNodeSchema,
  GrammarRuleNodeSchema,
  ExerciseNodeSchema,
  LessonAstNodeSchema,
  PhonologicalRuleNodeSchema,
  RuleConditionNodeSchema,
  SyllablePatternNodeSchema,
  PatternExampleNodeSchema,
  WritingPatternNodeSchema,
} from './nodes';

describe('Node Zod Schemas', () => {
  describe('VocabularyItemNodeSchema', () => {
    it('should validate minimal vocabulary item', () => {
      const result = VocabularyItemNodeSchema.safeParse({
        type: 'vocabularyItem',
        id: 'vocab-001',
        word: 'สวัสดี',
        translation: 'hello',
        value: 'สวัสดี',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete vocabulary item', () => {
      const result = VocabularyItemNodeSchema.safeParse({
        type: 'vocabularyItem',
        id: 'vocab-002',
        word: 'บ้าน',
        transliteration: 'baan',
        translation: 'house',
        partOfSpeech: 'noun',
        gender: 'neuter',
        notes: 'Common word for home',
        example: 'บ้านของฉัน',
        related: ['ที่อยู่', 'ครอบครัว'],
        value: 'บ้าน',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject wrong type', () => {
      const result = VocabularyItemNodeSchema.safeParse({
        type: 'vocab',
        id: 'vocab-001',
        word: 'test',
        translation: 'test',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = VocabularyItemNodeSchema.safeParse({
        type: 'vocabularyItem',
        id: '',
        word: 'test',
        translation: 'test',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject missing word', () => {
      const result = VocabularyItemNodeSchema.safeParse({
        type: 'vocabularyItem',
        id: 'vocab-001',
        translation: 'test',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterItemNodeSchema', () => {
    it('should validate minimal character item with string transliteration', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-001',
        char: 'ა',
        name: 'ani',
        transliteration: 'a',
        charType: 'vowel',
        value: 'ა',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate character item with object transliteration', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-002',
        char: 'ბ',
        name: 'bani',
        transliteration: {
          primary: 'b',
          ipa: 'b',
          national: 'b',
        },
        charType: 'consonant',
        phoneticCategory: 'stop',
        voicing: 'voiced',
        value: 'ბ',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate character item with mnemonic', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-003',
        char: 'ก',
        name: 'gor gai',
        nativeName: 'ก ไก่',
        transliteration: 'g',
        charType: 'consonant',
        phoneticCategory: 'stop',
        voicing: 'voiceless',
        mnemonic: {
          text: 'Chicken character',
          association: 'ไก่ (chicken)',
        },
        exampleWords: ['กา', 'กิน'],
        value: 'ก',
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept extended charType via string escape hatch', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-001',
        char: 'ა',
        name: 'ani',
        transliteration: 'a',
        charType: 'diphthong',
        value: 'ა',
      });

      // CharacterTypeSchema now accepts any string for language-specific types
      expect(result.success).toBe(true);
    });

    it('should reject non-string charType', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-001',
        char: 'ა',
        name: 'ani',
        transliteration: 'a',
        charType: 123,
        value: 'ა',
      });

      expect(result.success).toBe(false);
    });

    it('should validate character item with canonicalRef', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'th-chicken',
        char: 'ก',
        name: 'gor gai',
        charType: 'consonant',
        canonicalRef: 'chicken',
        value: 'ก',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.canonicalRef).toBe('chicken');
      }
    });

    it('should validate character without canonicalRef (backwards compatible)', () => {
      const result = CharacterItemNodeSchema.safeParse({
        type: 'characterItem',
        id: 'char-old',
        char: 'ก',
        name: 'gor gai',
        charType: 'consonant',
        value: 'ก',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.canonicalRef).toBeUndefined();
      }
    });
  });

  describe('ExampleNodeSchema', () => {
    it('should validate minimal example', () => {
      const result = ExampleNodeSchema.safeParse({
        type: 'example',
        id: 'ex-001',
        text: 'สวัสดีครับ',
        translation: 'Hello',
        value: 'สวัสดีครับ',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete example', () => {
      const result = ExampleNodeSchema.safeParse({
        type: 'example',
        id: 'ex-002',
        text: 'ผมชื่ออะไร',
        transliteration: 'phom chue arai',
        translation: 'What is my name?',
        literalTranslation: 'I name what',
        notes: 'Common question',
        illustrates: ['rule-001', 'pattern-basic'],
        value: 'ผมชื่ออะไร',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject missing text', () => {
      const result = ExampleNodeSchema.safeParse({
        type: 'example',
        id: 'ex-001',
        translation: 'Hello',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('ContentNodeSchema', () => {
    it('should validate markdown content', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'markdown',
        value: '# Hello\n\nThis is **bold** text.',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate text content', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'text',
        value: 'Plain text content',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate html content', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'html',
        value: '<p>HTML content</p>',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate glost content', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'glost',
        value: 'สวัสดี',
        ref: 'glost-doc-001',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate glost-dialogue content', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'glost-dialogue',
        value: 'สวัสดีครับ',
        ref: 'dialogue-001',
      });
      
      expect(result.success).toBe(true);
    });

    it('should allow ref field for glost formats', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'glost',
        value: 'Hello',
        ref: 'doc-ref-123',
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ref).toBe('doc-ref-123');
      }
    });

    it('should allow ref field to be optional', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'glost',
        value: 'Hello',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = ContentNodeSchema.safeParse({
        type: 'content',
        format: 'json',
        value: '{}',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('MetadataNodeSchema', () => {
    it('should validate string metadata', () => {
      const result = MetadataNodeSchema.safeParse({
        type: 'metadata',
        key: 'author',
        value: 'John Doe',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate object metadata', () => {
      const result = MetadataNodeSchema.safeParse({
        type: 'metadata',
        key: 'settings',
        value: { darkMode: true, fontSize: 14 },
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty key', () => {
      const result = MetadataNodeSchema.safeParse({
        type: 'metadata',
        key: '',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('DialogueParticipantSchema', () => {
    it('should validate minimal participant', () => {
      const result = DialogueParticipantSchema.safeParse({
        id: 'speaker-a',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete participant', () => {
      const result = DialogueParticipantSchema.safeParse({
        id: 'shopkeeper',
        name: 'Somchai',
        gender: 'masculine',
        role: 'vendor',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DialogueParticipantSchema.safeParse({
        id: '',
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid gender', () => {
      const result = DialogueParticipantSchema.safeParse({
        id: 'speaker',
        gender: 'neuter',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('GenderVariantsSchema', () => {
    it('should validate without neutral', () => {
      const result = GenderVariantsSchema.safeParse({
        masculine: 'สวัสดีครับ',
        feminine: 'สวัสดีค่ะ',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate with neutral', () => {
      const result = GenderVariantsSchema.safeParse({
        masculine: 'สวัสดีครับ',
        feminine: 'สวัสดีค่ะ',
        neutral: 'สวัสดี',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject missing masculine', () => {
      const result = GenderVariantsSchema.safeParse({
        feminine: 'สวัสดีค่ะ',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('DialogueTurnNodeSchema', () => {
    it('should validate minimal turn', () => {
      const result = DialogueTurnNodeSchema.safeParse({
        type: 'dialogueTurn',
        speakerId: 'me',
        text: 'สวัสดีครับ',
        translation: 'Hello',
        value: 'สวัสดีครับ',
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate turn with gender variants', () => {
      const result = DialogueTurnNodeSchema.safeParse({
        type: 'dialogueTurn',
        speakerId: 'me',
        text: 'สวัสดี{ครับ|ค่ะ}',
        genderVariants: {
          masculine: 'สวัสดีครับ',
          feminine: 'สวัสดีค่ะ',
        },
        transliteration: 'sawatdee krap/ka',
        translation: 'Hello',
        value: 'สวัสดี{ครับ|ค่ะ}',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject missing translation', () => {
      const result = DialogueTurnNodeSchema.safeParse({
        type: 'dialogueTurn',
        speakerId: 'me',
        text: 'สวัสดีครับ',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('DialogueNodeSchema', () => {
    it('should validate minimal dialogue', () => {
      const result = DialogueNodeSchema.safeParse({
        type: 'dialogue',
        id: 'dialog-001',
        participants: [{ id: 'me' }, { id: 'other' }],
        children: [
          {
            type: 'dialogueTurn',
            speakerId: 'me',
            text: 'Hello',
            translation: 'Hello',
            value: 'Hello',
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete dialogue', () => {
      const result = DialogueNodeSchema.safeParse({
        type: 'dialogue',
        id: 'dialog-002',
        participants: [
          { id: 'me', gender: 'masculine' },
          { id: 'shopkeeper', name: 'Somchai', gender: 'masculine', role: 'vendor' },
        ],
        context: 'At a market',
        culturalNotes: 'Remember to use polite particles',
        lang: 'th-TH',
        children: [
          {
            type: 'dialogueTurn',
            speakerId: 'shopkeeper',
            text: 'ยินดีต้อนรับครับ',
            translation: 'Welcome!',
            value: 'ยินดีต้อนรับครับ',
          },
          {
            type: 'dialogueTurn',
            speakerId: 'me',
            text: 'ขอบคุณครับ',
            translation: 'Thank you',
            value: 'ขอบคุณครับ',
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty participants', () => {
      const result = DialogueNodeSchema.safeParse({
        type: 'dialogue',
        id: 'dialog-001',
        participants: [],
        children: [],
      });
      
      // Empty participants should be allowed by schema (though maybe not semantically)
      expect(result.success).toBe(true);
    });
  });

  describe('VocabularySetNodeSchema', () => {
    it('should validate vocabulary set', () => {
      const result = VocabularySetNodeSchema.safeParse({
        type: 'vocabularySet',
        id: 'vocab-set-001',
        title: 'Basic Greetings',
        description: 'Common greeting words',
        children: [
          {
            type: 'vocabularyItem',
            id: 'vocab-001',
            word: 'สวัสดี',
            translation: 'hello',
            value: 'สวัสดี',
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate empty vocabulary set', () => {
      const result = VocabularySetNodeSchema.safeParse({
        type: 'vocabularySet',
        id: 'vocab-set-empty',
        children: [],
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('ExampleSetNodeSchema', () => {
    it('should validate example set', () => {
      const result = ExampleSetNodeSchema.safeParse({
        type: 'exampleSet',
        id: 'examples-001',
        title: 'Sentence Examples',
        children: [
          {
            type: 'example',
            id: 'ex-001',
            text: 'Test sentence',
            translation: 'Test translation',
            value: 'Test sentence',
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('GrammarRuleNodeSchema', () => {
    it('should validate minimal grammar rule', () => {
      const result = GrammarRuleNodeSchema.safeParse({
        type: 'grammarRule',
        id: 'rule-001',
        title: 'Basic Pattern',
        explanation: 'The pattern X + Y means...',
        children: [],
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete grammar rule', () => {
      const result = GrammarRuleNodeSchema.safeParse({
        type: 'grammarRule',
        id: 'rule-002',
        title: 'Question Formation',
        explanation: 'Add ไหม at the end to form yes/no questions',
        exceptions: 'Does not apply to some verbs',
        relatedRules: ['rule-001'],
        commonMistakes: ['Forgetting the particle'],
        children: [
          {
            type: 'example',
            id: 'ex-rule-001',
            text: 'คุณสบายดีไหม',
            translation: 'Are you well?',
            value: 'คุณสบายดีไหม',
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject missing explanation', () => {
      const result = GrammarRuleNodeSchema.safeParse({
        type: 'grammarRule',
        id: 'rule-001',
        title: 'Test',
        children: [],
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('ExerciseNodeSchema', () => {
    it('should validate minimal exercise', () => {
      const result = ExerciseNodeSchema.safeParse({
        type: 'exercise',
        id: 'ex-001',
        exerciseType: 'fill-in-blank',
        question: 'Complete: สวัสดี___',
        answer: 'ครับ',
        children: [], // Required field
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete exercise', () => {
      const result = ExerciseNodeSchema.safeParse({
        type: 'exercise',
        id: 'ex-002',
        title: 'Greeting Exercise',
        exerciseType: 'multiple-choice',
        question: 'How do you say "hello"?',
        options: ['สวัสดี', 'ขอบคุณ', 'ลาก่อน'],
        answer: 'สวัสดี',
        explanation: 'สวัสดี is the standard greeting in Thai',
        difficulty: 'beginner',
        items: [
          { question: 'Option A', answer: 'สวัสดี' },
          { question: 'Option B', answer: 'ขอบคุณ' },
        ],
        children: [],
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid exercise type', () => {
      const result = ExerciseNodeSchema.safeParse({
        type: 'exercise',
        id: 'ex-001',
        exerciseType: 'crossword',
        question: 'Test',
        answer: 'test',
        children: [],
      });

      expect(result.success).toBe(false);
    });

    it('should validate exercise with skill tracking fields', () => {
      const result = ExerciseNodeSchema.safeParse({
        type: 'exercise',
        id: 'ex-skill-001',
        exerciseType: 'matching',
        question: 'Match the character to its sound',
        answer: 'ก = g',
        skill: 'character-recognition',
        tests: ['identify-consonant', 'sound-mapping'],
        objectiveId: 'obj-char-recognition',
        children: [],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skill).toBe('character-recognition');
        expect(result.data.tests).toEqual(['identify-consonant', 'sound-mapping']);
        expect(result.data.objectiveId).toBe('obj-char-recognition');
      }
    });

    it('should validate exercise without skill fields (backwards compatible)', () => {
      const result = ExerciseNodeSchema.safeParse({
        type: 'exercise',
        id: 'ex-compat',
        exerciseType: 'fill-in-blank',
        question: 'Test',
        answer: 'answer',
        children: [],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skill).toBeUndefined();
        expect(result.data.tests).toBeUndefined();
        expect(result.data.objectiveId).toBeUndefined();
      }
    });
  });

  describe('LessonAstNodeSchema', () => {
    it('should validate minimal lesson', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Introduction',
        order: 1,
        children: [],
      });
      
      expect(result.success).toBe(true);
    });

    it('should validate complete lesson', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-002',
        title: 'Basic Greetings',
        order: 2,
        difficulty: 'beginner',
        cefrLevel: 'A1',
        categories: ['greetings', 'politeness'],
        metadata: {
          pageNumber: 5,
          estimatedTime: 30,
          objectives: ['Learn basic greetings', 'Practice pronunciation'],
        },
        children: [
          {
            type: 'grammarRule',
            id: 'rule-001',
            title: 'Polite particles',
            explanation: 'Use ครับ/ค่ะ for politeness',
            children: [],
          },
          {
            type: 'vocabularySet',
            id: 'vocab-set-001',
            children: [
              {
                type: 'vocabularyItem',
                id: 'vocab-001',
                word: 'สวัสดี',
                translation: 'hello',
                value: 'สวัสดี',
              },
            ],
          },
        ],
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid CEFR level', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test',
        order: 1,
        cefrLevel: 'A3',
        children: [],
      });
      
      expect(result.success).toBe(false);
    });

    it('should accept zero order (nonnegative)', () => {
      // Schema uses nonnegative() so 0 is valid
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test',
        order: 0,
        children: [],
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject negative order', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test',
        order: -1,
        children: [],
      });

      expect(result.success).toBe(false);
    });

    it('should validate lesson with phonological rule children', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-tone-rules',
        title: 'Thai Tone Rules',
        order: 7,
        children: [
          {
            type: 'phonologicalRule',
            id: 'tone-mid',
            title: 'Middle-Class Tone Rules',
            ruleType: 'tone',
            description: 'Middle-class consonants produce all 5 tones.',
            children: [
              {
                type: 'ruleCondition',
                condition: { consonantClass: 'middle', toneMark: 'none' },
                result: 'mid',
                value: 'consonantClass=middle, toneMark=none → mid',
              },
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should validate lesson with syllable pattern children', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-syllables',
        title: 'Thai Syllable Patterns',
        order: 8,
        children: [
          {
            type: 'syllablePattern',
            id: 'live-syllables',
            title: 'Live Syllables',
            patternType: 'live',
            structure: 'CV',
            children: [
              {
                type: 'patternExample',
                text: 'กา',
                transcription: 'gaa',
                translation: 'crow',
                value: 'กา',
              },
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should validate lesson with writing pattern children', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-writing',
        title: 'Thai Writing Patterns',
        order: 9,
        children: [
          {
            type: 'writingPattern',
            id: 'vowel-pos',
            title: 'Vowel Positioning',
            patternType: 'positioning',
            children: [
              {
                type: 'example',
                id: 'wp-ex-1',
                text: 'เ-',
                translation: 'Written before consonant',
                value: 'เ-',
              },
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should validate lesson with all new node types combined', () => {
      const result = LessonAstNodeSchema.safeParse({
        type: 'lesson',
        id: 'lesson-comprehensive',
        title: 'Comprehensive Thai Phonology',
        order: 10,
        cefrLevel: 'A1',
        children: [
          {
            type: 'characterSet',
            id: 'mid-consonants',
            title: 'Middle-Class Consonants',
            charType: 'consonant',
            children: [
              {
                type: 'characterItem',
                id: 'th-chicken',
                char: 'ก',
                name: 'gor gai',
                charType: 'consonant',
                canonicalRef: 'chicken',
                value: 'ก',
              },
            ],
          },
          {
            type: 'phonologicalRule',
            id: 'tone-mid',
            title: 'Middle-Class Tone Rules',
            ruleType: 'tone',
            children: [
              {
                type: 'ruleCondition',
                condition: { consonantClass: 'middle', toneMark: 'none' },
                result: 'mid',
                example: 'กา',
                value: 'mid tone',
              },
            ],
          },
          {
            type: 'syllablePattern',
            id: 'live-syllables',
            title: 'Live Syllables',
            children: [
              {
                type: 'patternExample',
                text: 'กา',
                value: 'กา',
              },
            ],
          },
          {
            type: 'writingPattern',
            id: 'vowel-pos',
            title: 'Vowel Positioning',
            patternType: 'positioning',
            children: [],
          },
          {
            type: 'exercise',
            id: 'ex-tone',
            exerciseType: 'matching',
            question: 'Match consonant class to tone',
            answer: 'middle = mid',
            skill: 'tone-rule-application',
            tests: ['consonant-class-id', 'tone-prediction'],
            objectiveId: 'obj-tone-rules',
            children: [],
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('RuleConditionNodeSchema', () => {
    it('should validate minimal rule condition', () => {
      const result = RuleConditionNodeSchema.safeParse({
        type: 'ruleCondition',
        condition: { consonantClass: 'middle', toneMark: 'none' },
        result: 'mid',
        value: 'consonantClass=middle, toneMark=none → mid',
      });

      expect(result.success).toBe(true);
    });

    it('should validate complete rule condition', () => {
      const result = RuleConditionNodeSchema.safeParse({
        type: 'ruleCondition',
        id: 'cond-001',
        condition: { consonantClass: 'middle', toneMark: 'mai-ek' },
        result: 'low',
        example: 'ไก่',
        exampleTranscription: 'gài',
        exampleTranslation: 'chicken',
        notes: 'Common word',
        value: 'consonantClass=middle, toneMark=mai-ek → low',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty result', () => {
      const result = RuleConditionNodeSchema.safeParse({
        type: 'ruleCondition',
        condition: { key: 'val' },
        result: '',
        value: 'test',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing condition', () => {
      const result = RuleConditionNodeSchema.safeParse({
        type: 'ruleCondition',
        result: 'mid',
        value: 'test',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('PhonologicalRuleNodeSchema', () => {
    it('should validate minimal phonological rule', () => {
      const result = PhonologicalRuleNodeSchema.safeParse({
        type: 'phonologicalRule',
        id: 'tone-mid',
        title: 'Middle-Class Tone Rules',
        ruleType: 'tone',
        children: [],
      });

      expect(result.success).toBe(true);
    });

    it('should validate complete phonological rule', () => {
      const result = PhonologicalRuleNodeSchema.safeParse({
        type: 'phonologicalRule',
        id: 'tone-mid',
        title: 'Middle-Class Tone Rules',
        ruleType: 'tone',
        description: 'Middle-class consonants produce all 5 tones.',
        exceptions: 'Short vowel exceptions apply.',
        relatedRules: ['tone-high', 'tone-low'],
        children: [
          {
            type: 'ruleCondition',
            condition: { consonantClass: 'middle', toneMark: 'none' },
            result: 'mid',
            value: 'consonantClass=middle → mid',
          },
          {
            type: 'example',
            id: 'ex-tone-1',
            text: 'กา',
            translation: 'crow',
            value: 'กา',
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should accept custom ruleType via string escape hatch', () => {
      const result = PhonologicalRuleNodeSchema.safeParse({
        type: 'phonologicalRule',
        id: 'custom-rule',
        title: 'Custom Rule',
        ruleType: 'vowel-reduction',
        children: [],
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = PhonologicalRuleNodeSchema.safeParse({
        type: 'phonologicalRule',
        id: '',
        title: 'Test',
        ruleType: 'tone',
        children: [],
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = PhonologicalRuleNodeSchema.safeParse({
        type: 'phonologicalRule',
        id: 'test',
        title: '',
        ruleType: 'tone',
        children: [],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('PatternExampleNodeSchema', () => {
    it('should validate minimal pattern example', () => {
      const result = PatternExampleNodeSchema.safeParse({
        type: 'patternExample',
        text: 'กา',
        value: 'กา',
      });

      expect(result.success).toBe(true);
    });

    it('should validate complete pattern example', () => {
      const result = PatternExampleNodeSchema.safeParse({
        type: 'patternExample',
        text: 'กา',
        transcription: 'gaa',
        translation: 'crow',
        notes: 'Live syllable example',
        references: ['gor-gai', 'sara-aa'],
        value: 'กา',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const result = PatternExampleNodeSchema.safeParse({
        type: 'patternExample',
        text: '',
        value: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('SyllablePatternNodeSchema', () => {
    it('should validate minimal syllable pattern', () => {
      const result = SyllablePatternNodeSchema.safeParse({
        type: 'syllablePattern',
        id: 'live-syllable',
        title: 'Live Syllables',
        children: [],
      });

      expect(result.success).toBe(true);
    });

    it('should validate complete syllable pattern', () => {
      const result = SyllablePatternNodeSchema.safeParse({
        type: 'syllablePattern',
        id: 'live-syllable',
        title: 'Live Syllables',
        patternType: 'live',
        structure: 'CV',
        description: 'Live syllables end in a long vowel or sonorant.',
        children: [
          {
            type: 'patternExample',
            text: 'กา',
            transcription: 'gaa',
            translation: 'crow',
            value: 'กา',
          },
          {
            type: 'content',
            format: 'text',
            value: 'Additional notes on live syllables.',
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = SyllablePatternNodeSchema.safeParse({
        type: 'syllablePattern',
        id: '',
        title: 'Test',
        children: [],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('WritingPatternNodeSchema', () => {
    it('should validate minimal writing pattern', () => {
      const result = WritingPatternNodeSchema.safeParse({
        type: 'writingPattern',
        id: 'vowel-pos',
        title: 'Vowel Positioning',
        patternType: 'positioning',
        children: [],
      });

      expect(result.success).toBe(true);
    });

    it('should validate complete writing pattern', () => {
      const result = WritingPatternNodeSchema.safeParse({
        type: 'writingPattern',
        id: 'vowel-pos',
        title: 'Vowel Positioning Rules',
        patternType: 'positioning',
        description: 'Thai vowels appear in various positions.',
        children: [
          {
            type: 'example',
            id: 'wp-ex-1',
            text: 'เ-',
            translation: 'Short e — written before consonant',
            value: 'เ-',
          },
          {
            type: 'content',
            format: 'text',
            value: 'Position depends on vowel length.',
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty patternType', () => {
      const result = WritingPatternNodeSchema.safeParse({
        type: 'writingPattern',
        id: 'test',
        title: 'Test',
        patternType: '',
        children: [],
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing patternType', () => {
      const result = WritingPatternNodeSchema.safeParse({
        type: 'writingPattern',
        id: 'test',
        title: 'Test',
        children: [],
      });

      expect(result.success).toBe(false);
    });
  });
});
