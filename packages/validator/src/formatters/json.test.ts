/**
 * Tests for JSON output formatter
 */

import { describe, it, expect } from 'vitest';
import { formatJsonOutput } from './json.js';
import type { FileValidationResult, ValidateOptions } from '../types.js';

const createOptions = (
  overrides: Partial<ValidateOptions> = {}
): ValidateOptions => ({
  strict: false,
  format: 'json',
  recursive: false,
  quiet: false,
  verbose: false,
  ...overrides,
});

const createResult = (
  overrides: Partial<FileValidationResult> = {}
): FileValidationResult => ({
  file: 'test.mdx',
  valid: true,
  errors: [],
  warnings: [],
  stages: {
    syntax: true,
    structure: true,
    references: true,
    glost: true,
    externalFormats: true,
  },
  duration: 10,
  ...overrides,
});

describe('formatJsonOutput', () => {
  it('should output valid JSON', () => {
    const results = [createResult()];
    const output = formatJsonOutput(results, createOptions());

    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('should include summary', () => {
    const results = [createResult(), createResult({ valid: false })];
    const output = formatJsonOutput(results, createOptions());
    const parsed = JSON.parse(output);

    expect(parsed.summary).toBeDefined();
    expect(parsed.summary.total).toBe(2);
    expect(parsed.summary.valid).toBe(1);
    expect(parsed.summary.invalid).toBe(1);
    expect(parsed.summary.timestamp).toBeDefined();
  });

  it('should include results array', () => {
    const results = [createResult()];
    const output = formatJsonOutput(results, createOptions());
    const parsed = JSON.parse(output);

    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].file).toBe('test.mdx');
  });

  it('should strip warnings in quiet mode', () => {
    const results = [createResult({ warnings: ['Test warning'] })];
    const output = formatJsonOutput(results, createOptions({ quiet: true }));
    const parsed = JSON.parse(output);

    expect(parsed.results[0].warnings).toHaveLength(0);
  });

  it('should preserve warnings in normal mode', () => {
    const results = [createResult({ warnings: ['Test warning'] })];
    const output = formatJsonOutput(results, createOptions());
    const parsed = JSON.parse(output);

    expect(parsed.results[0].warnings).toHaveLength(1);
    expect(parsed.results[0].warnings[0]).toBe('Test warning');
  });
});
