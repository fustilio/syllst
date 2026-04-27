import { describe, it, expect } from 'vitest';
import { ExactMatchStrategy } from '../strategies/exact-match.js';

describe('ExactMatchStrategy', () => {
  it('matches identical text', () => {
    const strategy = new ExactMatchStrategy();
    const result = strategy.match(
      [{ id: '1', text: 'hello' }],
      [{ id: '2', text: 'hello' }]
    );
    expect(result.matched).toBe(1);
    expect(result.score).toBe(1);
  });

  it('ignores case and whitespace', () => {
    const strategy = new ExactMatchStrategy();
    const result = strategy.match(
      [{ id: '1', text: 'Hello World' }],
      [{ id: '2', text: 'hello  world' }]
    );
    expect(result.matched).toBe(1);
  });

  it('reports onlyInA and onlyInB', () => {
    const strategy = new ExactMatchStrategy();
    const result = strategy.match(
      [{ id: '1', text: 'a' }, { id: '2', text: 'b' }],
      [{ id: '3', text: 'b' }, { id: '4', text: 'c' }]
    );
    expect(result.matched).toBe(1);
    expect(result.onlyInA).toBe(1);
    expect(result.onlyInB).toBe(1);
  });
});
