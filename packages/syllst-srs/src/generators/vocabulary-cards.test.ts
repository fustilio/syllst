/**
 * Vocabulary Card Generator Tests
 */

import { describe, it, expect } from 'vitest';
import type { VocabularyItemNode } from '@syllst/core';
import { generateVocabularyCards } from './vocabulary-cards.js';

const mockVocab: VocabularyItemNode = {
  type: 'vocabularyItem',
  id: 'lesson-01:vocab:hello',
  word: 'hello',
  transcription: { primary: 'he-LOH', ipa: '/həˈloʊ/' },
  translation: 'greeting',
  definition: 'A common greeting',
  example: 'Hello, how are you?',
  tags: ['greetings', 'basic'],
  value: 'hello',
};

describe('generateVocabularyCards', () => {
  it('generates recognition card by default', () => {
    const cards = generateVocabularyCards(mockVocab);
    const recognition = cards.find((c) => c.activityType === 'recognition');
    expect(recognition).toBeDefined();
    expect(recognition!.prompt.text).toBe('hello');
    expect(recognition!.answer.text).toBe('greeting');
  });

  it('generates production card by default', () => {
    const cards = generateVocabularyCards(mockVocab);
    const production = cards.find((c) => c.activityType === 'production');
    expect(production).toBeDefined();
    expect(production!.prompt.text).toBe('greeting');
    expect(production!.answer.text).toBe('hello');
  });

  it('generates comprehension card when example exists', () => {
    const cards = generateVocabularyCards(mockVocab);
    const comprehension = cards.find((c) => c.activityType === 'comprehension');
    expect(comprehension).toBeDefined();
    expect(comprehension!.prompt.text).toContain('_____');
    expect(comprehension!.answer.text).toBe('hello');
  });

  it('skips comprehension when no example exists', () => {
    const noExample = { ...mockVocab, example: undefined };
    const cards = generateVocabularyCards(noExample);
    const comprehension = cards.find((c) => c.activityType === 'comprehension');
    expect(comprehension).toBeUndefined();
  });

  it('filters by requested activity types', () => {
    const cards = generateVocabularyCards(mockVocab, {
      activityTypes: ['recognition'],
    });
    expect(cards.length).toBe(1);
    expect(cards[0].activityType).toBe('recognition');
  });

  it('respects maxCardsPerNode', () => {
    const cards = generateVocabularyCards(mockVocab, {
      maxCardsPerNode: 2,
    });
    expect(cards.length).toBe(2);
  });

  it('adds tags from source item', () => {
    const cards = generateVocabularyCards(mockVocab, { tagPrefix: 'test' });
    expect(cards[0].tags).toContain('test:vocabulary');
    expect(cards[0].tags).toContain('test:recognition');
    expect(cards[0].tags).toContain('greetings');
  });

  it('returns empty array for non-vocabulary nodes', () => {
    const cards = generateVocabularyCards({ type: 'content', format: 'markdown', value: 'foo' });
    expect(cards).toEqual([]);
  });
});
