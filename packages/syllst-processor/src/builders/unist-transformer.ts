/**
 * Unist Transformer
 *
 * Transforms MDAST (with transformed directives) into Syllabus Unist Tree
 */

import { visit, SKIP } from 'unist-util-visit';
import type { Root as MdastRoot } from 'mdast';
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
  ]);

  // Types that contain nested content we should skip
  const containerTypes = new Set([
    'grammarRule', 'vocabularySet', 'characterSet',
    'exampleSet', 'exercise', 'dialogue',
    'phonologicalRule', 'syllablePattern', 'writingPattern',
    'list', 'listItem',
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

      children.push({
        type: 'content',
        format: 'markdown',
        value: extractMarkdown(node),
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
 * Extract markdown text from a node
 */
function extractMarkdown(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.type === 'heading') {
    const level = '#'.repeat(node.depth);
    const text = node.children?.map(extractMarkdown).join('') || '';
    return `${level} ${text}\n\n`;
  }

  if (node.type === 'paragraph') {
    const text = node.children?.map(extractMarkdown).join('') || '';
    return `${text}\n\n`;
  }

  if (node.type === 'strong') {
    const text = node.children?.map(extractMarkdown).join('') || '';
    return `**${text}**`;
  }

  if (node.type === 'emphasis') {
    const text = node.children?.map(extractMarkdown).join('') || '';
    return `*${text}*`;
  }

  if (node.type === 'inlineCode') {
    return `\`${node.value}\``;
  }

  if (node.type === 'code') {
    return `\`\`\`${node.lang || ''}\n${node.value}\n\`\`\`\n\n`;
  }

  if (node.type === 'list') {
    const items = node.children?.map((item: any, index: number) => {
      const content = extractMarkdown(item);
      // Ordered list uses numbers, unordered uses dashes
      const prefix = node.ordered ? `${index + 1}. ` : '- ';
      return prefix + content.trim();
    }).join('\n') || '';
    return items + '\n\n';
  }

  if (node.type === 'listItem') {
    // Extract content from list item children
    return node.children?.map(extractMarkdown).join('').trim() || '';
  }

  if (node.type === 'table') {
    // Extract table as markdown
    const rows = node.children || [];
    const result: string[] = [];

    rows.forEach((row: any, rowIndex: number) => {
      if (row.type === 'tableRow') {
        const cells = row.children?.map((cell: any) => {
          const content = cell.children?.map(extractMarkdown).join('').trim() || '';
          return content;
        }) || [];
        result.push('| ' + cells.join(' | ') + ' |');

        // Add header separator after first row
        if (rowIndex === 0) {
          result.push('|' + cells.map(() => '---').join('|') + '|');
        }
      }
    });

    return result.join('\n') + '\n\n';
  }

  if (node.type === 'tableRow' || node.type === 'tableCell') {
    // Handled by table extraction above
    return '';
  }

  if (node.children) {
    return node.children.map(extractMarkdown).join('');
  }

  return '';
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
export function extractDirectiveNodes(tree: MdastRoot): any[] {
  const directives: any[] = [];

  visit(tree, (node: any) => {
    if (
      node.type === 'grammarRule' ||
      node.type === 'vocabularySet' ||
      node.type === 'exampleSet' ||
      node.type === 'exercise' ||
      node.type === 'vocabularyItem' ||
      node.type === 'example' ||
      node.type === 'dialogue' ||
      node.type === 'dialogueTurn' ||
      node.type === 'phonologicalRule' ||
      node.type === 'ruleCondition' ||
      node.type === 'syllablePattern' ||
      node.type === 'patternExample' ||
      node.type === 'writingPattern'
    ) {
      directives.push(node);
    }
  });

  return directives;
}
