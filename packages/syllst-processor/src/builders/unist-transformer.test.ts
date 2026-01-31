import { describe, it, expect } from 'vitest';
import {
  transformToLessonAstNode,
  transformToSyllabusRoot,
  transformMDASTToSyllabusUnist,
  extractDirectiveNodes,
} from './unist-transformer';
import type { Root as MdastRoot } from 'mdast';
import type { MDXFrontmatter } from './mdx-parser';

// ============================================================================
// MDAST fixture helpers
// ============================================================================

/** Create an empty MDAST root */
function mdastRoot(...children: any[]): MdastRoot {
  return { type: 'root', children };
}

function mdastParagraph(text: string) {
  return { type: 'paragraph', children: [{ type: 'text', value: text }] };
}

function mdastHeading(depth: number, text: string) {
  return { type: 'heading', depth, children: [{ type: 'text', value: text }] };
}

function mdastStrong(text: string) {
  return { type: 'strong', children: [{ type: 'text', value: text }] };
}

function mdastEmphasis(text: string) {
  return { type: 'emphasis', children: [{ type: 'text', value: text }] };
}

function mdastInlineCode(value: string) {
  return { type: 'inlineCode', value };
}

function mdastCode(value: string, lang?: string) {
  return { type: 'code', value, lang };
}

function mdastList(ordered: boolean, items: string[]) {
  return {
    type: 'list',
    ordered,
    children: items.map((text) => ({
      type: 'listItem',
      children: [mdastParagraph(text)],
    })),
  };
}

function mdastTable(headers: string[], rows: string[][]) {
  return {
    type: 'table',
    children: [
      {
        type: 'tableRow',
        children: headers.map((h) => ({
          type: 'tableCell',
          children: [{ type: 'text', value: h }],
        })),
      },
      ...rows.map((row) => ({
        type: 'tableRow',
        children: row.map((cell) => ({
          type: 'tableCell',
          children: [{ type: 'text', value: cell }],
        })),
      })),
    ],
  };
}

/** Simulates a directive node already transformed by remark-syllabus-directives */
function directiveNode(type: string, props: Record<string, any> = {}) {
  return { type, ...props };
}

const baseFrontmatter: MDXFrontmatter = {
  type: 'lesson',
  id: 'test-lesson',
  title: 'Test Lesson',
  order: 1,
};

// ============================================================================
// transformToLessonAstNode
// ============================================================================

