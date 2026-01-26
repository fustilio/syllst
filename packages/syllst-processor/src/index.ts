/**
 * @syllst/processor
 *
 * Syllabus Syntax Tree Processor - MDX transformation pipeline and utilities
 * for processing @syllst/core trees.
 *
 * This package provides:
 * - MDX parsing and transformation to syllst AST
 * - Remark plugins for custom syllabus directives
 * - Validation utilities
 *
 * @example
 * ```typescript
 * import { buildLessonFromMDX } from '@syllst/processor';
 * import type { LessonAstNode } from '@syllst/core/types';
 *
 * const mdxContent = `
 * ---
 * type: lesson
 * id: lesson-01
 * title: "Basic Greetings"
 * ---
 *
 * :::vocabulary-set{id="greetings"}
 * ::vocab{word="Hello" translation="Hello"}
 * ::
 * :::
 * `;
 *
 * const lesson: LessonAstNode = await buildLessonFromMDX(mdxContent);
 * ```
 */

// Re-export types from @syllst/core for convenience
export type * from '@syllst/core/types';

// Export processor-specific types (Chishiki integration)
export * from './types';

// Export builders
export * from './builders';

// Export plugins
export * from './plugins';

// Export validators
export * from './validators';

// Export utilities
export * from './utils';

// Export configuration
export * from './config';
