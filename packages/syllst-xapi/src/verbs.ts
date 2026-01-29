/**
 * @syllst/xapi - Verb Constants
 *
 * All xAPI verbs used in the syllst language
 * learning profile. Includes referenced standard
 * verbs and new language-learning-specific verbs.
 */

import type { VerbDefinition } from "./types.js";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

// ============================================================
// Verb IRI Constants
// ============================================================

/**
 * All verb IRIs used in the syllst xAPI profile.
 *
 * Standard verbs reference their original IRIs.
 * New language-learning verbs use the syllst
 * namespace.
 *
 * @example
 * ```typescript
 * import { VERBS } from "@syllst/xapi/verbs";
 *
 * const verb = {
 *   id: VERBS.ANSWERED,
 *   display: { "en-US": "answered" },
 * };
 * ```
 */
export const VERBS = {
  // --- ADL standard verbs ---
  LAUNCHED:
    "http://adlnet.gov/expapi/verbs/launched",
  INITIALIZED:
    "http://adlnet.gov/expapi/verbs/initialized",
  COMPLETED:
    "http://adlnet.gov/expapi/verbs/completed",
  PASSED:
    "http://adlnet.gov/expapi/verbs/passed",
  FAILED:
    "http://adlnet.gov/expapi/verbs/failed",
  TERMINATED:
    "http://adlnet.gov/expapi/verbs/terminated",
  ATTEMPTED:
    "http://adlnet.gov/expapi/verbs/attempted",
  ANSWERED:
    "http://adlnet.gov/expapi/verbs/answered",
  MASTERED:
    "http://adlnet.gov/expapi/verbs/mastered",
  SCORED:
    "http://adlnet.gov/expapi/verbs/scored",
  PROGRESSED:
    "http://adlnet.gov/expapi/verbs/progressed",
  INTERACTED:
    "http://adlnet.gov/expapi/verbs/interacted",
  EXPERIENCED:
    "http://adlnet.gov/expapi/verbs/experienced",
  SHARED:
    "http://adlnet.gov/expapi/verbs/shared",

  // --- cmi5 verbs ---
  WAIVED:
    "https://w3id.org/xapi/adl/verbs/waived",
  ABANDONED:
    "https://w3id.org/xapi/adl/verbs/abandoned",
  SATISFIED:
    "https://w3id.org/xapi/adl/verbs/satisfied",

  // --- TinCan verbs ---
  VIEWED:
    "http://id.tincanapi.com/verb/viewed",
  RECALLED:
    "http://id.tincanapi.com/verb/recalled",
  REVIEWED:
    "http://id.tincanapi.com/verb/reviewed",
  SKIPPED:
    "http://id.tincanapi.com/verb/skipped",
  IMPORTED:
    "http://id.tincanapi.com/verb/imported",
  BOOKMARKED:
    "http://id.tincanapi.com/verb/bookmarked",

  // --- Activity Streams verbs ---
  READ:
    "http://activitystrea.ms/schema/1.0/read",
  WATCHED:
    "http://activitystrea.ms/schema/1.0/watch",
  LISTENED:
    "http://activitystrea.ms/schema/1.0/listen",

  // --- Syllst language-learning verbs (NEW) ---
  TRANSCRIBED:
    `${SYLLST_XAPI_NAMESPACE}verbs/transcribed`,
  PRONOUNCED:
    `${SYLLST_XAPI_NAMESPACE}verbs/pronounced`,
  TRANSLATED:
    `${SYLLST_XAPI_NAMESPACE}verbs/translated`,
  PRACTICED:
    `${SYLLST_XAPI_NAMESPACE}verbs/practiced`,
  DRILLED:
    `${SYLLST_XAPI_NAMESPACE}verbs/drilled`,
} as const;

/**
 * Union type of all verb IRI string literals.
 */
export type VerbId =
  (typeof VERBS)[keyof typeof VERBS];

// ============================================================
// Rich Verb Definitions
// ============================================================

/**
 * Full verb definitions with display names.
 * Keyed by the same keys as {@link VERBS}.
 */
export const VERB_DEFINITIONS: Readonly<
  Record<keyof typeof VERBS, VerbDefinition>
