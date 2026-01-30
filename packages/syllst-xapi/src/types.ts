/**
 * @syllst/xapi - Shared Types
 *
 * Base types and constants for the syllst
 * language learning xAPI profile.
 *
 * Domain types (CEFRLevel, DifficultyLevel, CharacterType)
 * are imported from @syllst/core to avoid duplication.
 */

// Re-export shared domain types from core
export type {
  CEFRLevel,
  DifficultyLevel,
  CharacterType,
} from "@syllst/core/types";

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
