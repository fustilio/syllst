import { describe, it, expect, vi } from 'vitest';
import { runFidelityTest } from '../harness.js';
import type { FidelityHarnessDeps } from '../harness.js';
import type { SrsCard } from '../../types.js';
import type { AnkiCardForComparison } from '../index.js';

describe('runFidelityTest', () => {
  it('runs a full round-trip and returns a report', async () => {
    const ankiCards: AnkiCardForComparison[] = [
      { id: 'a1', front: 'hello', back: 'world', fields: {}, tags: [], deckName: 'Test' },
      { id: 'a2', front: 'cat', back: 'gato', fields: {}, tags: [], deckName: 'Test' },
    ];

    const srsCards: SrsCard[] = [
      {
        id: 's1',
        sourceRef: 'lesson-01:vocab:1',
        sourceType: 'vocabularyItem',
        activityType: 'recognition',
        prompt: { text: 'hello' },
        answer: { text: 'world' },
        tags: [],
      },
      {
        id: 's2',
        sourceRef: 'lesson-01:vocab:2',
        sourceType: 'vocabularyItem',
        activityType: 'recognition',
        prompt: { text: 'cat' },
        answer: { text: 'gato' },
        tags: [],
      },
    ];

    const deps: FidelityHarnessDeps = {
      extractAnkiCards: vi.fn().mockResolvedValue(ankiCards),
      convertToSyllst: vi.fn().mockResolvedValue([]),
      generateSrsCards: vi.fn().mockReturnValue(srsCards),
    };

    const report = await runFidelityTest('test.apkg', deps);

    expect(report.sourceDeck).toBe('test.apkg');
    expect(report.totalAnkiCards).toBe(2);
    expect(report.totalSrsCards).toBe(2);
    // identical cards score 0.8 (front 0.4 + back 0.4 + fields 0.2*0)
    expect(report.overallScore).toBeGreaterThanOrEqual(0.8);
    expect(report.missingContent).toHaveLength(0);
    expect(report.unmatchedSrsCards).toHaveLength(0);
    expect(report.coverage.vocabularyItems).toBe(2);
  });

  it('reports missing content when cards do not match', async () => {
    const ankiCards: AnkiCardForComparison[] = [
      { id: 'a1', front: 'hello', back: 'world', fields: {}, tags: [], deckName: 'Test' },
    ];

    const srsCards: SrsCard[] = [
      {
        id: 's1',
        sourceRef: 'lesson-01:vocab:1',
        sourceType: 'vocabularyItem',
        activityType: 'recognition',
        prompt: { text: 'goodbye' },
        answer: { text: 'earth' },
        tags: [],
      },
    ];

    const deps: FidelityHarnessDeps = {
      extractAnkiCards: vi.fn().mockResolvedValue(ankiCards),
      convertToSyllst: vi.fn().mockResolvedValue([]),
      generateSrsCards: vi.fn().mockReturnValue(srsCards),
    };

    const report = await runFidelityTest('test.apkg', deps);

    expect(report.missingContent).toContain('a1');
    expect(report.unmatchedSrsCards).toContain('s1');
    expect(report.overallScore).toBe(0);
  });
});