describe('transformToLessonAstNode', () => {
  describe('basic structure', () => {
    it('should create a lesson from empty tree with frontmatter', () => {
      const tree = mdastRoot();
      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('test-lesson');
      expect(lesson.title).toBe('Test Lesson');
      expect(lesson.order).toBe(1);
      expect(lesson.children).toEqual([]);
    });

    it('should apply all frontmatter fields', () => {
      const tree = mdastRoot();
      const fm: MDXFrontmatter = {
        id: 'fm-lesson',
        title: 'Full Frontmatter',
        description: 'A detailed lesson',
        order: 5,
        parentId: 'ch-01',
        difficulty: 'intermediate',
        cefrLevel: 'B1',
        categories: ['grammar', 'speaking'],
        metadata: { estimatedTime: 30, notes: 'test' },
      };

      const lesson = transformToLessonAstNode(tree, fm);

      expect(lesson.description).toBe('A detailed lesson');
      expect(lesson.order).toBe(5);
      expect(lesson.parentId).toBe('ch-01');
      expect(lesson.difficulty).toBe('intermediate');
      expect(lesson.cefrLevel).toBe('B1');
      expect(lesson.categories).toEqual(['grammar', 'speaking']);
      expect(lesson.metadata).toEqual({ estimatedTime: 30, notes: 'test' });
    });

    it('should use defaults for missing frontmatter fields', () => {
      const tree = mdastRoot();
      const lesson = transformToLessonAstNode(tree, {});

      expect(lesson.id).toBe('untitled-lesson');
      expect(lesson.title).toBe('Untitled Lesson');
      expect(lesson.order).toBe(0);
      expect(lesson.categories).toEqual([]);
    });
  });

  describe('content extraction', () => {
    it('should extract paragraph content', () => {
      const tree = mdastRoot(
        mdastParagraph('Hello world')
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      expect(lesson.children[0].type).toBe('content');
      const content = lesson.children[0] as any;
      expect(content.format).toBe('markdown');
      expect(content.value).toContain('Hello world');
    });

    it('should extract headings as content', () => {
      const tree = mdastRoot(
        mdastHeading(2, 'Section Title')
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      const content = lesson.children[0] as any;
      expect(content.value).toContain('## Section Title');
    });

    it('should extract lists as content', () => {
      const tree = mdastRoot(
        mdastList(false, ['item 1', 'item 2'])
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      const content = lesson.children[0] as any;
      expect(content.value).toContain('- item 1');
      expect(content.value).toContain('- item 2');
    });

    it('should extract tables as content', () => {
      const tree = mdastRoot(
        mdastTable(['Col A', 'Col B'], [['r1a', 'r1b']])
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      const content = lesson.children[0] as any;
      expect(content.value).toContain('| Col A | Col B |');
      expect(content.value).toContain('| r1a | r1b |');
    });

    it('should handle multiple content nodes', () => {
      const tree = mdastRoot(
        mdastHeading(2, 'Title'),
        mdastParagraph('Paragraph 1'),
        mdastParagraph('Paragraph 2')
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(3);
      expect(lesson.children.every((c) => c.type === 'content')).toBe(true);
    });
  });

  describe('directive node collection', () => {
    it('should collect grammarRule directives', () => {
      const tree = mdastRoot(
        directiveNode('grammarRule', {
          id: 'g1',
          title: 'SVO Pattern',
          explanation: 'Subject Verb Object',
          children: [],
        })
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      expect(lesson.children[0].type).toBe('grammarRule');
    });

    it('should collect vocabularySet directives', () => {
      const tree = mdastRoot(
        directiveNode('vocabularySet', {
          id: 'vs1',
          title: 'Greetings',
          children: [
            { type: 'vocabularyItem', id: 'v1', word: 'สวัสดี', translation: 'hello', value: 'สวัสดี' },
          ],
        })
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      expect(lesson.children[0].type).toBe('vocabularySet');
    });

    it('should collect exercise directives', () => {
      const tree = mdastRoot(
        directiveNode('exercise', {
          id: 'ex1',
          exerciseType: 'multiple-choice',
          question: 'What does สวัสดี mean?',
          options: ['hello', 'goodbye'],
          answer: 'hello',
          children: [],
        })
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(1);
      expect(lesson.children[0].type).toBe('exercise');
    });

    it('should collect all directive types', () => {
      const directiveTypes = [
        'grammarRule', 'vocabularySet', 'characterSet',
        'exampleSet', 'exercise', 'dialogue',
        'phonologicalRule', 'syllablePattern', 'writingPattern',
      ];

      const tree = mdastRoot(
        ...directiveTypes.map((t) => directiveNode(t, { id: t, children: [] }))
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(directiveTypes.length);
      for (let i = 0; i < directiveTypes.length; i++) {
        expect(lesson.children[i].type).toBe(directiveTypes[i]);
      }
    });

    it('should not descend into directive children', () => {
      const tree = mdastRoot(
        directiveNode('vocabularySet', {
          id: 'vs1',
          children: [
            { type: 'vocabularyItem', id: 'v1', word: 'a', translation: 'a', value: 'a' },
            { type: 'vocabularyItem', id: 'v2', word: 'b', translation: 'b', value: 'b' },
          ],
        })
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      // Should have one vocabularySet, not separate vocabularyItems
      expect(lesson.children).toHaveLength(1);
      expect(lesson.children[0].type).toBe('vocabularySet');
    });
  });

  describe('mixed content and directives', () => {
    it('should interleave content and directives in document order', () => {
      const tree = mdastRoot(
        mdastHeading(2, 'Intro'),
        mdastParagraph('Some text'),
        directiveNode('grammarRule', { id: 'g1', title: 'Rule', explanation: 'Exp', children: [] }),
        mdastParagraph('More text'),
        directiveNode('vocabularySet', { id: 'vs1', children: [] }),
      );

      const lesson = transformToLessonAstNode(tree, baseFrontmatter);

      expect(lesson.children).toHaveLength(5);
      expect(lesson.children[0].type).toBe('content');
      expect(lesson.children[1].type).toBe('content');
      expect(lesson.children[2].type).toBe('grammarRule');
      expect(lesson.children[3].type).toBe('content');
      expect(lesson.children[4].type).toBe('vocabularySet');
    });
  });
});

// ============================================================================
// transformToSyllabusRoot
// ============================================================================

describe('transformToSyllabusRoot', () => {
  it('should create syllabus root from frontmatter', () => {
    const tree = mdastRoot();
    const fm: MDXFrontmatter = {
      id: 'syllabus-001',
      title: 'Thai for Beginners',
      language: 'th',
      version: '2.0.0',
      extractedAt: '2025-06-01T00:00:00Z',
      source: {
        title: 'Thai Textbook',
        authors: ['Author A'],
        year: 2024,
      },
    };

    const result = transformToSyllabusRoot(tree, fm);

    expect(result.type).toBe('syllabusRoot');
    expect(result.meta?.id).toBe('syllabus-001');
    expect(result.meta?.title).toBe('Thai for Beginners');
    expect(result.meta?.language).toBe('th');
    expect(result.meta?.version).toBe('2.0.0');
    expect(result.meta?.extractedAt).toBe('2025-06-01T00:00:00Z');
    expect(result.meta?.source).toEqual({
      title: 'Thai Textbook',
      authors: ['Author A'],
      year: 2024,
    });
    expect(result.children).toEqual([]);
  });

  it('should use defaults for missing frontmatter fields', () => {
    const tree = mdastRoot();
    const result = transformToSyllabusRoot(tree, {});

    expect(result.meta?.id).toBe('untitled-syllabus');
    expect(result.meta?.title).toBe('Untitled Syllabus');
    expect(result.meta?.language).toBe('unknown');
    expect(result.meta?.version).toBe('1.0.0');
    expect(result.meta?.extractedAt).toBeDefined();
    // Source defaults to { title: <title> }
    expect(result.meta?.source).toEqual({ title: 'Untitled Syllabus' });
  });
});

// ============================================================================
// transformMDASTToSyllabusUnist (main dispatcher)
// ============================================================================

describe('transformMDASTToSyllabusUnist', () => {
  it('should create a lesson when type is "lesson"', () => {
    const tree = mdastRoot();
    const fm: MDXFrontmatter = { type: 'lesson', id: 'L1', title: 'Lesson 1' };

    const result = transformMDASTToSyllabusUnist(tree, fm);

    expect(result.type).toBe('lesson');
  });

  it('should create a lesson by default (no type field)', () => {
    const tree = mdastRoot();
    const fm: MDXFrontmatter = { id: 'L1', title: 'Lesson 1' };

    const result = transformMDASTToSyllabusUnist(tree, fm);

    expect(result.type).toBe('lesson');
  });

  it('should create syllabusRoot when type is "syllabusRoot"', () => {
    const tree = mdastRoot();
    const fm: MDXFrontmatter = { type: 'syllabusRoot', id: 'S1', title: 'Syllabus' };

    const result = transformMDASTToSyllabusUnist(tree, fm);

    expect(result.type).toBe('syllabusRoot');
  });

  it('should create syllabusRoot when isMeta option is true', () => {
    const tree = mdastRoot();
    const fm: MDXFrontmatter = { id: 'S1', title: 'Syllabus' };

    const result = transformMDASTToSyllabusUnist(tree, fm, { isMeta: true });

    expect(result.type).toBe('syllabusRoot');
  });
});

// ============================================================================
// extractDirectiveNodes
// ============================================================================

describe('extractDirectiveNodes', () => {
  it('should find all directive node types', () => {
    const tree = mdastRoot(
      directiveNode('grammarRule', { id: 'g1', children: [] }),
      directiveNode('vocabularySet', {
        id: 'vs1',
        children: [
          directiveNode('vocabularyItem', { id: 'v1', word: 'a', value: 'a' }),
        ],
      }),
      directiveNode('exampleSet', {
        id: 'es1',
        children: [
          directiveNode('example', { id: 'e1', text: 'ex', value: 'ex' }),
        ],
      }),
      directiveNode('exercise', { id: 'ex1', children: [] }),
      directiveNode('dialogue', {
        id: 'd1',
        children: [
          directiveNode('dialogueTurn', { speakerId: 's1', text: 'hi', value: 'hi' }),
        ],
      }),
      directiveNode('phonologicalRule', {
        id: 'pr1',
        children: [
          directiveNode('ruleCondition', { condition: {}, result: 'mid', value: '' }),
        ],
      }),
      directiveNode('syllablePattern', {
        id: 'sp1',
        children: [
          directiveNode('patternExample', { text: 'กา', value: 'กา' }),
        ],
      }),
      directiveNode('writingPattern', { id: 'wp1', children: [] }),
    );

    const directives = extractDirectiveNodes(tree as any);

    // Should find all parent + child directive nodes
    const types = directives.map((d: any) => d.type);
    expect(types).toContain('grammarRule');
    expect(types).toContain('vocabularySet');
    expect(types).toContain('vocabularyItem');
    expect(types).toContain('exampleSet');
    expect(types).toContain('example');
    expect(types).toContain('exercise');
    expect(types).toContain('dialogue');
    expect(types).toContain('dialogueTurn');
    expect(types).toContain('phonologicalRule');
    expect(types).toContain('ruleCondition');
    expect(types).toContain('syllablePattern');
    expect(types).toContain('patternExample');
    expect(types).toContain('writingPattern');
  });

  it('should return empty array for tree with no directives', () => {
    const tree = mdastRoot(
      mdastParagraph('plain text'),
      mdastHeading(1, 'title')
    );

    const directives = extractDirectiveNodes(tree as any);
    expect(directives).toEqual([]);
  });

  it('should find nested directives', () => {
    const tree = mdastRoot(
      directiveNode('vocabularySet', {
        id: 'vs1',
        children: [
          directiveNode('vocabularyItem', { id: 'v1', word: 'hello', value: 'hello' }),
          directiveNode('vocabularyItem', { id: 'v2', word: 'bye', value: 'bye' }),
        ],
      })
    );

    const directives = extractDirectiveNodes(tree as any);

    expect(directives).toHaveLength(3); // 1 vocabularySet + 2 vocabularyItems
  });
});
