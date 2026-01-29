/**
 * @syllst/xapi - Activity Type Constants
 *
 * All xAPI activity types used in the syllst
 * language learning profile.
 */

import type {
  ActivityTypeDefinition,
} from "./types.js";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

// ============================================================
// Activity Type IRI Constants
// ============================================================

/**
 * All activity type IRIs used in the syllst
 * xAPI profile.
 *
 * @example
 * ```typescript
 * import {
 *   ACTIVITY_TYPES,
 * } from "@syllst/xapi/activity-types";
 *
 * const definition = {
 *   type: ACTIVITY_TYPES.FLASHCARD_DECK,
 *   name: { "en-US": "Thai Consonants" },
 * };
 * ```
 */
export const ACTIVITY_TYPES = {
  // --- ADL standard types ---
  COURSE:
    "http://adlnet.gov/expapi/activities/course",
  MODULE:
    "http://adlnet.gov/expapi/activities/module",
  LESSON:
    "http://adlnet.gov/expapi/activities/lesson",
  OBJECTIVE:
    "http://adlnet.gov/expapi/activities/objective",
  ASSESSMENT:
    "http://adlnet.gov/expapi/activities/assessment",
  QUESTION:
    "http://adlnet.gov/expapi/activities/question",
  INTERACTION:
    "http://adlnet.gov/expapi/activities/interaction",
  CONTENT:
    "http://adlnet.gov/expapi/activities/content",
  FILE:
    "http://adlnet.gov/expapi/activities/file",
  LINK:
    "http://adlnet.gov/expapi/activities/link",

  // --- Activity Streams types ---
  ARTICLE:
    "http://activitystrea.ms/schema/1.0/article",
  VIDEO:
    "http://activitystrea.ms/schema/1.0/video",
  AUDIO:
    "http://activitystrea.ms/schema/1.0/audio",

  // --- Syllst language-learning types (NEW) ---
  VOCABULARY_DRILL:
    `${SYLLST_XAPI_NAMESPACE}activity-types/vocabulary-drill`,
  CHARACTER_RECOGNITION:
    `${SYLLST_XAPI_NAMESPACE}activity-types/character-recognition`,
  PRONUNCIATION_PRACTICE:
    `${SYLLST_XAPI_NAMESPACE}activity-types/pronunciation-practice`,
  DIALOGUE_PRACTICE:
    `${SYLLST_XAPI_NAMESPACE}activity-types/dialogue-practice`,
  GRAMMAR_EXERCISE:
    `${SYLLST_XAPI_NAMESPACE}activity-types/grammar-exercise`,
  CLOZE_TEST:
    `${SYLLST_XAPI_NAMESPACE}activity-types/cloze-test`,
  TRANSLATION_EXERCISE:
    `${SYLLST_XAPI_NAMESPACE}activity-types/translation-exercise`,
  FLASHCARD_DECK:
    `${SYLLST_XAPI_NAMESPACE}activity-types/flashcard-deck`,
  FLASHCARD:
    `${SYLLST_XAPI_NAMESPACE}activity-types/flashcard`,
  LISTENING_COMPREHENSION:
    `${SYLLST_XAPI_NAMESPACE}activity-types/listening-comprehension`,
  READING_COMPREHENSION:
    `${SYLLST_XAPI_NAMESPACE}activity-types/reading-comprehension`,
  SPACED_REPETITION_SESSION:
    `${SYLLST_XAPI_NAMESPACE}activity-types/spaced-repetition-session`,
} as const;

/**
 * Union type of all activity type IRI literals.
 */
