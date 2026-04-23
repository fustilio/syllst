/**
 * Unist Transformer
 *
 * Transforms MDAST (with transformed directives) into Syllabus Unist Tree
 */

import { visit, SKIP } from 'unist-util-visit';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import type { Root as MdastRoot } from 'mdast';

/**
 * Remove inline textDirective nodes from a tree before serializing to markdown.
 * These are unsupported by mdast-util-to-markdown and would otherwise throw.
 */
function stripTextDirectives(tree: MdastRoot): void {
  visit(tree, 'textDirective', (node: any, index, parent: any) => {
    if (parent && typeof index === 'number') {
      // Replace textDirective with its plain-text children
      const text = node.children?.map((c: any) => c.value || '').join('') || '';
      parent.children.splice(index, 1, { type: 'text', value: text });
      return index;
    }
  });
}

import type {
  SyllabusRoot,
  LessonAstNode,
  ContentNode,
} from '@syllst/core/types';
import type { MDXFrontmatter } from './mdx-parser.js';

/**
 * Options for transforming MDAST to Syllabus Unist
 */
export interface TransformOptions {
  /** Whether this is a meta file (syllabus root) */
  isMeta?: boolean;
  /** Default frontmatter values */
  defaultFrontmatter?: Partial<MDXFrontmatter>;
}

/**
 * Transform MDAST to LessonAstNode
 */
export function transformToLessonAstNode(
  tree: MdastRoot,
  frontmatter: MDXFrontmatter
): LessonAstNode {
  const {
    id = 'untitled-lesson',
    title = 'Untitled Lesson',
    description,
    order = 0,
    parentId,
    difficulty,
    cefrLevel,
    categories = [],
    metadata,
  } = frontmatter;

  const children: LessonAstNode['children'] = [];

  // Types that we want to capture as top-level content
  const directiveTypes = new Set([
    'grammarRule', 'vocabularySet', 'characterSet',
    'exampleSet', 'exercise', 'dialogue',
    'phonologicalRule', 'syllablePattern', 'writingPattern',
    'vocabularyItem', 'character',
  ]);

  // Types that contain nested content we should skip
  const containerTypes = new Set([
    'grammarRule', 'vocabularySet', 'characterSet',
    'exampleSet', 'exercise', 'dialogue',
    'phonologicalRule', 'syllablePattern', 'writingPattern',
    'list', 'listItem', 'vocabularyItem',
  ]);

  // Traverse tree and collect directive nodes
  // Use ancestors parameter to check if we're inside a container
  visit(tree, (node: any, _index, parent: any) => {
    // Skip the root node
    if (node.type === 'root') return;

    // Handle directive nodes - always capture them
    if (directiveTypes.has(node.type)) {
      children.push(node);
      return SKIP; // Don't visit children, they're part of the directive
    }

    // Handle content nodes (paragraph, heading, list, table)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'list' || node.type === 'table') {
      // Skip if parent is a container type (nested content)
      if (parent && containerTypes.has(parent.type)) {
        return; // Skip this node, it's nested inside a list/directive
      }

      const contentRoot = { type: 'root', children: [node] } as MdastRoot;
      stripTextDirectives(contentRoot);

      children.push({
        type: 'content',
        format: 'markdown',
        value: toMarkdown(contentRoot, { bullet: '-', extensions: [gfmToMarkdown()] }).trim(),
      } as ContentNode);

      // For lists and tables, skip visiting children since we've already extracted the markdown
      if (node.type === 'list' || node.type === 'table') {
        return SKIP;
      }
    }
  });

  return {
    type: 'lesson',
    id,
    title,
    description,
    order,
    parentId,
    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined,
    cefrLevel: cefrLevel as any,
    categories,
    metadata,
    children,
  };
}

/**
 * Transform MDAST to SyllabusRoot (for meta files)
 */
export function transformToSyllabusRoot(
  _tree: MdastRoot,
  frontmatter: MDXFrontmatter
): Partial<SyllabusRoot> {
  const {
    id = 'untitled-syllabus',
    title = 'Untitled Syllabus',
    language = 'unknown',
    version = '1.0.0',
    extractedAt = new Date().toISOString(),
    source,
  } = frontmatter;

  return {
    type: 'syllabusRoot',
    meta: {
      id,
      title,
      language,
      source: source || {
        title: title,
      },
      version,
      extractedAt,
    },
    children: [], // Will be populated with chapters when loading all lessons
  };
}

/**
 * Main transform function
 *
 * Decides whether to create a LessonAstNode or SyllabusRoot based on frontmatter type
 */
export function transformMDASTToSyllabusUnist(
  tree: MdastRoot,
  frontmatter: MDXFrontmatter,
  options: TransformOptions = {}
): LessonAstNode | Partial<SyllabusRoot> {
  const type = frontmatter.type || (options.isMeta ? 'syllabusRoot' : 'lesson');

  if (type === 'syllabusRoot' || options.isMeta) {
    return transformToSyllabusRoot(tree, frontmatter);
  }

  return transformToLessonAstNode(tree, frontmatter);
}

/**
 * Extract all directive nodes from tree
 *
 * Useful for debugging and testing
 */
const DIRECTIVE_TYPES = new Set([
  'grammarRule', 'vocabularySet', 'exampleSet', 'exercise',
  'vocabularyItem', 'example', 'dialogue', 'dialogueTurn',
  'phonologicalRule', 'ruleCondition', 'syllablePattern',
  'patternExample', 'writingPattern',
]);

export function extractDirectiveNodes(tree: MdastRoot): any[] {
  const directives: any[] = [];

  visit(tree, (node: any) => {
    if (DIRECTIVE_TYPES.has(node.type)) {
      directives.push(node);
    }
  });

  return directives;
}
