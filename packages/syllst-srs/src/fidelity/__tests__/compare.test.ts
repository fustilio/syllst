import { describe, it, expect } from 'vitest';
import {
  compareCardSets,
  compareSingleCard,
  calculateSimilarity,
  normalizeText,
  computeFieldFidelity,
} from '../compare.js';
import type { SrsCard } from '../../types.js';
import type { AnkiCardForComparison } from '../index.js';

function makeAnkiCard(overrides?: Partial<AnkiCardForComparison>): AnkiCardForComparison {
  return {
    id: overrides?.id ?? 'anki-1',
    front: overrides?.front ?? 'hello',
    back: overrides?.back ?? 'world',
    fields: overrides?.fields ?? {},
    tags: overrides?.tags ?? [],
    deckName: overrides?.deckName ?? 'TestDeck',
    ...overrides,
  };
}

function makeSrsCard(overrides?: Partial<SrsCard>): SrsCard {
  return {
    id: overrides?.id ?? 'srs-1',
    sourceRef: overrides?.sourceRef ?? 'lesson-01:vocab:1',
    sourceType: overrides?.sourceType ?? 'vocabularyItem',
    activityType: overrides?.activityType ?? 'recognition',
    prompt: {
      text: overrides?.prompt?.text ?? 'hello',
      transcription: overrides?.prompt?.transcription,
      context: overrides?.prompt?.context,
    },
    answer: {
      text: overrides?.answer?.text ?? 'world',
      alternatives: overrides?.answer?.alternatives,
      explanation: overrides?.answer?.explanation,
    },
    tags: overrides?.tags ?? [],
    ...overrides,
  };
}

describe('normalizeText', () => {
  it('lowercases text', () => {
    expect(normalizeText('Hello')).toBe('hello');
  });

  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('strips HTML tags', () => {
    expect(normalizeText('<b>hello</b>')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(normalizeText('')).toBe('');
  });
});

describe('calculateSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(calculateSimilarity('hello', 'hello')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    expect(calculateSimilarity('abc', 'xyz')).toBe(0);
  });

  it('returns a value between 0 and 1 for similar strings', () => {
    const score = calculateSimilarity('hello', 'helo');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('is case-insensitive', () => {
    expect(calculateSimilarity('Hello', 'hello')).toBe(1);
  });

  it('returns 0 when one string is empty', () => {
    expect(calculateSimilarity('hello', '')).toBe(0);
  });
});

describe('compareSingleCard', () => {
  it('returns high score for identical cards', () => {
    const anki = makeAnkiCard({ front: 'hello', back: 'world' });
    const srs = makeSrsCard({ prompt: { text: 'hello' }, answer: { text: 'world' } });
    const score = compareSingleCard(anki, srs);
    // front (1 * 0.4) + back (1 * 0.4) + fields (0 * 0.2) = 0.8
    expect(score).toBeGreaterThanOrEqual(0.8);
  });

  it('returns 0 when cards do not match', () => {
    const anki = makeAnkiCard({ front: 'hello', back: 'world' });
    const srs = makeSrsCard({ prompt: { text: 'goodbye' }, answer: { text: 'earth' } });
    const score = compareSingleCard(anki, srs);
    expect(score).toBe(0);
  });

  it('respects custom similarity threshold', () => {
    const anki = makeAnkiCard({ front: 'hello', back: 'world' });
    const srs = makeSrsCard({ prompt: { text: 'helo' }, answer: { text: 'world' } });
    const score = compareSingleCard(anki, srs, { similarityThreshold: 0.9 });
    expect(score).toBe(0);
  });

  it('matches transcription field', () => {
    const anki = makeAnkiCard({
      front: 'hello',
      back: 'world',
      fields: { reading: 'həˈloʊ' },
    });
    const srs = makeSrsCard({
      prompt: { text: 'hello', transcription: 'həˈloʊ' },
      answer: { text: 'world' },
    });
    const score = compareSingleCard(anki, srs);
    expect(score).toBeGreaterThan(0.9);
  });
});

