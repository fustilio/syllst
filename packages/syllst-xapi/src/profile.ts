/**
 * @syllst/xapi - JSON-LD Profile Document
 *
 * Formal xAPI profile specification for the syllst
 * language learning profile. Only includes concepts
 * **defined** by this profile (new verbs, activity
 * types, and extensions). Standard verbs/types are
 * referenced but not redefined.
 *
 * @see https://adlnet.github.io/xapi-profiles/xapi-profiles-structure.html
 */

import { SYLLST_XAPI_NAMESPACE } from "./types.js";
import { VERBS } from "./verbs.js";
import { ACTIVITY_TYPES } from "./activity-types.js";
import { EXTENSIONS } from "./extensions.js";

const VERSION_ID =
  `${SYLLST_XAPI_NAMESPACE}profile/v/0.1.0`;

/**
 * The syllst language learning xAPI profile
 * as a JSON-LD document.
 */
export const SYLLST_XAPI_PROFILE = {
  "@context":
    "https://w3id.org/xapi/profiles/context",
  id: `${SYLLST_XAPI_NAMESPACE}profile`,
  type: "Profile" as const,
  conformsTo:
    "https://w3id.org/xapi/profiles#1.0",
  prefLabel: {
    "en-US":
      "Syllst Language Learning xAPI Profile",
  },
  definition: {
    "en-US":
      "An xAPI profile for tracking language " +
      "learning activities including vocabulary " +
      "drills, character recognition, " +
      "pronunciation practice, dialogue practice, " +
      "and spaced repetition. Extends cmi5.",
  },
  seeAlso: "https://syllst.dev",
  versions: [
    {
      id: VERSION_ID,
      generatedAtTime: "2026-01-29T00:00:00Z",
    },
  ],
  author: {
    type: "Organization" as const,
    name: "Syllst",
    url: "https://syllst.dev",
  },
  concepts: [
    // ==============================================
    // New Verbs
    // ==============================================
    {
      id: VERBS.TRANSCRIBED,
      type: "Verb" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "transcribed" },
      definition: {
        "en-US":
          "The learner transcribed speech or " +
          "text from one writing system to another.",
      },
    },
    {
      id: VERBS.PRONOUNCED,
      type: "Verb" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "pronounced" },
      definition: {
        "en-US":
          "The learner vocalized or pronounced " +
          "a word or phrase.",
      },
    },
    {
      id: VERBS.TRANSLATED,
      type: "Verb" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "translated" },
      definition: {
        "en-US":
          "The learner translated text between " +
          "languages.",
      },
    },
    {
      id: VERBS.PRACTICED,
      type: "Verb" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "practiced" },
      definition: {
        "en-US":
          "The learner engaged in deliberate " +
          "practice of a language skill.",
      },
    },
    {
      id: VERBS.DRILLED,
      type: "Verb" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "drilled" },
      definition: {
        "en-US":
          "The learner completed repetitive " +
          "practice exercises.",
      },
    },

    // ==============================================
    // New Activity Types
    // ==============================================
    {
      id: ACTIVITY_TYPES.VOCABULARY_DRILL,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "vocabulary drill" },
      definition: {
        "en-US":
          "A vocabulary practice activity.",
      },
    },
    {
      id: ACTIVITY_TYPES.CHARACTER_RECOGNITION,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "character recognition",
      },
      definition: {
        "en-US":
          "A character or alphabet " +
          "identification activity.",
      },
    },
    {
      id: ACTIVITY_TYPES.PRONUNCIATION_PRACTICE,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "pronunciation practice",
      },
      definition: {
        "en-US": "A pronunciation exercise.",
      },
    },
    {
      id: ACTIVITY_TYPES.DIALOGUE_PRACTICE,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "dialogue practice",
      },
      definition: {
        "en-US":
          "A conversation practice activity.",
      },
    },
    {
      id: ACTIVITY_TYPES.GRAMMAR_EXERCISE,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "grammar exercise" },
      definition: {
        "en-US": "A grammar drill or exercise.",
      },
    },
    {
      id: ACTIVITY_TYPES.CLOZE_TEST,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "cloze test" },
      definition: {
        "en-US":
          "A fill-in-the-blank exercise.",
      },
    },
    {
      id: ACTIVITY_TYPES.TRANSLATION_EXERCISE,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "translation exercise",
      },
      definition: {
        "en-US":
          "A translation task between languages.",
      },
    },
    {
      id: ACTIVITY_TYPES.FLASHCARD_DECK,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "flashcard deck" },
      definition: {
        "en-US": "A collection of flashcards.",
      },
    },
    {
      id: ACTIVITY_TYPES.FLASHCARD,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "flashcard" },
      definition: {
        "en-US": "An individual flashcard item.",
      },
    },
    {
      id: ACTIVITY_TYPES.LISTENING_COMPREHENSION,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "listening comprehension",
      },
      definition: {
        "en-US":
          "A listening comprehension exercise.",
      },
    },
    {
      id: ACTIVITY_TYPES.READING_COMPREHENSION,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "reading comprehension",
      },
      definition: {
        "en-US":
          "A reading comprehension exercise.",
      },
    },
    {
      id: ACTIVITY_TYPES.SPACED_REPETITION_SESSION,
      type: "ActivityType" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "spaced repetition session",
      },
      definition: {
        "en-US":
          "A spaced repetition review session.",
      },
    },

    // ==============================================
    // Context Extensions
    // ==============================================
    {
      id: EXTENSIONS.TARGET_LANGUAGE,
      type: "ContextExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "target language" },
      definition: {
        "en-US":
          "BCP 47 code of the language being " +
          "learned (e.g. 'th', 'ja', 'ko').",
      },
      inlineSchema: '{ "type": "string" }',
    },
    {
      id: EXTENSIONS.SOURCE_LANGUAGE,
      type: "ContextExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "source language" },
      definition: {
        "en-US":
          "BCP 47 code of the learner's native " +
          "or source language.",
      },
      inlineSchema: '{ "type": "string" }',
    },
    {
      id: EXTENSIONS.CEFR_LEVEL,
      type: "ContextExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "CEFR level" },
      definition: {
        "en-US":
          "CEFR proficiency level " +
          "(A1, A2, B1, B2, C1, C2).",
      },
      inlineSchema:
        '{ "type": "string", "enum": ' +
        '["A1","A2","B1","B2","C1","C2"] }',
    },
    {
      id: EXTENSIONS.TRANSCRIPTION_SYSTEM,
      type: "ContextExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "transcription system",
      },
      definition: {
        "en-US":
          "Transcription system used " +
          "(e.g. 'ipa', 'paiboon', 'rtgs').",
      },
      inlineSchema: '{ "type": "string" }',
    },

    // ==============================================
    // Result Extensions
    // ==============================================
    {
      id: EXTENSIONS.PRONUNCIATION_ACCURACY,
      type: "ResultExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "pronunciation accuracy",
      },
      definition: {
        "en-US":
          "Pronunciation accuracy score (0-1).",
      },
      inlineSchema:
        '{ "type": "number", ' +
        '"minimum": 0, "maximum": 1 }',
    },
    {
      id: EXTENSIONS.TRANSCRIPTION_ACCURACY,
      type: "ResultExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: {
        "en-US": "transcription accuracy",
      },
      definition: {
        "en-US":
          "Transcription accuracy score (0-1).",
      },
      inlineSchema:
        '{ "type": "number", ' +
        '"minimum": 0, "maximum": 1 }',
    },

    // ==============================================
    // Activity Extensions
    // ==============================================
    {
      id: EXTENSIONS.TARGET_WORD,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "target word" },
      definition: {
        "en-US":
          "The word or character being practiced.",
      },
      inlineSchema:
        '{ "type": "string", "minLength": 1 }',
    },
    {
      id: EXTENSIONS.TRANSCRIPTION,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "transcription" },
      definition: {
        "en-US": "Pronunciation guide text.",
      },
      inlineSchema:
        '{ "type": "string", "minLength": 1 }',
    },
    {
      id: EXTENSIONS.TRANSLATION,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "translation" },
      definition: {
        "en-US":
          "Meaning in the learner's source " +
          "language.",
      },
      inlineSchema:
        '{ "type": "string", "minLength": 1 }',
    },
    {
      id: EXTENSIONS.WORD_CLASS,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "word class" },
      definition: {
        "en-US":
          "Part of speech (noun, verb, etc.).",
      },
      inlineSchema:
        '{ "type": "string", "minLength": 1 }',
    },
    {
      id: EXTENSIONS.CHARACTER_TYPE,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "character type" },
      definition: {
        "en-US":
          "Character classification " +
          "(consonant, vowel, tone-mark).",
      },
      inlineSchema:
        '{ "type": "string", "enum": ' +
        '["consonant","vowel","tone-mark"] }',
    },
    {
      id: EXTENSIONS.DIFFICULTY,
      type: "ActivityExtension" as const,
      inScheme: VERSION_ID,
      prefLabel: { "en-US": "difficulty" },
      definition: {
        "en-US":
          "Difficulty level " +
          "(beginner, intermediate, advanced).",
      },
      inlineSchema:
        '{ "type": "string", "enum": ' +
        '["beginner","intermediate","advanced"] }',
    },
  ],
} as const;
