/**
 * @syllst/validator Types
 */

/**
 * CLI validation options
 */
export interface ValidateOptions {
  /** Enable strict validation mode */
  strict: boolean;
  /** Output format */
  format: 'human' | 'json';
  /** Output file path */
  output?: string;
  /** Recursively search directories */
  recursive: boolean;
  /** Only output errors (no warnings) */
  quiet: boolean;
  /** Show detailed validation info */
  verbose: boolean;
}

/**
 * Per-file validation result
 */
export interface FileValidationResult {
  /** File path */
  file: string;
  /** Whether the file is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Per-stage validation results */
  stages: {
    syntax: boolean;
    structure: boolean;
    references: boolean;
    glost: boolean;
    externalFormats: boolean;
  };
  /** Validation duration in ms */
  duration: number;
}

/**
 * JSON report format
 */
export interface JsonReport {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    timestamp: string;
  };
  results: FileValidationResult[];
}
