/**
 * Validate Command
 *
 * Core validation logic using @syllst/processor validators.
 */

import { promises as fs } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import {
  buildLessonFromMDX,
  validateMultiStage,
} from '@syllst/processor';
import { formatHumanOutput } from '../formatters/human.js';
import { formatJsonOutput } from '../formatters/json.js';
import type { ValidateOptions, FileValidationResult } from '../types.js';

/**
 * Execute the validate command
 *
 * @param paths - File or directory paths to validate
 * @param options - Validation options
 * @returns Exit code (0 = success, 1 = validation errors)
 */
export async function validateCommand(
  paths: string[],
  options: ValidateOptions
): Promise<number> {
  const results: FileValidationResult[] = [];

  for (const inputPath of paths) {
    const resolvedPath = resolve(inputPath);

    try {
      const stat = await fs.stat(resolvedPath);

      if (stat.isDirectory()) {
        const dirResults = await validateDirectory(resolvedPath, options);
        results.push(...dirResults);
      } else if (stat.isFile()) {
        const result = await validateFile(resolvedPath, options);
        results.push(result);
      }
    } catch (error) {
      // Handle file not found
      results.push({
        file: resolvedPath,
        valid: false,
        errors: [
          `File error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings: [],
        stages: {
          syntax: false,
          structure: false,
          references: false,
          glost: false,
          externalFormats: false,
        },
        duration: 0,
      });
    }
  }

  // Format output
  const output =
    options.format === 'json'
      ? formatJsonOutput(results, options)
      : formatHumanOutput(results, options);

  // Write output
  if (options.output) {
    await fs.writeFile(options.output, output, 'utf-8');
    if (!options.quiet) {
      console.log(`Report written to: ${options.output}`);
    }
  } else {
    console.log(output);
  }

  // Return exit code: 0 if all valid, 1 if any invalid
  const hasErrors = results.some((r) => !r.valid);
  return hasErrors ? 1 : 0;
}

/**
 * Validate a single file
 */
async function validateFile(
  filePath: string,
  options: ValidateOptions
): Promise<FileValidationResult> {
  const startTime = Date.now();

  // Only process MDX files
  if (extname(filePath) !== '.mdx') {
    return {
      file: filePath,
      valid: false,
      errors: ['Not an MDX file'],
      warnings: [],
      stages: {
        syntax: false,
        structure: false,
        references: false,
        glost: false,
        externalFormats: false,
      },
      duration: Date.now() - startTime,
    };
  }

  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Build lesson AST from MDX
    const lesson = await buildLessonFromMDX(content, {
      path: filePath,
      validate: false, // We'll validate separately for detailed results
    });

    // Run multi-stage validation
    const validation = validateMultiStage([lesson], {
      strict: options.strict,
      validateExternalFormats: true,
    });

    return {
      file: filePath,
      valid: validation.valid,
      errors: validation.allErrors,
      warnings: validation.allWarnings,
      stages: {
        syntax: validation.syntax.valid,
        structure: validation.structure.valid,
        references: validation.references.valid,
        glost: validation.glost.valid,
        externalFormats: validation.externalFormats.valid,
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      file: filePath,
      valid: false,
      errors: [
        `Parse error: ${error instanceof Error ? error.message : String(error)}`,
      ],
      warnings: [],
      stages: {
        syntax: false,
        structure: false,
        references: false,
        glost: false,
        externalFormats: false,
      },
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Validate all MDX files in a directory
 */
async function validateDirectory(
  dirPath: string,
  options: ValidateOptions
): Promise<FileValidationResult[]> {
  const results: FileValidationResult[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory() && options.recursive) {
        const subResults = await validateDirectory(fullPath, options);
        results.push(...subResults);
      } else if (entry.isFile() && extname(entry.name) === '.mdx') {
        const result = await validateFile(fullPath, options);
        results.push(result);
      }
    }
  } catch (error) {
    results.push({
      file: dirPath,
      valid: false,
      errors: [
        `Directory error: ${error instanceof Error ? error.message : String(error)}`,
      ],
      warnings: [],
      stages: {
        syntax: false,
        structure: false,
        references: false,
        glost: false,
        externalFormats: false,
      },
      duration: 0,
    });
  }

  return results;
}
