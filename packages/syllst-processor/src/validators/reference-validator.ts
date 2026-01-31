/**
 * Reference Validator
 *
 * Validates references in syllst AST:
 * - GLOST document references
 * - External format references
 */

import { visit } from 'unist-util-visit';
import type { SyllabusRoot, LessonAstNode, ContentNode } from '@syllst/core';
import {
  SYLLST_ERROR_CODES,
  type SyllstErrorCode,
} from './error-codes.js';

/**
 * Structured validation issue with error code
 */
export interface ValidationIssue {
  /** Error code for programmatic consumption */
  code: SyllstErrorCode;
  /** Human-readable error message */
  message: string;
  /** Path to the error location in the node tree */
  path?: string[];
  /** Severity of the issue */
  severity: 'error' | 'warning';
  /** Additional context about the error */
  context?: Record<string, unknown>;
}

/**
 * Validation result for references
 */
export interface ReferenceValidationResult {
  /** Whether all references are valid */
  valid: boolean;
  /** Unresolved GLOST references */
  unresolvedGlostRefs: Array<{
    nodeId?: string;
    ref: string;
    nodeType: string;
    location?: string;
  }>;
  /** Warnings (deprecated: use 'issues' instead) */
  warnings: string[];
  /** Structured validation issues with error codes */
  issues?: ValidationIssue[];
}

/**
 * Options for reference validation
 */
export interface ReferenceValidationOptions {
  /** Known GLOST document IDs */
  glostDocumentIds?: string[];
  /** Whether to warn on unresolved references (vs error) */
  warnOnly?: boolean;
}

/**
 * Validate all references in a syllabus or lesson
 */
export function validateReferences(
  syllabus: SyllabusRoot | LessonAstNode[],
  options: ReferenceValidationOptions = {}
): ReferenceValidationResult {
  const unresolvedGlostRefs: ReferenceValidationResult['unresolvedGlostRefs'] = [];
  const warnings: string[] = [];
  const issues: ValidationIssue[] = [];

  // Build lookup maps
  const glostIds = new Set(options.glostDocumentIds || []);

  const nodes = Array.isArray(syllabus) ? syllabus : [syllabus];

  for (const node of nodes) {
    visit(node, (visitedNode: any, _index: number | undefined, _parent: any) => {
      // Validate GLOST references in content nodes
      if (visitedNode.type === 'content') {
        const contentNode = visitedNode as ContentNode;
        if (
          (contentNode.format === 'glost' || contentNode.format === 'glost-dialogue') &&
          contentNode.ref
        ) {
          if (!glostIds.has(contentNode.ref)) {
            const location = contentNode.position
              ? `line ${contentNode.position?.start?.line || 'unknown'}`
              : undefined;

            unresolvedGlostRefs.push({
              ref: contentNode.ref,
              nodeType: 'content',
              location,
            });

            // Add structured issue
            issues.push({
              code: SYLLST_ERROR_CODES.UNRESOLVED_GLOST_REFERENCE,
              message: `Unresolved GLOST reference: ${contentNode.ref}`,
              severity: options.warnOnly ? 'warning' : 'error',
              context: {
                ref: contentNode.ref,
                nodeType: 'content',
                location,
                format: contentNode.format,
              },
            });
          }
        }
      }
    });
  }

  const valid = unresolvedGlostRefs.length === 0;

  if (!valid && !options.warnOnly) {
    warnings.push(
      `Found ${unresolvedGlostRefs.length} unresolved GLOST references`
    );

    // Add summary issue for multiple unresolved references
    if (unresolvedGlostRefs.length > 1) {
      issues.push({
        code: SYLLST_ERROR_CODES.MULTIPLE_UNRESOLVED_GLOST_REFS,
        message: `Found ${unresolvedGlostRefs.length} unresolved GLOST references`,
        severity: 'error',
        context: {
          count: unresolvedGlostRefs.length,
        },
      });
    }
  }

  return {
    valid,
    unresolvedGlostRefs,
    warnings,
    issues,
  };
}

/**
 * Validate GLOST references only
 */
export function validateGlostReferences(
  syllabus: SyllabusRoot | LessonAstNode[],
  glostDocumentIds: string[]
): ReferenceValidationResult {
  return validateReferences(syllabus, {
    glostDocumentIds,
  });
}