> = {
  // ADL
  LAUNCHED: {
    id: VERBS.LAUNCHED,
    display: { "en-US": "launched" },
  },
  INITIALIZED: {
    id: VERBS.INITIALIZED,
    display: { "en-US": "initialized" },
  },
  COMPLETED: {
    id: VERBS.COMPLETED,
    display: { "en-US": "completed" },
  },
  PASSED: {
    id: VERBS.PASSED,
    display: { "en-US": "passed" },
  },
  FAILED: {
    id: VERBS.FAILED,
    display: { "en-US": "failed" },
  },
  TERMINATED: {
    id: VERBS.TERMINATED,
    display: { "en-US": "terminated" },
  },
  ATTEMPTED: {
    id: VERBS.ATTEMPTED,
    display: { "en-US": "attempted" },
  },
  ANSWERED: {
    id: VERBS.ANSWERED,
    display: { "en-US": "answered" },
  },
  MASTERED: {
    id: VERBS.MASTERED,
    display: { "en-US": "mastered" },
  },
  SCORED: {
    id: VERBS.SCORED,
    display: { "en-US": "scored" },
  },
  PROGRESSED: {
    id: VERBS.PROGRESSED,
    display: { "en-US": "progressed" },
  },
  INTERACTED: {
    id: VERBS.INTERACTED,
    display: { "en-US": "interacted" },
  },
  EXPERIENCED: {
    id: VERBS.EXPERIENCED,
    display: { "en-US": "experienced" },
  },
  SHARED: {
    id: VERBS.SHARED,
    display: { "en-US": "shared" },
  },
  // cmi5
  WAIVED: {
    id: VERBS.WAIVED,
    display: { "en-US": "waived" },
  },
  ABANDONED: {
    id: VERBS.ABANDONED,
    display: { "en-US": "abandoned" },
  },
  SATISFIED: {
    id: VERBS.SATISFIED,
    display: { "en-US": "satisfied" },
  },
  // TinCan
  VIEWED: {
    id: VERBS.VIEWED,
    display: { "en-US": "viewed" },
  },
  RECALLED: {
    id: VERBS.RECALLED,
    display: { "en-US": "recalled" },
  },
  REVIEWED: {
    id: VERBS.REVIEWED,
    display: { "en-US": "reviewed" },
  },
  SKIPPED: {
    id: VERBS.SKIPPED,
    display: { "en-US": "skipped" },
  },
  IMPORTED: {
    id: VERBS.IMPORTED,
    display: { "en-US": "imported" },
  },
  BOOKMARKED: {
    id: VERBS.BOOKMARKED,
    display: { "en-US": "bookmarked" },
  },
  // Activity Streams
  READ: {
    id: VERBS.READ,
    display: { "en-US": "read" },
  },
  WATCHED: {
    id: VERBS.WATCHED,
    display: { "en-US": "watched" },
  },
  LISTENED: {
    id: VERBS.LISTENED,
    display: { "en-US": "listened" },
  },
  // Syllst (NEW)
  TRANSCRIBED: {
    id: VERBS.TRANSCRIBED,
    display: { "en-US": "transcribed" },
  },
  PRONOUNCED: {
    id: VERBS.PRONOUNCED,
    display: { "en-US": "pronounced" },
  },
  TRANSLATED: {
    id: VERBS.TRANSLATED,
    display: { "en-US": "translated" },
  },
  PRACTICED: {
    id: VERBS.PRACTICED,
    display: { "en-US": "practiced" },
  },
  DRILLED: {
    id: VERBS.DRILLED,
    display: { "en-US": "drilled" },
  },
} as const;

// ============================================================
// Verb Labels
// ============================================================

/**
 * Human-readable verb labels keyed by IRI.
 */
export const VERB_LABELS: Readonly<
  Record<VerbId, string>
> = {
  [VERBS.LAUNCHED]: "Launched",
  [VERBS.INITIALIZED]: "Initialized",
  [VERBS.COMPLETED]: "Completed",
  [VERBS.PASSED]: "Passed",
  [VERBS.FAILED]: "Failed",
  [VERBS.TERMINATED]: "Terminated",
  [VERBS.ATTEMPTED]: "Attempted",
  [VERBS.ANSWERED]: "Answered",
  [VERBS.MASTERED]: "Mastered",
  [VERBS.SCORED]: "Scored",
  [VERBS.PROGRESSED]: "Progressed",
  [VERBS.INTERACTED]: "Interacted",
  [VERBS.EXPERIENCED]: "Experienced",
  [VERBS.SHARED]: "Shared",
  [VERBS.WAIVED]: "Waived",
  [VERBS.ABANDONED]: "Abandoned",
  [VERBS.SATISFIED]: "Satisfied",
  [VERBS.VIEWED]: "Viewed",
  [VERBS.RECALLED]: "Recalled",
  [VERBS.REVIEWED]: "Reviewed",
  [VERBS.SKIPPED]: "Skipped",
  [VERBS.IMPORTED]: "Imported",
  [VERBS.BOOKMARKED]: "Bookmarked",
  [VERBS.READ]: "Read",
  [VERBS.WATCHED]: "Watched",
  [VERBS.LISTENED]: "Listened",
  [VERBS.TRANSCRIBED]: "Transcribed",
  [VERBS.PRONOUNCED]: "Pronounced",
  [VERBS.TRANSLATED]: "Translated",
  [VERBS.PRACTICED]: "Practiced",
  [VERBS.DRILLED]: "Drilled",
} as const;

/**
 * Get a human-readable label for a verb IRI.
 */
export function getVerbLabel(verbId: VerbId): string {
  return (
    VERB_LABELS[verbId] ??
    verbId.split("/").pop() ??
    "Unknown"
  );
}
