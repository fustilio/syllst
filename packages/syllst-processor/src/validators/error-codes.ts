/**
 * Syllst Validation Error Codes
 *
 * Structured error codes for programmatic consumption by consumer apps.
 * These codes are stable and safe to use in error handling logic.
 */

/**
 * Syllst validation error code constants
 *
 * Error codes follow the pattern: SYLLST_ERR_<CATEGORY>_<SPECIFIC>
 * - Categories: SCHEMA, REFERENCE, NODE, STRUCTURE
 * - All codes are prefixed with SYLLST_ERR_ for namespacing
 */
export const SYLLST_ERROR_CODES = {
  // Schema validation errors (Zod-based)
  /** Node is missing the required 'type' property */
  MISSING_TYPE: "SYLLST_ERR_SCHEMA_MISSING_TYPE",
  /** Node type is not recognized by syllst */
  UNKNOWN_NODE_TYPE: "SYLLST_ERR_SCHEMA_UNKNOWN_NODE_TYPE",
  /** Schema validation failed (generic Zod validation error) */
  SCHEMA_VALIDATION_FAILED: "SYLLST_ERR_SCHEMA_VALIDATION_FAILED",
  /** Required field is missing from node */
  MISSING_REQUIRED_FIELD: "SYLLST_ERR_SCHEMA_MISSING_REQUIRED_FIELD",
  /** Field value does not match expected type */
  INVALID_FIELD_TYPE: "SYLLST_ERR_SCHEMA_INVALID_FIELD_TYPE",
  /** Field value does not match expected format or pattern */
  INVALID_FIELD_VALUE: "SYLLST_ERR_SCHEMA_INVALID_FIELD_VALUE",

  // Reference validation errors
  /** GLOST document reference cannot be resolved */
  UNRESOLVED_GLOST_REFERENCE: "SYLLST_ERR_REF_UNRESOLVED_GLOST",
  /** Multiple unresolved GLOST references found */
  MULTIPLE_UNRESOLVED_GLOST_REFS: "SYLLST_ERR_REF_MULTIPLE_UNRESOLVED_GLOST",
  /** Reference ID is invalid or malformed */
  INVALID_REFERENCE_ID: "SYLLST_ERR_REF_INVALID_ID",
  /** Duplicate ID found in syllabus */
  DUPLICATE_ID: "SYLLST_ERR_REF_DUPLICATE_ID",

  // Node structure errors
  /** Lesson validation failed */
  LESSON_VALIDATION_FAILED: "SYLLST_ERR_NODE_LESSON_VALIDATION_FAILED",
  /** Dialogue validation failed */
  DIALOGUE_VALIDATION_FAILED: "SYLLST_ERR_NODE_DIALOGUE_VALIDATION_FAILED",
  /** Syllabus root validation failed */
  SYLLABUS_VALIDATION_FAILED: "SYLLST_ERR_NODE_SYLLABUS_VALIDATION_FAILED",
  /** Generic node validation failed */
  NODE_VALIDATION_FAILED: "SYLLST_ERR_NODE_VALIDATION_FAILED",

  // MDX parsing errors
  /** MDX frontmatter is missing or invalid */
  MISSING_FRONTMATTER: "SYLLST_ERR_MDX_MISSING_FRONTMATTER",
  /** MDX parsing failed */
  MDX_PARSE_FAILED: "SYLLST_ERR_MDX_PARSE_FAILED",

  // Extension validation errors
  /** External format validation failed */
  EXTERNAL_FORMAT_VALIDATION_FAILED:
    "SYLLST_ERR_EXT_EXTERNAL_FORMAT_VALIDATION_FAILED",
} as const;

/**
 * Type for error code values
 */
export type SyllstErrorCode =
  (typeof SYLLST_ERROR_CODES)[keyof typeof SYLLST_ERROR_CODES];

/**
 * Check if a string is a valid Syllst error code
 */
export function isSyllstErrorCode(code: string): code is SyllstErrorCode {
  return Object.values(SYLLST_ERROR_CODES).includes(code as SyllstErrorCode);
}

/**
 * Get error code category from error code
 * @returns Category string (e.g., "SCHEMA", "REF", "NODE", "MDX", "EXT")
 */
export function getErrorCodeCategory(
  code: SyllstErrorCode
): string | undefined {
  const match = code.match(/^SYLLST_ERR_([A-Z]+)_/);
  return match?.[1];
}
