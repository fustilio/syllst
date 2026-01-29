/**
 * @syllst/xapi - Shared Types
 *
 * Base types and constants for the syllst
 * language learning xAPI profile.
 */

/**
 * Base IRI namespace for all syllst xAPI concepts.
 */
export const SYLLST_XAPI_NAMESPACE =
  "https://syllst.dev/xapi/" as const;

/**
 * xAPI Verb definition with IRI and display names.
 */
export interface VerbDefinition {
  /** Verb IRI (globally unique identifier) */
  readonly id: string;
  /** Language-tagged display name map */
  readonly display: Readonly<Record<string, string>>;
}

/**
 * xAPI Activity Type definition.
 */
export interface ActivityTypeDefinition {
  /** Activity type IRI */
  readonly id: string;
  /** Language-tagged display name map */
  readonly display: Readonly<Record<string, string>>;
  /** Language-tagged description */
  readonly description?: Readonly<
    Record<string, string>
  >;
}

/**
 * xAPI Extension definition.
 */
export interface ExtensionDefinition {
  /** Extension IRI (used as key in extensions map) */
  readonly id: string;
  /** Where this extension is placed */
  readonly placement: "context" | "result" | "activity";
  /** Language-tagged display name */
  readonly display: Readonly<Record<string, string>>;
  /** Language-tagged description */
  readonly description?: Readonly<
    Record<string, string>
  >;
}

/**
 * CEFR proficiency levels.
 */
export type CEFRLevel =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2";

/**
 * Difficulty levels for language learning content.
 */
export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

/**
 * Character types for script/alphabet learning.
 */
export type CharacterType =
  | "consonant"
  | "vowel"
  | "tone-mark";
