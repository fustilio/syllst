/**
 * Syllst Zod Schemas
 *
 * Runtime validation schemas for all syllst node types.
 * Use these for validating parsed content before processing.
 */

import { z } from 'zod';
import {
  SyllabusRootSchema,
  LessonAstNodeSchema,
  SyllabusNodeSchema,
  ChapterNodeSchema,
  SectionNodeSchema,
  GrammarRuleNodeSchema,
  VocabularySetNodeSchema,
  VocabularyItemNodeSchema,
  CharacterSetNodeSchema,
  CharacterItemNodeSchema,
  ExampleSetNodeSchema,
  ExampleNodeSchema,
  ExerciseNodeSchema,
  ContentNodeSchema,
  MetadataNodeSchema,
  DialogueNodeSchema,
  DialogueTurnNodeSchema,
} from './nodes';

// ============================================================================
// Re-exports
// ============================================================================

// Base schemas
export * from './base';

// Node schemas
export * from './nodes';

// Extension schemas
export * from './extensions';

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validation result type
 */
export interface ValidationResult<T = unknown> {
  /** Whether validation succeeded */
  valid: boolean;
  /** Validated data (if successful) */
  data?: T;
  /** Zod errors (if failed) */
  errors: z.ZodError | null;
  /** Warning messages */
  warnings: string[];
}

/**
 * Validation options
 */
export interface ValidateOptions {
  /** Throw on validation failure instead of returning result */
  strict?: boolean;
}

/**
 * Get the appropriate schema for a node based on its type
 */
export function getSchemaForNodeType(
  type: string
): z.ZodTypeAny | undefined {
  const schemaMap: Record<string, z.ZodTypeAny> = {
    syllabusRoot: SyllabusRootSchema,
    chapter: ChapterNodeSchema,
    section: SectionNodeSchema,
    lesson: LessonAstNodeSchema,
    grammarRule: GrammarRuleNodeSchema,
    vocabularySet: VocabularySetNodeSchema,
    vocabularyItem: VocabularyItemNodeSchema,
    characterSet: CharacterSetNodeSchema,
    characterItem: CharacterItemNodeSchema,
    exampleSet: ExampleSetNodeSchema,
    example: ExampleNodeSchema,
    exercise: ExerciseNodeSchema,
    content: ContentNodeSchema,
    metadata: MetadataNodeSchema,
    dialogue: DialogueNodeSchema,
    dialogueTurn: DialogueTurnNodeSchema,
  };

  return schemaMap[type];
}

/**
 * Validate any syllst node using the appropriate schema
 */
export function validateNode<T = unknown>(
  node: unknown,
  options: ValidateOptions = {}
): ValidationResult<T> {
  const { strict = false } = options;

  // First check if node has a type
  if (!node || typeof node !== 'object' || !('type' in node)) {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['type'],
        message: 'Node must have a type property',
      },
    ]);
    if (strict) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    return {
      valid: false,
      errors: error,
      warnings: [],
    };
  }

  const nodeType = (node as { type: string }).type;
  const schema = getSchemaForNodeType(nodeType);

  if (!schema) {
    const warning = `Unknown node type: ${nodeType}`;
    if (strict) {
      throw new Error(`Validation failed: ${warning}`);
    }
    return {
      valid: false,
      errors: null,
      warnings: [warning],
    };
  }

  const result = schema.safeParse(node);

  if (!result.success) {
    if (strict) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return {
      valid: false,
      errors: result.error,
      warnings: [],
    };
  }

  return {
    valid: true,
    data: result.data as T,
    errors: null,
    warnings: [],
  };
}

/**
 * Validate a lesson node
 */
export function validateLesson(
  lesson: unknown,
  options: ValidateOptions = {}
): ValidationResult<z.infer<typeof LessonAstNodeSchema>> {
  const { strict = false } = options;

  const result = LessonAstNodeSchema.safeParse(lesson);

  if (!result.success) {
    if (strict) {
      throw new Error(`Lesson validation failed: ${result.error.message}`);
    }
    return {
      valid: false,
      errors: result.error,
      warnings: [],
    };
  }

  return {
    valid: true,
    data: result.data,
    errors: null,
    warnings: [],
  };
}

/**
 * Validate a syllabus root node
 */
export function validateSyllabus(
  syllabus: unknown,
  options: ValidateOptions = {}
): ValidationResult<z.infer<typeof SyllabusRootSchema>> {
  const { strict = false } = options;

  const result = SyllabusRootSchema.safeParse(syllabus);

  if (!result.success) {
    if (strict) {
      throw new Error(`Syllabus validation failed: ${result.error.message}`);
    }
    return {
      valid: false,
      errors: result.error,
      warnings: [],
    };
  }

  return {
    valid: true,
    data: result.data,
    errors: null,
    warnings: [],
  };
}

/**
 * Validate a dialogue node
 */
export function validateDialogue(
  dialogue: unknown,
  options: ValidateOptions = {}
): ValidationResult<z.infer<typeof DialogueNodeSchema>> {
  const { strict = false } = options;

  const result = DialogueNodeSchema.safeParse(dialogue);

  if (!result.success) {
    if (strict) {
      throw new Error(`Dialogue validation failed: ${result.error.message}`);
    }
    return {
      valid: false,
      errors: result.error,
      warnings: [],
    };
  }

  return {
    valid: true,
    data: result.data,
    errors: null,
    warnings: [],
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
}

/**
 * Validate for ContentLayer generation
 * Returns a simpler result format suitable for build scripts
 */
export function validateBeforeContentLayer(
  lesson: unknown
): { valid: boolean; errors: string[] } {
  const result = validateLesson(lesson, { strict: false });

  if (result.valid) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];
  if (result.errors) {
    errors.push(...formatValidationErrors(result.errors));
  }
  errors.push(...result.warnings);

  return { valid: false, errors };
}
