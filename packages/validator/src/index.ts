/**
 * @syllst/validator
 *
 * CLI tool and programmatic API for validating Syllst MDX content.
 */

export { validateCommand } from './commands/validate.js';
export { formatHumanOutput } from './formatters/human.js';
export { formatJsonOutput } from './formatters/json.js';
export type {
  ValidateOptions,
  FileValidationResult,
  JsonReport,
} from './types.js';
