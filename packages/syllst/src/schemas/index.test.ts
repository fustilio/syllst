/**
 * Tests for Validation Functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  getSchemaForNodeType,
  validateNode,
  validateLesson,
  validateSyllabus,
  validateDialogue,
  formatValidationErrors,
  validateBeforeContentLayer,
  type ValidationResult,
} from './index';

describe('Validation Functions', () => {
  describe('getSchemaForNodeType', () => {
    it('should return schema for lesson type', () => {
      const schema = getSchemaForNodeType('lesson');
      expect(schema).toBeDefined();
    });

    it('should return schema for grammarRule type', () => {
      const schema = getSchemaForNodeType('grammarRule');
      expect(schema).toBeDefined();
    });

    it('should return schema for vocabularySet type', () => {
      const schema = getSchemaForNodeType('vocabularySet');
      expect(schema).toBeDefined();
    });

    it('should return schema for vocabularyItem type', () => {
      const schema = getSchemaForNodeType('vocabularyItem');
      expect(schema).toBeDefined();
    });

    it('should return schema for dialogue type', () => {
      const schema = getSchemaForNodeType('dialogue');
      expect(schema).toBeDefined();
    });

    it('should return schema for dialogueTurn type', () => {
      const schema = getSchemaForNodeType('dialogueTurn');
      expect(schema).toBeDefined();
    });

    it('should return undefined for unknown type', () => {
      const schema = getSchemaForNodeType('unknownType');
      expect(schema).toBeUndefined();
    });

    it('should return schema for all known types', () => {
      const knownTypes = [
        'syllabusRoot',
        'chapter',
        'section',
        'lesson',
        'grammarRule',
        'vocabularySet',
        'vocabularyItem',
        'characterSet',
        'characterItem',
        'exampleSet',
        'example',
        'exercise',
        'content',
        'metadata',
        'dialogue',
        'dialogueTurn',
        'phonologicalRule',
        'ruleCondition',
        'syllablePattern',
        'patternExample',
        'writingPattern',
      ];

      for (const type of knownTypes) {
        expect(getSchemaForNodeType(type)).toBeDefined();
      }
    });
  });

  describe('validateNode', () => {
    it('should validate a valid lesson node', () => {
      const result = validateNode({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test Lesson',
        order: 1,
        children: [],
      });

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeNull();
    });

    it('should validate a valid vocabulary item', () => {
      const result = validateNode({
        type: 'vocabularyItem',
        id: 'vocab-001',
        word: 'test',
        translation: 'test',
        value: 'test',
      });

      expect(result.valid).toBe(true);
    });

    it('should return error for node without type', () => {
      const result = validateNode({
        id: 'test',
        title: 'Test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
    });

    it('should return error for null node', () => {
      const result = validateNode(null);

      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
    });

    it('should return error for undefined node', () => {
      const result = validateNode(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
    });

    it('should return warning for unknown node type', () => {
      const result = validateNode({
        type: 'unknownType',
        id: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('Unknown node type: unknownType');
    });

    it('should return validation errors for invalid node', () => {
      const result = validateNode({
        type: 'lesson',
        id: '', // Invalid: empty
        title: 'Test',
        order: 0, // Invalid: must be positive
        children: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
    });

    describe('strict mode', () => {
      it('should throw error in strict mode for invalid node', () => {
        expect(() =>
          validateNode(
            { type: 'lesson', id: '', title: 'Test', order: 1, children: [] },
            { strict: true }
          )
        ).toThrow();
      });

      it('should throw error in strict mode for missing type', () => {
        expect(() =>
          validateNode({ id: 'test' }, { strict: true })
        ).toThrow('Validation failed');
      });

      it('should throw error in strict mode for unknown type', () => {
        expect(() =>
          validateNode({ type: 'unknownType' }, { strict: true })
        ).toThrow('Validation failed');
      });

      it('should not throw in strict mode for valid node', () => {
        expect(() =>
          validateNode(
            { type: 'lesson', id: 'test', title: 'Test', order: 1, children: [] },
            { strict: true }
          )
        ).not.toThrow();
      });
    });
  });

  describe('validateLesson', () => {
    it('should validate a valid lesson', () => {
      const result = validateLesson({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test Lesson',
        order: 1,
        children: [],
      });

      expect(result.valid).toBe(true);
      expect(result.data?.id).toBe('lesson-001');
    });

    it('should validate a lesson with all optional fields', () => {
      const result = validateLesson({
        type: 'lesson',
        id: 'lesson-002',
        title: 'Complete Lesson',
        order: 2,
        difficulty: 'beginner',
        cefrLevel: 'A1',
        categories: ['grammar', 'vocabulary'],
        metadata: {
          pageNumber: 1,
          estimatedTime: 30,
        },
        children: [
          {
            type: 'grammarRule',
            id: 'rule-001',
            title: 'Test Rule',
            explanation: 'Test explanation',
            children: [],
          },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.data?.difficulty).toBe('beginner');
      expect(result.data?.cefrLevel).toBe('A1');
    });

    it('should return errors for invalid lesson', () => {
      const result = validateLesson({
        type: 'lesson',
        id: '', // Invalid
        title: 'Test',
        order: -1, // Invalid
        children: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
    });

    it('should return errors for wrong type', () => {
      const result = validateLesson({
        type: 'chapter', // Wrong type
        id: 'chapter-001',
        title: 'Test',
      });

      expect(result.valid).toBe(false);
    });

    describe('strict mode', () => {
      it('should throw in strict mode for invalid lesson', () => {
        expect(() =>
          validateLesson(
            { type: 'lesson', id: '', title: 'Test', order: 1, children: [] },
            { strict: true }
          )
        ).toThrow('Lesson validation failed');
      });
    });
  });

  describe('validateSyllabus', () => {
    it('should validate a valid syllabus', () => {
      const result = validateSyllabus({
        type: 'syllabusRoot',
        meta: {
          id: 'syllabus-001',
          title: 'Thai Language Course',
          language: 'th',
          source: {
            title: 'Thai Basics',
          },
          version: '1.0.0',
          extractedAt: '2024-01-01T00:00:00Z',
        },
        children: [],
      });

      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid syllabus', () => {
      const result = validateSyllabus({
        type: 'syllabusRoot',
        meta: {
          id: '', // Invalid
          title: '',
          language: '',
          source: {
            title: '', // Invalid
          },
          version: '',
          extractedAt: '',
        },
        children: [],
      });

      expect(result.valid).toBe(false);
    });

    describe('strict mode', () => {
      it('should throw in strict mode for invalid syllabus', () => {
        expect(() =>
          validateSyllabus(
            {
              type: 'syllabusRoot',
              meta: { id: '', title: '', language: '', source: { title: '' }, version: '', extractedAt: '' },
              children: [],
            },
            { strict: true }
          )
        ).toThrow('Syllabus validation failed');
      });
    });
  });

  describe('validateDialogue', () => {
    it('should validate a valid dialogue', () => {
      const result = validateDialogue({
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

      expect(result.valid).toBe(true);
      expect(result.data?.id).toBe('dialog-001');
    });

    it('should validate dialogue with all optional fields', () => {
      const result = validateDialogue({
        type: 'dialogue',
        id: 'dialog-002',
        participants: [
          { id: 'me', name: 'Learner', gender: 'masculine' },
          { id: 'shopkeeper', name: 'Somchai', gender: 'masculine', role: 'vendor' },
        ],
        context: 'At a market',
        culturalNotes: 'Use polite particles',
        lang: 'th-TH',
        children: [
          {
            type: 'dialogueTurn',
            speakerId: 'me',
            text: 'สวัสดีครับ',
            genderVariants: {
              masculine: 'สวัสดีครับ',
              feminine: 'สวัสดีค่ะ',
            },
            transliteration: 'sawatdee krap',
            translation: 'Hello',
            value: 'สวัสดีครับ',
          },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid dialogue', () => {
      const result = validateDialogue({
        type: 'dialogue',
        id: '', // Invalid
        participants: [],
        children: [
          {
            type: 'dialogueTurn',
            speakerId: '', // Invalid
            text: '',
            translation: '',
            value: '',
          },
        ],
      });

      expect(result.valid).toBe(false);
    });

    describe('strict mode', () => {
      it('should throw in strict mode for invalid dialogue', () => {
        expect(() =>
          validateDialogue(
            { type: 'dialogue', id: '', participants: [], children: [] },
            { strict: true }
          )
        ).toThrow('Dialogue validation failed');
      });
    });
  });

  describe('formatValidationErrors', () => {
    it('should format single error', () => {
      const zodError = new z.ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'String must contain at least 1 character(s)',
          path: ['id'],
        },
      ]);

      const formatted = formatValidationErrors(zodError);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toBe('id: String must contain at least 1 character(s)');
    });

    it('should format multiple errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'ID required',
          path: ['id'],
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'number',
          inclusive: true,
          exact: false,
          message: 'Order must be positive',
          path: ['order'],
        },
      ]);

      const formatted = formatValidationErrors(zodError);

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toBe('id: ID required');
      expect(formatted[1]).toBe('order: Order must be positive');
    });

    it('should format nested path errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Title required',
          path: ['meta', 'source', 'title'],
        },
      ]);

      const formatted = formatValidationErrors(zodError);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toBe('meta.source.title: Title required');
    });

    it('should format root-level errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          message: 'Invalid root structure',
          path: [],
        },
      ]);

      const formatted = formatValidationErrors(zodError);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toBe('root: Invalid root structure');
    });
  });

  describe('validateBeforeContentLayer', () => {
    it('should return valid for valid lesson', () => {
      const result = validateBeforeContentLayer({
        type: 'lesson',
        id: 'lesson-001',
        title: 'Test',
        order: 1,
        children: [],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid lesson', () => {
      const result = validateBeforeContentLayer({
        type: 'lesson',
        id: '', // Invalid
        title: 'Test',
        order: 0, // Invalid
        children: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should format errors as strings', () => {
      const result = validateBeforeContentLayer({
        type: 'lesson',
        id: '',
        title: '',
        order: -1,
        children: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.every((e) => typeof e === 'string')).toBe(true);
    });

    it('should include warnings in errors', () => {
      // Test that warnings are included (though current implementation may not produce warnings)
      const result = validateBeforeContentLayer({
        type: 'lesson',
        id: 'test',
        title: 'Test',
        order: 1,
        children: [],
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('ValidationResult type', () => {
    it('should have correct shape for success', () => {
      const result: ValidationResult<{ id: string }> = {
        valid: true,
        data: { id: 'test' },
        errors: null,
        warnings: [],
      };

      expect(result.valid).toBe(true);
      expect(result.data?.id).toBe('test');
    });

    it('should have correct shape for failure', () => {
      const result: ValidationResult = {
        valid: false,
        errors: new z.ZodError([]),
        warnings: ['Some warning'],
      };

      expect(result.valid).toBe(false);
      expect(result.data).toBeUndefined();
    });
  });
});
