/**
 * Tests for human output formatter
 */

import { describe, it, expect } from 'vitest';
import { formatHumanOutput } from './human.js';
import type { FileValidationResult, ValidateOptions } from '../types.js';

const createOptions = (
  overrides: Partial<ValidateOptions> = {}
): ValidateOptions => ({
  strict: false,
  format: 'human',
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

describe('formatHumanOutput', () => {
  it('should format valid results', () => {
    const results = [createResult()];
    const output = formatHumanOutput(results, createOptions());

    expect(output).toContain('Syllst Validation Report');
    expect(output).toContain('Files: 1');
    expect(output).toContain('Valid: 1');
    expect(output).toContain('Invalid: 0');
    expect(output).toContain('test.mdx');
    expect(output).toContain('All files validated successfully');
  });

  it('should format invalid results', () => {
    const results = [
      createResult({
        valid: false,
        errors: ['Test error'],
        stages: { ...createResult().stages, syntax: false },
      }),
    ];
    const output = formatHumanOutput(results, createOptions());

    expect(output).toContain('Invalid: 1');
    expect(output).toContain('Test error');
    expect(output).toContain('Validation failed');
  });

  it('should show warnings in normal mode', () => {
    const results = [createResult({ warnings: ['Test warning'] })];
    const output = formatHumanOutput(results, createOptions());

    expect(output).toContain('Test warning');
  });

  it('should hide warnings in quiet mode', () => {
    const results = [createResult({ warnings: ['Test warning'] })];
    const output = formatHumanOutput(results, createOptions({ quiet: true }));

    expect(output).not.toContain('Test warning');
  });

  it('should show stage details in verbose mode', () => {
    const results = [createResult()];
    const output = formatHumanOutput(results, createOptions({ verbose: true }));

    expect(output).toContain('Stages:');
    expect(output).toContain('Syntax:');
    expect(output).toContain('Duration:');
  });
});
