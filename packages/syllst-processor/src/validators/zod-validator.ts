/**
 * Zod Validation Pipeline
 *
 * Provides validation utilities for syllst nodes using Zod schemas.
 * Can be used in the build pipeline to validate parsed content.
 */

import {
  validateNode as validateNodeSchema,
  validateLesson as validateLessonSchema,
  validateDialogue as validateDialogueSchema,
  formatValidationErrors as formatValidationErrorsSchema,
  type ValidationResult,
  type ValidateOptions,
} from '@syllst/core/schemas';
import type { LessonAstNode, DialogueNode, SyllabusRoot } from '@syllst/core/types';
import {
  validateReferences,
  type ReferenceValidationResult,
  type ReferenceValidationOptions,
} from './reference-validator';

// Re-export types
export type { ValidationResult, ValidateOptions };
export type { ReferenceValidationResult, ReferenceValidationOptions };

/**
 * Validate any syllst node
 */
export function validateNode<T = unknown>(
  node: unknown,
  options?: ValidateOptions
): ValidationResult<T> {
  return validateNodeSchema(node, options);
}

/**
 * Validate a lesson node
 */
export function validateLesson(
  lesson: unknown,
  options?: ValidateOptions
): ValidationResult<LessonAstNode> {
  // Type assertion needed because Zod schema output type has some optional fields
  // that differ from the TypeScript interface
  return validateLessonSchema(lesson, options) as ValidationResult<LessonAstNode>;
}

/**
 * Validate a dialogue node
 */
export function validateDialogue(
  dialogue: unknown,
  options?: ValidateOptions
): ValidationResult<DialogueNode> {
  // Type assertion needed because Zod schema output type has some optional fields
  // that differ from the TypeScript interface
  return validateDialogueSchema(dialogue, options) as ValidationResult<DialogueNode>;
}

/**
 * Validate for ContentLayer generation
 *
 * Returns a simpler result format suitable for build scripts.
 * Logs warnings but doesn't throw errors by default.
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
    errors.push(...formatValidationErrorsSchema(result.errors));
  }
  errors.push(...result.warnings);

  return { valid: false, errors };
}

/**
 * Validate multiple lessons in batch
 *
 * @returns Summary of validation results
 */
export function validateLessonBatch(
  lessons: unknown[]
): {
  valid: number;
  invalid: number;
  results: Array<{ index: number; result: ValidationResult<LessonAstNode> }>;
} {
  const results: Array<{ index: number; result: ValidationResult<LessonAstNode> }> = [];
  let valid = 0;
  let invalid = 0;

  for (let i = 0; i < lessons.length; i++) {
    const result = validateLesson(lessons[i], { strict: false });
    results.push({ index: i, result });
    if (result.valid) {
      valid++;
    } else {
      invalid++;
    }
  }

  return { valid, invalid, results };
}


export {
  formatValidationErrorsSchema as formatValidationErrors
};

/**
 * Multi-stage validation result
 */
export interface MultiStageValidationResult {
  /** Syntax validation result */
  syntax: ValidationResult;
  /** Structure validation result */
  structure: ValidationResult;
  /** Reference validation result */
  references: ReferenceValidationResult;
  /** GLOST validation result */
  glost: ReferenceValidationResult;
  /** External format validation result */
  externalFormats: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  /** Overall validity */
  valid: boolean;
  /** All errors combined */
  allErrors: string[];
  /** All warnings combined */
  allWarnings: string[];
}

/**
 * Options for multi-stage validation
 */
export interface MultiStageValidationOptions extends ValidateOptions {
  /** Reference validation options */
  referenceOptions?: ReferenceValidationOptions;
  /** Whether to validate external formats */
  validateExternalFormats?: boolean;
}

/**
 * Multi-stage validation pipeline
 *
 * Performs validation in stages:
 * 1. Syntax validation (Zod schema)
 * 2. Structure validation (node relationships)
 * 3. Reference validation (GLOST refs)
 * 4. GLOST validation (GLOST document references)
 * 5. External format validation (extensions)
 */
export function validateMultiStage(
  syllabus: SyllabusRoot | LessonAstNode[],
  options: MultiStageValidationOptions = {}
): MultiStageValidationResult {
  const {
    referenceOptions = {},
    validateExternalFormats = false,
  } = options;

  // Stage 1: Syntax validation
  const syntax = Array.isArray(syllabus)
    ? validateLesson(syllabus[0] || {}, options)
    : validateNode(syllabus, options);

  // Stage 2: Structure validation (same as syntax for now, can be enhanced)
  const structure = syntax;

  // Stage 3: Reference validation
  const references = validateReferences(syllabus, referenceOptions);

  // Stage 4: GLOST validation (extracted from reference validation)
  const glost = validateReferences(syllabus, {
    glostDocumentIds: referenceOptions.glostDocumentIds,
    warnOnly: true,
  });

  // Stage 5: External format validation
  const externalFormats = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  if (validateExternalFormats) {
    // Basic validation of extensions structure
    const nodes = Array.isArray(syllabus) ? syllabus : [syllabus];
    for (const _node of nodes) {
      // Visit all nodes and check extensions
      // This is a placeholder - actual validation would check extension schemas
    }
  }

  // Combine results
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!syntax.valid && syntax.errors) {
    allErrors.push(...formatValidationErrorsSchema(syntax.errors));
  }
  if (!references.valid) {
    if (references.unresolvedGlostRefs.length > 0) {
      allErrors.push(
        ...references.unresolvedGlostRefs.map(
          (r) => `Unresolved GLOST reference: ${r.ref} in ${r.nodeType}`
        )
      );
    }
  }
  allWarnings.push(...syntax.warnings);
  allWarnings.push(...references.warnings);
  allWarnings.push(...glost.warnings);
  allWarnings.push(...externalFormats.warnings);

  const valid =
    syntax.valid &&
    structure.valid &&
    references.valid &&
    glost.valid &&
    externalFormats.valid;

  return {
    syntax,
    structure,
    references,
    glost,
    externalFormats,
    valid,
    allErrors,
    allWarnings,
  };
}