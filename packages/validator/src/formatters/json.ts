/**
 * JSON output formatter
 */

import type {
  FileValidationResult,
  ValidateOptions,
  JsonReport,
} from '../types.js';

/**
 * Format validation results as JSON
 */
export function formatJsonOutput(
  results: FileValidationResult[],
  options: ValidateOptions
): string {
  const report: JsonReport = {
    summary: {
      total: results.length,
      valid: results.filter((r) => r.valid).length,
      invalid: results.filter((r) => !r.valid).length,
      timestamp: new Date().toISOString(),
    },
    results: options.quiet
      ? results.map((r) => ({
          ...r,
          warnings: [], // Strip warnings in quiet mode
        }))
      : results,
  };

  return JSON.stringify(report, null, 2);
}
