/**
 * MDX Parser
 *
 * Parses MDX files into MDAST (Markdown Abstract Syntax Tree) with frontmatter extraction.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root as MdastRoot } from 'mdast';
import type { VFile } from 'vfile';
import { parse as parseYaml } from 'yaml';

/**
 * Frontmatter data from MDX file
 */
export interface MDXFrontmatter {
  type?: string;
  id?: string;
  title?: string;
  description?: string;
  order?: number;
  parentId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  cefrLevel?: string | string[];
  categories?: string[];
  metadata?: Record<string, unknown>;
  /** Language code (for syllabus root) */
  language?: string;
  /** Version string (for syllabus root) */
  version?: string;
  /** ISO timestamp when syllabus was extracted */
  extractedAt?: string;
  /** Source information (for syllabus root) */
  source?: {
    title: string;
    url?: string;
    pdfUrl?: string;
    authors?: string[];
    year?: number;
    publisher?: string;
  };
  [key: string]: unknown;
}

/**
 * Parsed MDX file result
 */
export interface ParsedMDX {
  /** MDAST tree */
  tree: MdastRoot;
  /** Extracted frontmatter */
  frontmatter: MDXFrontmatter;
  /** Original VFile */
  file: VFile;
}

/**
 * Parser options
 */
export interface MDXParserOptions {
  /** File path (for error reporting) */
  path?: string;
  /** Whether to extract frontmatter */
  extractFrontmatter?: boolean;
}

/**
 * Create MDX parser with custom plugins
 */
export function createMDXParser() {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkDirective)
    .use(remarkGfm);
}

/**
 * Extract frontmatter from MDAST tree
 */
export function extractFrontmatter(tree: MdastRoot): MDXFrontmatter {
  let frontmatter: MDXFrontmatter = {};

  visit(tree, 'yaml', (node: any) => {
    try {
      const parsed = parseYaml(node.value);
      if (parsed && typeof parsed === 'object') {
        frontmatter = parsed as MDXFrontmatter;
      }
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
    }
  });

  return frontmatter;
}

/**
 * Parse MDX content string
 */
export async function parseMDX(
  content: string,
  options: MDXParserOptions = {}
): Promise<ParsedMDX> {
  const parser = createMDXParser();

  // Parse the content into a tree
  const tree = parser.parse({
    value: content,
    path: options.path,
  }) as MdastRoot;

  // Run transforms on the tree
  const transformedTree = (await parser.run(tree)) as MdastRoot;

  const frontmatter = options.extractFrontmatter !== false
    ? extractFrontmatter(transformedTree)
    : {};

  return {
    tree: transformedTree,
    frontmatter,
    file: {
      value: content,
      path: options.path,
    } as VFile,
  };
}

/**
 * Parse MDX file from file system
 */
export async function parseMDXFile(
  filePath: string,
  options: Omit<MDXParserOptions, 'path'> = {}
): Promise<ParsedMDX> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');

  return parseMDX(content, { ...options, path: filePath });
}
