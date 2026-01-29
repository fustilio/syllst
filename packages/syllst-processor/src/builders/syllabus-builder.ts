/**
 * Syllabus Builder
 *
 * Complete pipeline: MDX → MDAST → Syllabus Unist Tree → Structured Data
 */

import { transformMDASTToSyllabusUnist } from './unist-transformer';
import { createMDXParser } from './mdx-parser';
import { remarkSyllabusDirectives } from '../plugins/remark-syllabus-directives';
import type { LessonAstNode } from '@syllst/core/types';
import { validateLesson as validateLessonWithZod } from '../validators/zod-validator';

/**
 * Build options
 */
export interface SyllabusBuildOptions {
  /** Path to the lesson file (for error reporting) */
  path?: string;
  /** Whether this is a meta file */
  isMeta?: boolean;
  /** Enable Zod schema validation */
  validate?: boolean;
  /** Throw on validation errors (requires validate: true) */
  strictValidation?: boolean;
}

/**
 * Build a LessonAstNode from MDX content
 *
 * Complete pipeline: MDX → MDAST → Syllabus Unist Tree
 */
export async function buildLessonFromMDX(
  content: string,
  options: SyllabusBuildOptions = {}
): Promise<LessonAstNode> {
  // Step 1: Parse MDX with custom plugins
  const parser = createMDXParser().use(remarkSyllabusDirectives);

  // Parse and transform the tree
  const parsedTree = parser.parse({
    value: content,
    path: options.path,
  });

  const tree = await parser.run(parsedTree);

  // Step 2: Extract frontmatter
  const { parseMDX: parse } = await import('./mdx-parser');
  const { frontmatter } = await parse(content, {
    path: options.path,
    extractFrontmatter: true,
  });

  // Step 3: Transform to Syllabus Unist
  const lesson = transformMDASTToSyllabusUnist(tree, frontmatter, options);

  if (lesson.type !== 'lesson') {
    throw new Error('Expected lesson node, got: ' + lesson.type);
  }

  // Step 4: Optional Zod validation
  if (options.validate) {
    const validation = validateLessonWithZod(lesson, {
      strict: options.strictValidation,
    });

    if (!validation.valid && options.strictValidation) {
      const errorMessages = validation.errors
        ? validation.errors.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
        : validation.warnings.join(', ');
      throw new Error(`Lesson validation failed: ${errorMessages}`);
    }

    // Log warnings if not strict
    if (!validation.valid && !options.strictValidation) {
      console.warn(`Validation warnings for ${options.path || 'lesson'}:`);
      if (validation.errors) {
        validation.errors.issues.forEach((issue) => {
          console.warn(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
      }
      validation.warnings.forEach((warning) => {
        console.warn(`  - ${warning}`);
      });
    }
  }

  return lesson as LessonAstNode;
}

/**
 * Build a LessonAstNode from MDX file
 */
export async function buildLessonFromMDXFile(
  filePath: string,
  options: Omit<SyllabusBuildOptions, 'path'> = {}
): Promise<LessonAstNode> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');

  return buildLessonFromMDX(content, { ...options, path: filePath });
}

/**
 * Build multiple lessons from a directory
 */
export async function buildLessonsFromDirectory(
  directoryPath: string,
  options: Omit<SyllabusBuildOptions, 'path'> = {}
): Promise<LessonAstNode[]> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const files = await fs.readdir(directoryPath);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));

  const lessons: LessonAstNode[] = [];

  for (const file of mdxFiles) {
    const filePath = path.join(directoryPath, file);
    try {
      const lesson = await buildLessonFromMDXFile(filePath, options);
      lessons.push(lesson);
    } catch (error) {
      console.error(`Error building lesson from ${file}:`, error);
    }
  }

  // Sort by order
  lessons.sort((a, b) => a.order - b.order);

  return lessons;
}

/**
 * Validate lesson structure (basic structural validation)
 *
 * @deprecated Use validateLesson from '@syllst/core-processor/validators' for Zod-based validation
 */
export function validateLessonStructure(lesson: LessonAstNode): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!lesson.id) {
    errors.push('Lesson must have an id');
  }

  if (!lesson.title) {
    errors.push('Lesson must have a title');
  }

  if (typeof lesson.order !== 'number') {
    errors.push('Lesson must have an order');
  }

  if (!lesson.children || lesson.children.length === 0) {
    errors.push('Lesson must have children (grammar rules, vocabulary, etc.)');
  }

  // Validate child nodes
  if (lesson.children) {
    lesson.children.forEach((child, index) => {
      if (!child.type) {
        errors.push(`Child node at index ${index} must have a type`);
      }

      // Validate specific node types
      if (child.type === 'grammarRule') {
        const grammarRule = child as any;
        if (!grammarRule.id) {
          errors.push(`Grammar rule at index ${index} must have an id`);
        }
        if (!grammarRule.title) {
          errors.push(`Grammar rule at index ${index} must have a title`);
        }
      }

      if (child.type === 'vocabularySet') {
        const vocabSet = child as any;
        if (!vocabSet.id) {
          errors.push(`Vocabulary set at index ${index} must have an id`);
        }
      }

      if (child.type === 'exercise') {
        const exercise = child as any;
        if (!exercise.id) {
          errors.push(`Exercise at index ${index} must have an id`);
        }
        if (!exercise.question) {
          errors.push(`Exercise at index ${index} must have a question`);
        }
        // Some exercise types (dialogue, open-ended) may not require answers
        const requiresAnswer = !['dialogue', 'open-ended', 'discussion'].includes(exercise.exerciseType);
        if (requiresAnswer && !exercise.answer) {
          errors.push(`Exercise at index ${index} must have an answer`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
