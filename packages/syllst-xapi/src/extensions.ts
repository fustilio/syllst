/**
 * @syllst/xapi - Extension Constants & Schemas
 *
 * xAPI extensions for language learning context,
 * result, and activity data. Each extension has
 * a stable IRI, a TypeScript interface, and a
 * Zod validation schema.
 *
 * Shared Zod schemas (Bcp47Schema, CEFRLevelSchema,
 * DifficultyLevelSchema) are imported from
 * @syllst/core/schemas and re-exported here.
 * The corresponding TypeScript types live in
 * ./types.ts.
 */

import { z } from "zod";
import {
  Bcp47Schema,
  CEFRLevelSchema,
  DifficultyLevelSchema,
} from "@syllst/core/schemas";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

// Re-export core schemas for convenience
export { Bcp47Schema, CEFRLevelSchema };

/**
 * @deprecated Use DifficultyLevelSchema from @syllst/core/schemas
 */
export const DifficultySchema = DifficultyLevelSchema;
export { DifficultyLevelSchema };

// ============================================================
// Extension IRI Constants
// ============================================================

const CTX =
  `${SYLLST_XAPI_NAMESPACE}extensions/context/`;
const RES =
  `${SYLLST_XAPI_NAMESPACE}extensions/result/`;
const ACT =
  `${SYLLST_XAPI_NAMESPACE}extensions/activity/`;

/**
 * All extension IRIs defined by the syllst
 * language learning profile.
 *
 * @example
 * ```typescript
 * import { EXTENSIONS } from "@syllst/xapi";
 *
 * const context = {
 *   extensions: {
 *     [EXTENSIONS.TARGET_LANGUAGE]: "th",
 *     [EXTENSIONS.CEFR_LEVEL]: "A1",
 *   },
 * };
 * ```
 */
export const EXTENSIONS = {
  // Context extensions
  TARGET_LANGUAGE: `${CTX}target-language`,
  SOURCE_LANGUAGE: `${CTX}source-language`,
  CEFR_LEVEL: `${CTX}cefr-level`,
  TRANSCRIPTION_SYSTEM:
    `${CTX}transcription-system`,

  // Result extensions
  PRONUNCIATION_ACCURACY:
    `${RES}pronunciation-accuracy`,
  TRANSCRIPTION_ACCURACY:
    `${RES}transcription-accuracy`,

  // Activity definition extensions
  TARGET_WORD: `${ACT}target-word`,
  TRANSCRIPTION: `${ACT}transcription`,
  TRANSLATION: `${ACT}translation`,
  WORD_CLASS: `${ACT}word-class`,
  CHARACTER_TYPE: `${ACT}character-type`,
  DIFFICULTY: `${ACT}difficulty`,
} as const;

/**
 * Union type of all extension IRI literals.
 */
export type ExtensionIRI =
  (typeof EXTENSIONS)[keyof typeof EXTENSIONS];

// ============================================================
// Value Schemas (reusable)
// ============================================================

// Bcp47Schema, CEFRLevelSchema, and DifficultyLevelSchema
// are imported from @syllst/core/schemas and re-exported above.

/**
 * Transcription system identifier.
 * Provides known systems as an enum but also
 * accepts custom strings.
 */
export const TranscriptionSystemSchema = z
  .enum([
    "ipa",
    "paiboon",
    "paiboon+",
    "rtgs",
    "pinyin",
    "hepburn",
    "romaji",
    "yale",
    "mccune-reischauer",
    "revised-romanization",
  ])
  .or(z.string().min(1));

/**
 * Accuracy/score value between 0 and 1.
 *
 * Used for pronunciation and transcription accuracy
 * in result extensions. Maps to the xAPI scaled
 * score range where 0 = no match and 1 = perfect.
 */
export const AccuracyScoreSchema = z
  .number()
  .min(0)
  .max(1);

// DifficultySchema alias is defined at the top of this file.

