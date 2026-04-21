/**
 * Word List Types
 *
 * Standardized types for word lists that can be used across all language packages.
 * These types support CEFR-aligned vocabulary organization with difficulty levels,
 * exam grades, and categorical organization.
 */

import type { Transcription } from '@syllst/core/types';

/**
 * Word list difficulty levels
 */
export type WordListDifficulty = "beginner" | "intermediate" | "advanced";

/**
 * Exam grade levels (CEFR - Common European Framework of Reference for Languages)
 * Pre-A1 is for absolute beginners before reaching A1 level
 */
export type ExamGrade = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * Transcription scheme identifier
 * Language-specific schemes (e.g., "paiboon+", "rtgs", "ipa", "aua" for Thai;
 * "ipa", "simplified" for French; "iast", "iso15919" for Hindi)
 */
export type TranscriptionScheme = string;

/**
 * Word list item with metadata
 *
 * Note: This is a flat data structure for JSON word lists, distinct from
 * WordListItemNode in @syllst/core which extends UnistLiteral for AST usage.
 */
export type WordListItem = {
  /** Unique word ID (e.g., "th:vocab:greetings:hello") */
  id?: string;
  /** The word in the target language script */
  word: string;
  /** English translation/meaning */
  translation?: string;
  /** Romanized transliteration (simple string format) */
  transliteration?: string;
  /**
   * Transcription/pronunciation (supports multiple schemes)
   * Uses Transcription type from @syllst/core
   */
  transcription?: Transcription;
  /** IPA pronunciation (deprecated, use transcription instead) */
  ipa?: string;
  /** Part of speech (noun, verb, adjective, etc.) */
  partOfSpeech?: string;
  /** Example sentence using the word */
  example?: string;
  /** Example sentence using the word (alias for example) */
  exampleSentence?: string;
  /** Additional notes about usage */
  notes?: string;
  /** Difficulty level */
  difficulty?: WordListDifficulty;
  /** CEFR exam grade */
  examGrade?: ExamGrade;
  /** Thematic category */
  category?: string;
  /** Subcategory within category */
  subcategory?: string;
  /** Additional tags for filtering */
  tags?: string[];
  /** Level (CEFR) - for JSON compatibility */
  level?: string;
  /** Category - for JSON compatibility */
  cat?: string;

  // Optional concept linking (extensibility)
  /** CILI concept ID for cross-language linking (e.g., "i115069") */
  ciliId?: string;
  /** WordNet synset ID */
  synsetId?: string;

  // Optional content linking (extensibility)
  /** Lesson IDs that teach this word */
  usedInLessons?: string[];
  /** Story IDs that contain this word */
  usedInStories?: string[];

  // Optional metadata for better filtering
  /** Frequency rank (lower = more common) */
  frequency?: number;
};

/**
 * Word list set definition - a themed collection of words
 *
 * Note: This is a flat data structure for JSON word lists, distinct from
 * WordListSetNode in @syllst/core which extends UnistParent for AST usage.
 */
export type WordListSet = {
  /** Unique identifier for the set */
  id: string;
  /** Display name of the set */
  name: string;
  /** Description of the set contents */
  description?: string;
  /** Overall difficulty of the set */
  difficulty?: WordListDifficulty;
  /** CEFR exam grade alignment */
  examGrade?: ExamGrade;
  /** Top-level category */
  category?: string;
  /** Subcategory within the category */
  subcategory?: string;
  /** Words in this set */
  words: WordListItem[];
};

/**
 * Standard categories for word list organization
 * Languages can use these or define their own
 */
export const STANDARD_WORD_LIST_CATEGORIES = [
  "greetings",
  "numbers",
  "colors",
  "family",
  "food",
  "body",
  "time",
  "places",
  "verbs",
  "adjectives",
  "activities",
  "travel",
  "shopping",
  "weather",
  "emotions",
  "clothing",
  "animals",
  "sports",
  "education",
  "health",
  "work",
  "technology",
  "housing",
  "transportation",
  "entertainment",
  "relationships",
  "nature",
  "communication",
  "business",
  "politics",
  "media",
  "arts",
  "science",
  "academic",
  "legal",
  "literature",
  "philosophy",
  "economics",
  "psychology",
  "sociology",
  "formal",
  "idioms",
  "abstract",
] as const;

export type StandardWordListCategory =
  (typeof STANDARD_WORD_LIST_CATEGORIES)[number];
