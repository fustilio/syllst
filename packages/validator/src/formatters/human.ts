/**
 * Human-readable output formatter
 */

import type { FileValidationResult, ValidateOptions } from '../types.js';

const SYMBOLS = {
  success: '\u2713', // checkmark
  error: '\u2717', // cross
  warning: '\u26A0', // warning
};

/**
 * Format validation results for human-readable output
 */
export function formatHumanOutput(
  results: FileValidationResult[],
  options: ValidateOptions
): string {
  const lines: string[] = [];

  // Summary header
  const total = results.length;
  const valid = results.filter((r) => r.valid).length;
  const invalid = total - valid;

  lines.push('');
  lines.push('Syllst Validation Report');
  lines.push('='.repeat(40));
  lines.push(`Files: ${total} | Valid: ${valid} | Invalid: ${invalid}`);
  lines.push('');

  // File results
  for (const result of results) {
    const icon = result.valid ? SYMBOLS.success : SYMBOLS.error;
    lines.push(`${icon} ${result.file}`);

    if (options.verbose) {
      // Show stage results
      lines.push('  Stages:');
      lines.push(
        `    Syntax:      ${result.stages.syntax ? SYMBOLS.success : SYMBOLS.error}`
      );
      lines.push(
        `    Structure:   ${result.stages.structure ? SYMBOLS.success : SYMBOLS.error}`
      );
      lines.push(
        `    References:  ${result.stages.references ? SYMBOLS.success : SYMBOLS.error}`
      );
      lines.push(
        `    GLOST:       ${result.stages.glost ? SYMBOLS.success : SYMBOLS.error}`
      );
      lines.push(
        `    External:    ${result.stages.externalFormats ? SYMBOLS.success : SYMBOLS.error}`
      );
      lines.push(`  Duration: ${result.duration}ms`);
    }

    // Show errors
    if (result.errors.length > 0) {
      for (const error of result.errors) {
        lines.push(`  ${SYMBOLS.error} ${error}`);
      }
    }

    // Show warnings (unless quiet mode)
    if (!options.quiet && result.warnings.length > 0) {
      for (const warning of result.warnings) {
        lines.push(`  ${SYMBOLS.warning} ${warning}`);
      }
    }

    lines.push('');
  }

  // Final summary
  if (invalid > 0) {
    lines.push(
      `${SYMBOLS.error} Validation failed: ${invalid} file(s) with errors`
    );
  } else {
    lines.push(`${SYMBOLS.success} All files validated successfully`);
  }

  return lines.join('\n');
}