export type ActivityTypeId =
  (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

// ============================================================
// Rich Activity Type Definitions
// ============================================================

/**
 * Full activity type definitions with display
 * names and descriptions.
 */
export const ACTIVITY_TYPE_DEFINITIONS: Readonly<
  Record<
    keyof typeof ACTIVITY_TYPES,
    ActivityTypeDefinition
  >
> = {
  // ADL
  COURSE: {
    id: ACTIVITY_TYPES.COURSE,
    display: { "en-US": "course" },
  },
  MODULE: {
    id: ACTIVITY_TYPES.MODULE,
    display: { "en-US": "module" },
  },
  LESSON: {
    id: ACTIVITY_TYPES.LESSON,
    display: { "en-US": "lesson" },
  },
  OBJECTIVE: {
    id: ACTIVITY_TYPES.OBJECTIVE,
    display: { "en-US": "objective" },
  },
  ASSESSMENT: {
    id: ACTIVITY_TYPES.ASSESSMENT,
    display: { "en-US": "assessment" },
  },
  QUESTION: {
    id: ACTIVITY_TYPES.QUESTION,
    display: { "en-US": "question" },
  },
  INTERACTION: {
    id: ACTIVITY_TYPES.INTERACTION,
    display: { "en-US": "interaction" },
  },
  CONTENT: {
    id: ACTIVITY_TYPES.CONTENT,
    display: { "en-US": "content" },
  },
  FILE: {
    id: ACTIVITY_TYPES.FILE,
    display: { "en-US": "file" },
  },
  LINK: {
    id: ACTIVITY_TYPES.LINK,
    display: { "en-US": "link" },
  },
  // Activity Streams
  ARTICLE: {
    id: ACTIVITY_TYPES.ARTICLE,
    display: { "en-US": "article" },
  },
  VIDEO: {
    id: ACTIVITY_TYPES.VIDEO,
    display: { "en-US": "video" },
  },
  AUDIO: {
    id: ACTIVITY_TYPES.AUDIO,
    display: { "en-US": "audio" },
  },
  // Syllst (NEW)
  VOCABULARY_DRILL: {
    id: ACTIVITY_TYPES.VOCABULARY_DRILL,
    display: { "en-US": "vocabulary drill" },
    description: {
      "en-US": "Vocabulary practice activity.",
    },
  },
  CHARACTER_RECOGNITION: {
    id: ACTIVITY_TYPES.CHARACTER_RECOGNITION,
    display: { "en-US": "character recognition" },
    description: {
      "en-US":
        "Character or alphabet identification activity.",
    },
  },
  PRONUNCIATION_PRACTICE: {
    id: ACTIVITY_TYPES.PRONUNCIATION_PRACTICE,
    display: { "en-US": "pronunciation practice" },
    description: {
      "en-US": "Pronunciation exercise.",
    },
  },
  DIALOGUE_PRACTICE: {
    id: ACTIVITY_TYPES.DIALOGUE_PRACTICE,
    display: { "en-US": "dialogue practice" },
    description: {
      "en-US": "Conversation practice activity.",
    },
  },
  GRAMMAR_EXERCISE: {
    id: ACTIVITY_TYPES.GRAMMAR_EXERCISE,
    display: { "en-US": "grammar exercise" },
    description: {
      "en-US": "Grammar drill or exercise.",
    },
  },
  CLOZE_TEST: {
    id: ACTIVITY_TYPES.CLOZE_TEST,
    display: { "en-US": "cloze test" },
    description: {
      "en-US": "Fill-in-the-blank exercise.",
    },
  },
  TRANSLATION_EXERCISE: {
    id: ACTIVITY_TYPES.TRANSLATION_EXERCISE,
    display: { "en-US": "translation exercise" },
    description: {
      "en-US": "Translation task between languages.",
    },
  },
  FLASHCARD_DECK: {
    id: ACTIVITY_TYPES.FLASHCARD_DECK,
    display: { "en-US": "flashcard deck" },
    description: {
      "en-US": "Collection of flashcards.",
    },
  },
  FLASHCARD: {
    id: ACTIVITY_TYPES.FLASHCARD,
    display: { "en-US": "flashcard" },
    description: {
      "en-US": "Individual flashcard item.",
    },
  },
  LISTENING_COMPREHENSION: {
    id: ACTIVITY_TYPES.LISTENING_COMPREHENSION,
    display: {
      "en-US": "listening comprehension",
    },
    description: {
      "en-US": "Listening comprehension exercise.",
    },
  },
  READING_COMPREHENSION: {
    id: ACTIVITY_TYPES.READING_COMPREHENSION,
    display: { "en-US": "reading comprehension" },
    description: {
      "en-US": "Reading comprehension exercise.",
    },
  },
  SPACED_REPETITION_SESSION: {
    id: ACTIVITY_TYPES.SPACED_REPETITION_SESSION,
    display: {
      "en-US": "spaced repetition session",
    },
    description: {
      "en-US": "Spaced repetition review session.",
    },
  },
} as const;

// ============================================================
// Activity Type Labels
// ============================================================

/**
 * Human-readable labels keyed by activity type IRI.
 */
export const ACTIVITY_TYPE_LABELS: Readonly<
  Record<ActivityTypeId, string>
> = {
  [ACTIVITY_TYPES.COURSE]: "Course",
  [ACTIVITY_TYPES.MODULE]: "Module",
  [ACTIVITY_TYPES.LESSON]: "Lesson",
  [ACTIVITY_TYPES.OBJECTIVE]: "Objective",
  [ACTIVITY_TYPES.ASSESSMENT]: "Assessment",
  [ACTIVITY_TYPES.QUESTION]: "Question",
  [ACTIVITY_TYPES.INTERACTION]: "Interaction",
  [ACTIVITY_TYPES.CONTENT]: "Content",
  [ACTIVITY_TYPES.FILE]: "File",
  [ACTIVITY_TYPES.LINK]: "Link",
  [ACTIVITY_TYPES.ARTICLE]: "Article",
  [ACTIVITY_TYPES.VIDEO]: "Video",
  [ACTIVITY_TYPES.AUDIO]: "Audio",
  [ACTIVITY_TYPES.VOCABULARY_DRILL]:
    "Vocabulary Drill",
  [ACTIVITY_TYPES.CHARACTER_RECOGNITION]:
    "Character Recognition",
  [ACTIVITY_TYPES.PRONUNCIATION_PRACTICE]:
    "Pronunciation Practice",
  [ACTIVITY_TYPES.DIALOGUE_PRACTICE]:
    "Dialogue Practice",
  [ACTIVITY_TYPES.GRAMMAR_EXERCISE]:
    "Grammar Exercise",
  [ACTIVITY_TYPES.CLOZE_TEST]: "Cloze Test",
  [ACTIVITY_TYPES.TRANSLATION_EXERCISE]:
    "Translation Exercise",
  [ACTIVITY_TYPES.FLASHCARD_DECK]: "Flashcard Deck",
  [ACTIVITY_TYPES.FLASHCARD]: "Flashcard",
  [ACTIVITY_TYPES.LISTENING_COMPREHENSION]:
    "Listening Comprehension",
  [ACTIVITY_TYPES.READING_COMPREHENSION]:
    "Reading Comprehension",
  [ACTIVITY_TYPES.SPACED_REPETITION_SESSION]:
    "Spaced Repetition Session",
} as const;

/**
 * Get a human-readable label for an activity type.
 */
export function getActivityTypeLabel(
  typeId: ActivityTypeId
): string {
  return (
    ACTIVITY_TYPE_LABELS[typeId] ??
    typeId.split("/").pop() ??
    "Unknown"
  );
}
