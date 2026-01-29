/**
 * Reference Validator
 *
 * Validates references in syllst AST:
 * - GLOST document references
 * - External format references
 */

import { visit } from 'unist-util-visit';
import type { SyllabusRoot, LessonAstNode, ContentNode } from '@syllst/core';

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
  /** Warnings */
  warnings: string[];
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
            unresolvedGlostRefs.push({
              ref: contentNode.ref,
              nodeType: 'content',
              location: contentNode.position
                ? `line ${contentNode.position?.start?.line || 'unknown'}`
                : undefined,
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
  }

  return {
    valid,
    unresolvedGlostRefs,
    warnings,
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
