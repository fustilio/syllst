import { describe, it, expect } from 'vitest';
import {
  zodErrorsToIssues,
  validateNodeWithCodes,
  validateLessonWithCodes,
  validateDialogueWithCodes,
} from './zod-validator';
import { SYLLST_ERROR_CODES } from './error-codes';
import { z } from 'zod';

// ============================================================================
// zodErrorsToIssues
// ============================================================================

describe('zodErrorsToIssues', () => {
  it('should convert Zod errors to ValidationIssues', () => {
    const schema = z.object({
      type: z.string(),
      id: z.string(),
    });

    const result = schema.safeParse({ type: 'lesson' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBeDefined();
      expect(issues[0].message).toBeDefined();
      expect(issues[0].severity).toBe('error');
    }
  });

  it('should set INVALID_FIELD_TYPE for invalid_type errors', () => {
    const schema = z.object({
      count: z.number(),
    });

    const result = schema.safeParse({ count: 'not-a-number' });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      expect(issues[0].code).toBe(SYLLST_ERROR_CODES.INVALID_FIELD_TYPE);
      expect(issues[0].path).toEqual(['count']);
    }
  });

  it('should set appropriate code for invalid email format', () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const result = schema.safeParse({ email: 'not-an-email' });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      // Email validation failures are mapped to SCHEMA_VALIDATION_FAILED
      expect(issues[0].code).toBe(SYLLST_ERROR_CODES.SCHEMA_VALIDATION_FAILED);
    }
  });

  it('should set appropriate code for invalid enum values', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive']),
    });

    const result = schema.safeParse({ status: 'unknown' });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      // Enum validation failures are mapped to SCHEMA_VALIDATION_FAILED
      expect(issues[0].code).toBe(SYLLST_ERROR_CODES.SCHEMA_VALIDATION_FAILED);
    }
  });

  it('should include path information', () => {
    const schema = z.object({
      nested: z.object({
        field: z.string(),
      }),
    });

    const result = schema.safeParse({ nested: { field: 123 } });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      expect(issues[0].path).toEqual(['nested', 'field']);
    }
  });

  it('should include context with Zod error details', () => {
    const schema = z.object({
      value: z.number(),
    });

    const result = schema.safeParse({ value: 'text' });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      expect(issues[0].context).toBeDefined();
      expect(issues[0].context?.zodCode).toBe('invalid_type');
    }
  });

  it('should handle multiple errors', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
    });

    const result = schema.safeParse({
      age: 'not-a-number',
      email: 'not-an-email',
    });

    if (!result.success) {
      const issues = zodErrorsToIssues(result.error);

      expect(issues.length).toBeGreaterThan(1);
      expect(issues.every((i) => i.code)).toBe(true);
      expect(issues.every((i) => i.message)).toBe(true);
    }
  });
});

// ============================================================================
// validateNodeWithCodes
// ============================================================================

