import { describe, it, expect } from 'vitest';
import {
  validateReferences,
  validateGlostReferences,
} from './reference-validator';
import type { LessonAstNode, SyllabusRoot } from '@syllst/core';

// ============================================================================
// Fixtures
// ============================================================================

function makeLesson(id: string, children: any[]): LessonAstNode {
  return {
    type: 'lesson',
    id,
    title: id,
    order: 1,
    children,
  } as LessonAstNode;
}

function contentNode(format: string, value: string, ref?: string) {
  return {
    type: 'content' as const,
    format,
    value,
    ref,
  };
}

function makeSyllabus(lessons: LessonAstNode[]): SyllabusRoot {
  return {
    type: 'syllabusRoot',
    meta: {
      id: 'test',
      title: 'Test',
      language: 'th',
      version: '1.0.0',
      source: { title: 'Test' },
      extractedAt: '2025-01-01T00:00:00Z',
    },
    children: [
      {
        type: 'chapter' as any,
        id: 'ch1',
        title: 'Ch1',
        order: 1,
        children: lessons,
      },
    ],
  } as SyllabusRoot;
}

// ============================================================================
// validateReferences
// ============================================================================

describe('validateReferences', () => {
  describe('with no glost references', () => {
    it('should return valid for lessons with no content refs', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('markdown', '# Hello'),
          contentNode('text', 'plain text'),
        ]),
      ];

      const result = validateReferences(lessons);

      expect(result.valid).toBe(true);
      expect(result.unresolvedGlostRefs).toHaveLength(0);
    });

    it('should return valid for empty lesson array', () => {
      const result = validateReferences([]);
      expect(result.valid).toBe(true);
    });

    it('should return valid for lesson with no children', () => {
      const result = validateReferences([makeLesson('L1', [])]);
      expect(result.valid).toBe(true);
    });
  });

  describe('with valid glost references', () => {
    it('should validate glost content refs against known IDs', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'annotated text', 'doc-001'),
          contentNode('glost-dialogue', 'dialogue text', 'doc-002'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: ['doc-001', 'doc-002'],
      });

      expect(result.valid).toBe(true);
      expect(result.unresolvedGlostRefs).toHaveLength(0);
    });
  });

  describe('with unresolved glost references', () => {
    it('should detect unresolved glost references', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'annotated text', 'doc-missing'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: ['doc-001'],
      });

      expect(result.valid).toBe(false);
      expect(result.unresolvedGlostRefs).toHaveLength(1);
      expect(result.unresolvedGlostRefs[0].ref).toBe('doc-missing');
      expect(result.unresolvedGlostRefs[0].nodeType).toBe('content');
    });

    it('should report multiple unresolved references', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'text 1', 'missing-1'),
          contentNode('glost-dialogue', 'text 2', 'missing-2'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: [],
      });

      expect(result.valid).toBe(false);
      expect(result.unresolvedGlostRefs).toHaveLength(2);
    });

    it('should add warning message when not warnOnly', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'text', 'missing-ref'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: [],
      });

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('1 unresolved GLOST references');
    });

    it('should not add warning message when warnOnly', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'text', 'missing-ref'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: [],
        warnOnly: true,
      });

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('with mixed valid and invalid references', () => {
    it('should report only unresolved references', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'ok text', 'doc-001'),
          contentNode('glost', 'bad text', 'doc-missing'),
          contentNode('markdown', 'no ref needed'),
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: ['doc-001'],
      });

      expect(result.valid).toBe(false);
      expect(result.unresolvedGlostRefs).toHaveLength(1);
      expect(result.unresolvedGlostRefs[0].ref).toBe('doc-missing');
    });
  });

  describe('with SyllabusRoot input', () => {
    it('should validate references in a syllabus tree', () => {
      const syllabus = makeSyllabus([
        makeLesson('L1', [
          contentNode('glost', 'text', 'doc-001'),
        ]),
      ]);

      const result = validateReferences(syllabus, {
        glostDocumentIds: ['doc-001'],
      });

      expect(result.valid).toBe(true);
    });

    it('should detect unresolved refs in syllabus tree', () => {
      const syllabus = makeSyllabus([
        makeLesson('L1', [
          contentNode('glost', 'text', 'missing'),
        ]),
      ]);

      const result = validateReferences(syllabus, {
        glostDocumentIds: [],
      });

      expect(result.valid).toBe(false);
      expect(result.unresolvedGlostRefs).toHaveLength(1);
    });
  });

  describe('non-glost content nodes', () => {
    it('should ignore markdown content with ref field', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('markdown', 'text', 'some-ref'), // not glost format
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: [],
      });

      // markdown format refs are not validated as glost
      expect(result.valid).toBe(true);
    });

    it('should ignore glost content without ref field', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'inline annotated text'), // no ref
        ]),
      ];

      const result = validateReferences(lessons, {
        glostDocumentIds: [],
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('no glostDocumentIds provided', () => {
    it('should treat all glost refs as unresolved when no IDs given', () => {
      const lessons = [
        makeLesson('L1', [
          contentNode('glost', 'text', 'doc-001'),
        ]),
      ];

      // No glostDocumentIds option at all
      const result = validateReferences(lessons);

      expect(result.valid).toBe(false);
      expect(result.unresolvedGlostRefs).toHaveLength(1);
    });
  });
});

// ============================================================================
// validateGlostReferences (convenience wrapper)
// ============================================================================

describe('validateGlostReferences', () => {
  it('should validate with provided glost document IDs', () => {
    const lessons = [
      makeLesson('L1', [
        contentNode('glost', 'text', 'doc-001'),
      ]),
    ];

    const result = validateGlostReferences(lessons, ['doc-001']);

    expect(result.valid).toBe(true);
  });

  it('should detect missing glost references', () => {
    const lessons = [
      makeLesson('L1', [
        contentNode('glost', 'text', 'doc-missing'),
      ]),
    ];

    const result = validateGlostReferences(lessons, ['doc-001']);

    expect(result.valid).toBe(false);
    expect(result.unresolvedGlostRefs[0].ref).toBe('doc-missing');
  });
});