describe('compareCardSets', () => {
  it('matches identical card sets one-to-one', () => {
    const ankiCards = [
      makeAnkiCard({ id: 'a1', front: 'cat', back: 'gato' }),
      makeAnkiCard({ id: 'a2', front: 'dog', back: 'perro' }),
    ];
    const srsCards = [
      makeSrsCard({ id: 's1', prompt: { text: 'cat' }, answer: { text: 'gato' } }),
      makeSrsCard({ id: 's2', prompt: { text: 'dog' }, answer: { text: 'perro' } }),
    ];
    const pairs = compareCardSets(ankiCards, srsCards);
    expect(pairs).toHaveLength(2);
  });

  it('ignores unmatched SRS cards', () => {
    const ankiCards = [makeAnkiCard({ id: 'a1', front: 'cat', back: 'gato' })];
    const srsCards = [
      makeSrsCard({ id: 's1', prompt: { text: 'cat' }, answer: { text: 'gato' } }),
      makeSrsCard({ id: 's2', prompt: { text: 'dog' }, answer: { text: 'perro' } }),
    ];
    const pairs = compareCardSets(ankiCards, srsCards);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.ankiCard.id).toBe('a1');
    expect(pairs[0]!.srsCard.id).toBe('s1');
  });

  it('returns empty array when no cards match', () => {
    const ankiCards = [makeAnkiCard({ front: 'cat', back: 'gato' })];
    const srsCards = [makeSrsCard({ prompt: { text: 'dog' }, answer: { text: 'perro' } })];
    const pairs = compareCardSets(ankiCards, srsCards);
    expect(pairs).toHaveLength(0);
  });

  it('finds best match when multiple SRS cards are similar', () => {
    const ankiCards = [makeAnkiCard({ id: 'a1', front: 'cat', back: 'gato' })];
    const srsCards = [
      makeSrsCard({ id: 's1', prompt: { text: 'car' }, answer: { text: 'auto' } }),
      makeSrsCard({ id: 's2', prompt: { text: 'cat' }, answer: { text: 'gato' } }),
    ];
    const pairs = compareCardSets(ankiCards, srsCards);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.srsCard.id).toBe('s2');
  });
});

describe('computeFieldFidelity', () => {
  it('computes perfect fidelity for identical cards', () => {
    const ankiCards = [
      makeAnkiCard({ id: 'a1', front: 'hello', back: 'world' }),
    ];
    const srsCards = [
      makeSrsCard({ id: 's1', prompt: { text: 'hello' }, answer: { text: 'world' } }),
    ];
    const pairs = compareCardSets(ankiCards, srsCards);
    const fidelity = computeFieldFidelity(pairs, ankiCards);

    const frontScore = fidelity.find((f) => f.field === 'front');
    expect(frontScore).toBeDefined();
    expect(frontScore!.averageScore).toBe(1);
    expect(frontScore!.srsCardsMatched).toBe(1);

    const backScore = fidelity.find((f) => f.field === 'back');
    expect(backScore).toBeDefined();
    expect(backScore!.averageScore).toBe(1);
  });

  it('reports zero fidelity for unmatched cards', () => {
    const ankiCards = [makeAnkiCard({ id: 'a1', front: 'hello', back: 'world' })];
    const pairs: ReturnType<typeof compareCardSets> = [];
    const fidelity = computeFieldFidelity(pairs, ankiCards);

    const frontScore = fidelity.find((f) => f.field === 'front');
    expect(frontScore!.averageScore).toBe(0);
    expect(frontScore!.srsCardsMatched).toBe(0);
  });

  it('tracks custom fields', () => {
    const ankiCards = [
      makeAnkiCard({ id: 'a1', front: 'hello', back: 'world', fields: { notes: 'a greeting' } }),
    ];
    const srsCards = [
      makeSrsCard({
        id: 's1',
        prompt: { text: 'hello' },
        answer: { text: 'world', explanation: 'a greeting' },
      }),
    ];
    const pairs = compareCardSets(ankiCards, srsCards);
    const fidelity = computeFieldFidelity(pairs, ankiCards);

    const notesScore = fidelity.find((f) => f.field === 'notes');
    expect(notesScore).toBeDefined();
    expect(notesScore!.ankiCardsWithField).toBe(1);
  });
});
