import { describe, it, expect } from 'vitest';
import { SyllabiIndex } from '../syllabi-index.js';

describe('SyllabiIndex', () => {
  const mockRoot = {
    type: 'syllabusRoot',
    meta: { id: 'test', title: 'Test' },
    children: [
      {
        type: 'chapter',
        id: 'ch1',
        title: 'Chapter 1',
        children: [
          {
            type: 'lesson',
            id: 'lesson1',
            title: 'Lesson 1',
            children: [
              { type: 'vocabularyItem', id: 'v1', word: '一', translation: 'one' },
              { type: 'vocabularyItem', id: 'v2', word: '二', translation: 'two' },
              { type: 'example', id: 'ex1', text: '一つです。', translation: 'It is one.' },
            ],
          },
        ],
      },
    ],
  };

  it('indexes vocabulary items', () => {
    const idx = new SyllabiIndex(mockRoot as any);
    expect(idx.vocab().length).toBe(2);
    expect(idx.vocab()[0]?.text).toBe('一');
    expect(idx.vocab()[1]?.text).toBe('二');
  });

  it('indexes examples', () => {
    const idx = new SyllabiIndex(mockRoot as any);
    expect(idx.examples().length).toBe(1);
    expect(idx.examples()[0]?.text).toBe('一つです。');
  });

  it('provides stats', () => {
    const idx = new SyllabiIndex(mockRoot as any);
    const stats = idx.stats();
    expect(stats.vocabularyItem).toBe(2);
    expect(stats.example).toBe(1);
    expect(stats.chapter).toBe(1);
    expect(stats.lesson).toBe(1);
  });

  it('looks up by id', () => {
    const idx = new SyllabiIndex(mockRoot as any);
    const node = idx.getById('v1');
    expect(node).toBeDefined();
    expect(node!.text).toBe('一');
  });
});