describe('validateNodeWithCodes', () => {
  it('should return structured issues for invalid nodes', () => {
    const invalidNode = {
      // Missing 'type' field
      id: 'test',
    };

    const result = validateNodeWithCodes(invalidNode);

    expect(result.valid).toBe(false);
    expect(result.issues).toBeDefined();
    expect(result.issues!.length).toBeGreaterThan(0);
    expect(result.issues![0].code).toBeDefined();
  });

  it('should return empty issues for valid nodes', () => {
    const validNode = {
      type: 'content',
      format: 'markdown',
      value: 'Hello world',
    };

    const result = validateNodeWithCodes(validNode);

    if (result.valid) {
      expect(result.issues).toEqual([]);
    }
  });

  it('should maintain backwards compatibility with errors field', () => {
    const invalidNode = {
      id: 'test',
    };

    const result = validateNodeWithCodes(invalidNode);

    expect(result.errors).toBeDefined();
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// validateLessonWithCodes
// ============================================================================

describe('validateLessonWithCodes', () => {
  it('should return structured issues for invalid lessons', () => {
    const invalidLesson = {
      type: 'lesson',
      // Missing required fields
    };

    const result = validateLessonWithCodes(invalidLesson);

    expect(result.valid).toBe(false);
    expect(result.issues).toBeDefined();
    expect(result.issues!.length).toBeGreaterThan(0);
  });

  it('should return empty issues for valid lessons', () => {
    const validLesson = {
      type: 'lesson',
      id: 'lesson-1',
      title: 'Test Lesson',
      order: 1,
      children: [],
    };

    const result = validateLessonWithCodes(validLesson);

    if (result.valid) {
      expect(result.issues).toEqual([]);
    }
  });

  it('should include error codes in issues', () => {
    const invalidLesson = {
      type: 'lesson',
      id: 'test',
      order: 'not-a-number', // should be number
    };

    const result = validateLessonWithCodes(invalidLesson);

    expect(result.issues).toBeDefined();
    const typeIssue = result.issues?.find((i) =>
      i.path?.includes('order')
    );
    expect(typeIssue?.code).toBe(SYLLST_ERROR_CODES.INVALID_FIELD_TYPE);
  });
});

// ============================================================================
// validateDialogueWithCodes
// ============================================================================

describe('validateDialogueWithCodes', () => {
  it('should return structured issues for invalid dialogues', () => {
    const invalidDialogue = {
      type: 'dialogue',
      // Missing required fields
    };

    const result = validateDialogueWithCodes(invalidDialogue);

    expect(result.valid).toBe(false);
    expect(result.issues).toBeDefined();
    expect(result.issues!.length).toBeGreaterThan(0);
  });

  it('should return empty issues for valid dialogues', () => {
    const validDialogue = {
      type: 'dialogue',
      id: 'dialogue-1',
      children: [],
    };

    const result = validateDialogueWithCodes(validDialogue);

    if (result.valid) {
      expect(result.issues).toEqual([]);
    }
  });
});

// ============================================================================
// Error Code Constants
// ============================================================================

describe('Error Code Constants', () => {
  it('should export SYLLST_ERROR_CODES', () => {
    expect(SYLLST_ERROR_CODES).toBeDefined();
    expect(SYLLST_ERROR_CODES.SCHEMA_VALIDATION_FAILED).toBeDefined();
    expect(SYLLST_ERROR_CODES.UNRESOLVED_GLOST_REFERENCE).toBeDefined();
  });

  it('should have unique error codes', () => {
    const codes = Object.values(SYLLST_ERROR_CODES);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  it('should follow naming convention', () => {
    const codes = Object.values(SYLLST_ERROR_CODES);
    codes.forEach((code) => {
      expect(code).toMatch(/^SYLLST_ERR_[A-Z_]+$/);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Integration - Error Codes in Validation Pipeline', () => {
  it('should provide both legacy and structured error information', () => {
    const invalidNode = {
      type: 'lesson',
      // Missing required fields
    };

    const result = validateLessonWithCodes(invalidNode);

    // Legacy support
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.warnings).toBeDefined();

    // New structured support
    expect(result.issues).toBeDefined();
    expect(result.issues!.length).toBeGreaterThan(0);
    expect(result.issues![0].code).toBeDefined();
    expect(result.issues![0].message).toBeDefined();
  });

  it('should allow consumers to filter by error code', () => {
    const invalidNode = {
      type: 'lesson',
      id: 123, // should be string
      order: 'not-a-number', // should be number
    };

    const result = validateLessonWithCodes(invalidNode);

    const typeErrors = result.issues?.filter(
      (i) => i.code === SYLLST_ERROR_CODES.INVALID_FIELD_TYPE
    );

    expect(typeErrors).toBeDefined();
    expect(typeErrors!.length).toBeGreaterThan(0);
  });

  it('should provide context for debugging', () => {
    const invalidNode = {
      type: 'lesson',
      id: 'test',
      order: 'invalid',
    };

    const result = validateLessonWithCodes(invalidNode);

    const issue = result.issues?.find((i) => i.path?.includes('order'));

    expect(issue?.context).toBeDefined();
    expect(issue?.context?.zodCode).toBeDefined();
  });
});
