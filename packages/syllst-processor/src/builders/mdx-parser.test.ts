import { describe, it, expect } from 'vitest';
import { parseMDX, extractFrontmatter, createMDXParser } from './mdx-parser';
import type { Root as MdastRoot } from 'mdast';

describe('MDX Parser', () => {
  describe('parseMDX', () => {
    it('should parse basic MDX content', async () => {
      const content = `
# Hello World

This is a test.
`;

      const result = await parseMDX(content);

      expect(result.tree).toBeDefined();
      expect(result.tree.type).toBe('root');
      expect(result.tree.children).toHaveLength(2);
    });

    it('should extract frontmatter', async () => {
      const content = `---
type: lesson
id: test-lesson
title: "Test Lesson"
difficulty: beginner
cefrLevel: A1
categories:
  - grammar
  - vocabulary
---

# Test Lesson

Content here.
`;

      const result = await parseMDX(content);

      expect(result.frontmatter).toEqual({
        type: 'lesson',
        id: 'test-lesson',
        title: 'Test Lesson',
        difficulty: 'beginner',
        cefrLevel: 'A1',
        categories: ['grammar', 'vocabulary'],
      });
    });

    it('should handle directives', async () => {
      const content = `
:::grammar-rule{id="test-rule" title="Test Rule"}
This is a grammar rule.
:::
`;

      const result = await parseMDX(content);

      expect(result.tree).toBeDefined();
      // Check that directive was parsed
      const hasDirective = result.tree.children.some(
        (node: any) => node.type === 'containerDirective'
      );
      expect(hasDirective).toBe(true);
    });

    it('should parse leaf directives', async () => {
      const content = `
::vocab{word="hello" translation="नमस्ते"}
::
`;

      const result = await parseMDX(content);

      expect(result.tree).toBeDefined();
      const hasLeafDirective = result.tree.children.some(
        (node: any) => node.type === 'leafDirective'
      );
      expect(hasLeafDirective).toBe(true);
    });

    it('should handle Hindi Devanagari text', async () => {
      const content = `
# पाठ एक

यह चीन है ।
`;

      const result = await parseMDX(content);

      expect(result.tree).toBeDefined();
      expect(result.tree.type).toBe('root');
    });

    it('should handle nested directives', async () => {
      const content = `
:::vocabulary-set{id="vocab-set-1"}

::vocab{word="यह" translation="this"}
::

::vocab{word="है" translation="is"}
::

:::
`;

      const result = await parseMDX(content);

      expect(result.tree).toBeDefined();
      // Should have container directive with nested leaf directives
      const containerDirective: any = result.tree.children.find(
        (node: any) => node.type === 'containerDirective'
      );
      expect(containerDirective).toBeDefined();
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract frontmatter from tree', async () => {
      const content = `---
type: lesson
id: unit-01
title: "Unit 1"
order: 1
metadata:
  pageNumber: 1
  estimatedTime: 30
---

# Content
`;

      const { tree } = await parseMDX(content, { extractFrontmatter: false });
      const frontmatter = extractFrontmatter(tree);

      expect(frontmatter).toEqual({
        type: 'lesson',
        id: 'unit-01',
        title: 'Unit 1',
        order: 1,
        metadata: {
          pageNumber: 1,
          estimatedTime: 30,
        },
      });
    });

    it('should return empty object if no frontmatter', async () => {
      const content = '# Hello';
      const { tree } = await parseMDX(content, { extractFrontmatter: false });
      const frontmatter = extractFrontmatter(tree);

      expect(frontmatter).toEqual({});
    });

    it('should handle invalid YAML gracefully', async () => {
      const tree: MdastRoot = {
        type: 'root',
        children: [
          {
            type: 'yaml' as any,
            value: 'invalid: yaml: : content',
          },
        ],
      };

      const frontmatter = extractFrontmatter(tree);
      // Should return empty object on parse error
      expect(frontmatter).toEqual({});
    });
  });

  describe('createMDXParser', () => {
    it('should create unified processor', () => {
      const parser = createMDXParser();
      expect(parser).toBeDefined();
      expect(typeof parser.parse).toBe('function');
      expect(typeof parser.process).toBe('function');
    });
  });
});
