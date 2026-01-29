#!/usr/bin/env node
/**
 * Syllst Validator CLI
 *
 * Command-line tool for validating Syllst MDX content.
 */

import { validateCommand } from './commands/validate.js';
import type { ValidateOptions } from './types.js';

const args = process.argv.slice(2);

function showHelp(): void {
  console.log(`
Syllst Validator - MDX Content Validation Tool

Usage:
  syllst-validate <file|directory> [options]

Arguments:
  <file>        Validate a single MDX file
  <directory>   Batch validate all MDX files in directory

Options:
  --strict              Enable strict validation mode
  --format=<format>     Output format: human (default), json
  --output=<file>       Write output to file instead of stdout
  --recursive, -r       Recursively search directories
  --quiet, -q           Only output errors (no warnings)
  --verbose, -v         Show detailed validation info
  --help, -h            Show this help message
  --version             Show version

Examples:
  syllst-validate lesson.mdx
  syllst-validate lessons/ --strict
  syllst-validate . --format=json --output=report.json
  syllst-validate content/ -r --quiet
`);
}

function showVersion(): void {
  console.log('@syllst/validator v0.1.0');
}

interface ParsedOptions {
  files: string[];
  strict: boolean;
  format: 'human' | 'json';
  output?: string;
  recursive: boolean;
  quiet: boolean;
  verbose: boolean;
  help: boolean;
  version: boolean;
}

function parseOptions(args: string[]): ParsedOptions {
  const options: ParsedOptions = {
    files: [],
    strict: false,
    format: 'human',
    output: undefined,
    recursive: false,
    quiet: false,
    verbose: false,
    help: false,
    version: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');

      switch (key) {
        case 'strict':
          options.strict = true;
          break;
        case 'format':
          if (value === 'json' || value === 'human') {
            options.format = value;
          }
          break;
        case 'output':
          options.output = value;
          break;
        case 'recursive':
          options.recursive = true;
          break;
        case 'quiet':
          options.quiet = true;
          break;
        case 'verbose':
          options.verbose = true;
          break;
        case 'help':
          options.help = true;
          break;
        case 'version':
          options.version = true;
          break;
      }
    } else if (arg.startsWith('-')) {
      const flags = arg.slice(1);
      for (const flag of flags) {
        switch (flag) {
          case 'r':
            options.recursive = true;
            break;
          case 'q':
            options.quiet = true;
            break;
          case 'v':
            options.verbose = true;
            break;
          case 'h':
            options.help = true;
            break;
        }
      }
    } else {
      // Positional argument (file/directory path)
      options.files.push(arg);
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseOptions(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.version) {
    showVersion();
    process.exit(0);
  }

  if (options.files.length === 0) {
    console.error('Error: No file or directory specified\n');
    showHelp();
    process.exit(1);
  }

  try {
    const validateOptions: ValidateOptions = {
      strict: options.strict,
      format: options.format,
      output: options.output,
      recursive: options.recursive,
      quiet: options.quiet,
      verbose: options.verbose,
    };

    const exitCode = await validateCommand(options.files, validateOptions);
    process.exit(exitCode);
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

main();
