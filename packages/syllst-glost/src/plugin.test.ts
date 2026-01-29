/**
 * Tests for remarkSyllstGlost plugin
 */

import { describe, it, expect } from 'vitest';
import {
  remarkSyllstGlost,
  createProviderRegistry,
  LanguageProviderRegistry,
} from './index.js';
import type {
  TranscriptionProvider,
  RemarkSyllstGlostOptions,
} from './types.js';

// Mock transcription provider for testing
const createMockProvider = (): TranscriptionProvider => ({
  getTranscription: (word: string, scheme: string) => {
    if (scheme === 'test') {
      return `[${word}]`;
    }
    return undefined;
  },
  getDefaultScheme: () => 'test',
});

describe('LanguageProviderRegistry', () => {
  it('should register and retrieve providers', () => {
    const registry = new LanguageProviderRegistry();
    const provider = {
      lang: 'th',
      transcriptionProvider: createMockProvider(),
      defaultScheme: 'test',
    };

    registry.register(provider);

    expect(registry.has('th')).toBe(true);
    expect(registry.get('th')).toBe(provider);
  });

  it('should return undefined for unregistered languages', () => {
    const registry = new LanguageProviderRegistry();
    expect(registry.has('unknown')).toBe(false);
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('should fallback to base language code', () => {
    const registry = new LanguageProviderRegistry();
    const provider = {
      lang: 'th',
      transcriptionProvider: createMockProvider(),
    };

    registry.register(provider);

    // Should find 'th' when looking for 'th-TH'
    expect(registry.get('th-TH')).toBe(provider);
  });
});

describe('createProviderRegistry', () => {
  it('should create registry from config array', () => {
    const configs = [
      { lang: 'th', transcriptionProvider: createMockProvider() },
      { lang: 'ja', transcriptionProvider: createMockProvider() },
    ];

    const registry = createProviderRegistry(configs);

    expect(registry.has('th')).toBe(true);
    expect(registry.has('ja')).toBe(true);
    expect(registry.getLanguages()).toEqual(['th', 'ja']);
  });
});

describe('remarkSyllstGlost', () => {
  it('should be a function', () => {
    expect(typeof remarkSyllstGlost).toBe('function');
  });

  it('should return a transformer function', () => {
    const options: RemarkSyllstGlostOptions = {
      languages: [{ lang: 'th', transcriptionProvider: createMockProvider() }],
    };

    const transformer = remarkSyllstGlost(options);
    expect(typeof transformer).toBe('function');
  });

  it('should accept empty options', () => {
    const transformer = remarkSyllstGlost();
    expect(typeof transformer).toBe('function');
  });
});