/**
 * xAPI character type — strict 3-value subset used
 * in activity extensions.
 *
 * Only consonant, vowel, and tone-mark are tracked
 * as xAPI activity types. The full character type
 * set (11+ values including number, diacritic,
 * radical, logograph, etc.) lives in
 * CharacterTypeSchema from @syllst/core/schemas.
 */
export const XapiCharacterTypeSchema = z.enum([
  "consonant",
  "vowel",
  "tone-mark",
]);

/**
 * @deprecated Use XapiCharacterTypeSchema (xAPI 3-value subset)
 * or CharacterTypeSchema from @syllst/core/schemas (full set).
 */
export const CharacterTypeSchema =
  XapiCharacterTypeSchema;

// ============================================================
// Typed Extension Value Maps
// ============================================================

/**
 * Context extensions for language learning
 * statements.
 */
export interface LanguageLearningContextExtensions {
  [key: string]: unknown;
  [EXTENSIONS.TARGET_LANGUAGE]?: string;
  [EXTENSIONS.SOURCE_LANGUAGE]?: string;
  [EXTENSIONS.CEFR_LEVEL]?: string;
  [EXTENSIONS.TRANSCRIPTION_SYSTEM]?: string;
}

/**
 * Result extensions for language learning
 * statements.
 */
export interface LanguageLearningResultExtensions {
  [key: string]: unknown;
  [EXTENSIONS.PRONUNCIATION_ACCURACY]?: number;
  [EXTENSIONS.TRANSCRIPTION_ACCURACY]?: number;
}

/**
 * Activity definition extensions for language
 * learning activities.
 */
export interface LanguageLearningActivityExtensions {
  [key: string]: unknown;
  [EXTENSIONS.TARGET_WORD]?: string;
  [EXTENSIONS.TRANSCRIPTION]?: string;
  [EXTENSIONS.TRANSLATION]?: string;
  [EXTENSIONS.WORD_CLASS]?: string;
  [EXTENSIONS.CHARACTER_TYPE]?: string;
  [EXTENSIONS.DIFFICULTY]?: string;
}

// ============================================================
// Composite Extension Schemas
// ============================================================

/**
 * Schema for the `context.extensions` object
 * on a language learning statement.
 */
export const ContextExtensionsSchema = z
  .object({
    [EXTENSIONS.TARGET_LANGUAGE]:
      Bcp47Schema.optional(),
    [EXTENSIONS.SOURCE_LANGUAGE]:
      Bcp47Schema.optional(),
    [EXTENSIONS.CEFR_LEVEL]:
      CEFRLevelSchema.optional(),
    [EXTENSIONS.TRANSCRIPTION_SYSTEM]:
      TranscriptionSystemSchema.optional(),
  })
  .passthrough();

/**
 * Schema for the `result.extensions` object
 * on a language learning statement.
 */
export const ResultExtensionsSchema = z
  .object({
    [EXTENSIONS.PRONUNCIATION_ACCURACY]:
      AccuracyScoreSchema.optional(),
    [EXTENSIONS.TRANSCRIPTION_ACCURACY]:
      AccuracyScoreSchema.optional(),
  })
  .passthrough();

/**
 * Schema for the activity
 * `definition.extensions` object.
 */
export const ActivityExtensionsSchema = z
  .object({
    [EXTENSIONS.TARGET_WORD]:
      z.string().min(1).optional(),
    [EXTENSIONS.TRANSCRIPTION]:
      z.string().min(1).optional(),
    [EXTENSIONS.TRANSLATION]:
      z.string().min(1).optional(),
    [EXTENSIONS.WORD_CLASS]:
      z.string().min(1).optional(),
    [EXTENSIONS.CHARACTER_TYPE]:
      XapiCharacterTypeSchema.optional(),
    [EXTENSIONS.DIFFICULTY]:
      DifficultyLevelSchema.optional(),
  })
  .passthrough();
