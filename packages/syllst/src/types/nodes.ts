/**
 * Syllabus Unist Schema
 *
 * Unist-based syntax tree for representing language learning syllabi.
 * Based on https://github.com/syntax-tree/unist specification.
 *
 * This schema is language-agnostic and supports multiple syllabi per language.
 */

import type { Node as UnistNode, Parent as UnistParent, Literal as UnistLiteral, Data, Position } from 'unist';
import type { ExtensionsMap } from './extensions';

// ============================================================================
// Core Unist Types (re-exported for convenience)
// ============================================================================

export type { Data, Position };
export type { ExtensionsMap, NodeExtension } from './extensions';

// ============================================================================
// Transcription Types (v0.2.0)
// ============================================================================

/**
 * Transcription object for multiple transcription systems
 *
 * @example
 * ```typescript
 * // Simple string
 * transcription: "khâao"
 *
 * // Multiple systems
 * transcription: {
 *   primary: "khâao",
 *   ipa: "/kʰâːw/",
 *   rtgs: "khao"
 * }
 * ```
 */
export interface TranscriptionObject {
  /** Primary/default transcription */
  primary: string;
  /** IPA (International Phonetic Alphabet) */
  ipa?: string;
  /** Additional transcription systems (rtgs, paiboon, pinyin, hepburn, etc.) */
  [system: string]: string | undefined;
}

/**
 * Transcription type - simple string or object with multiple systems
 */
export type Transcription = string | TranscriptionObject;

// ============================================================================
// Syllabus-Specific Node Types
// ============================================================================

/**
 * CEFR (Common European Framework of Reference) levels
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Difficulty levels for lessons and exercises
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
/** @deprecated Use DifficultyLevel */
export type GrammarDifficulty = DifficultyLevel;

/**
 * Progression rule
 * Defines when a learner can proceed to the next lesson
 */
export type ProgressionRule =
  | 'Passed'             // Must pass (meet mastery threshold)
  | 'Completed'          // Must complete (finish all content)
  | 'CompletedAndPassed' // Must both complete and pass
  | 'NotApplicable';     // No restrictions

/**
 * Completion criteria
 * Defines what must be achieved for a lesson to be considered complete
 */
export interface CompletionCriteria {
  /** Required mastery score (0-1) for overall lesson completion */
  masteryScore?: number;
  /** Required percentage of objectives to be mastered */
  masteryPercentage?: number;
  /** Minimum number of objectives that must be mastered */
  minMasteredCount?: number;
  /** Whether all exercises must be completed */
  requireAllExercises?: boolean;
  /** Whether all content must be viewed */
  requireAllContent?: boolean;
}

/**
 * Learning objective
 * Structured objective with tracking criteria
 */
export interface LearningObjective {
  /** Objective ID */
  id: string;
  /** Objective description */
  description: string;
  /** Required mastery score (0-1) for this objective */
  masteryScore?: number;
  /** Whether this is a primary objective */
  isPrimary?: boolean;
  /** Skill category this objective targets (e.g., 'character-recognition', 'tone-rule-application') */
  skill?: string;
  /** References to specific trackable items (canonical IDs from @laeng packages, grammar rule IDs, etc.) */
  references?: string[];
}

/**
 * Source information for a syllabus
 */
export interface SyllabusSourceInfo {
  /** Title of the source material */
  title: string;
  /** URL to the source (if available) */
  url?: string;
  /** PDF URL (if available) */
  pdfUrl?: string;
  /** Authors of the source material */
  authors?: string[];
  /** Publication year */
  year?: number;
  /** Publisher */
  publisher?: string;
}

/**
 * Root node of a syllabus tree
 *
 * Represents a complete language learning syllabus/course.
 * Each language package can contain multiple syllabi (different courses).
 */
export interface SyllabusRoot extends UnistParent {
  type: 'syllabusRoot';
  /** Metadata about the syllabus */
  meta: {
    /** Unique ID for this syllabus */
    id: string;
    /** Title of the syllabus/course */
    title: string;
    /** Language code (ISO 639-1, e.g., 'hi', 'th', 'ka') */
    language: string;
    /** Source information */
    source: SyllabusSourceInfo;
    /** Schema version */
    version: string;
    /** When this syllabus was created/extracted */
    extractedAt: string; // ISO 8601 timestamp
    /** Additional metadata */
    [key: string]: unknown;
  };
  /** Child nodes (chapters and metadata) */
  children: (ChapterNode | MetadataNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Chapter node
 *
 * Top-level organizational unit (e.g., "Foundation", "Advanced Grammar")
 */
export interface ChapterNode extends UnistParent {
  type: 'chapter';
  /** Unique ID within the syllabus */
  id: string;
  /** Chapter title */
  title: string;
  /** Chapter description */
  description?: string;
  /** Order within syllabus */
  order: number;
  /** Difficulty level */
  difficulty?: GrammarDifficulty;
  /** CEFR level(s) covered */
  cefrLevel?: CEFRLevel | CEFRLevel[];
  /** Grammar/topic categories covered */
  categories?: string[];
  /** Child nodes */
  children: (SectionNode | LessonAstNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Section node
 *
 * Mid-level organizational unit within a chapter
 */
export interface SectionNode extends UnistParent {
  type: 'section';
  /** Unique ID within the syllabus */
  id: string;
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Order within parent */
  order: number;
  /** Parent chapter/section ID */
  parentId?: string;
  /** Difficulty level */
  difficulty?: GrammarDifficulty;
  /** CEFR level(s) covered */
  cefrLevel?: CEFRLevel | CEFRLevel[];
  /** Grammar/topic categories covered */
  categories?: string[];
  /** Child nodes */
  children: (SectionNode | LessonAstNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Lesson metadata
 */
export interface LessonMetadata {
  /** Page number in original source */
  pageNumber?: number;
  /** Section number in original source */
  sectionNumber?: string;
  /** Estimated time to complete (minutes) */
  estimatedTime?: number;
  /** Prerequisite lesson IDs */
  prerequisites?: string[];
  /** Learning objectives (legacy: string array) */
  objectives?: string[];
  /** Structured learning objectives */
  learningObjectives?: LearningObjective[];
  /** Key takeaways */
  takeaways?: string[];
  /** Cultural notes */
  culturalNotes?: string;
  /** Additional notes */
  notes?: string;
  /** Original source file path (for reference) */
  sourceFile?: string;
  /** Completion criteria */
  completionCriteria?: CompletionCriteria;
  /** Progression rule — when a learner can proceed to the next lesson */
  progressionRule?: ProgressionRule;
  /** Default mastery score for objectives in this lesson (0-1) */
  defaultMasteryScore?: number;
}

/**
 * Lesson AST node (Unist)
 *
 * Individual lesson/unit containing learning content.
 */
export interface LessonAstNode extends UnistParent {
  type: 'lesson';
  /** Unique ID within the syllabus */
  id: string;
  /** Lesson title */
  title: string;
  /** Lesson description */
  description?: string;
  /** Order within parent */
  order: number;
  /** Parent chapter/section ID */
  parentId?: string;
  /** Difficulty level */
  difficulty?: GrammarDifficulty;
  /** CEFR level(s) covered */
  cefrLevel?: CEFRLevel | CEFRLevel[];
  /** Grammar/topic categories covered */
  categories?: string[];
  /** Lesson metadata */
  metadata?: LessonMetadata;
  /** Child nodes (grammar rules, vocabulary, characters, examples, exercises, dialogues, phonological rules, patterns) */
  children: (
    | GrammarRuleNode
    | VocabularySetNode
    | CharacterSetNode
    | ExampleSetNode
    | ExerciseNode
    | ContentNode
    | DialogueNode
    | PhonologicalRuleNode
    | SyllablePatternNode
    | WritingPatternNode
  )[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Grammar rule node
 *
 * Explains a grammatical concept
 */
export interface GrammarRuleNode extends UnistParent {
  type: 'grammarRule';
  /** Unique ID within the syllabus */
  id: string;
  /** Rule title/name */
  title: string;
  /** Detailed explanation */
  explanation: string;
  /** Exceptions or special cases */
  exceptions?: string;
  /** IDs of related grammar rules */
  relatedRules?: string[];
  /** Common mistakes to avoid */
  commonMistakes?: string[];
  /** Child nodes (examples, sub-rules) */
  children: (ExampleNode | GrammarRuleNode | ContentNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Vocabulary set node
 *
 * Collection of related vocabulary items
 */
export interface VocabularySetNode extends UnistParent {
  type: 'vocabularySet';
  /** Unique ID within the syllabus */
  id: string;
  /** Set title (e.g., "Family Members", "Greetings") */
  title?: string;
  /** Set description */
  description?: string;
  /** Child vocabulary items */
  children: VocabularyItemNode[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Vocabulary item node
 *
 * Individual word/phrase with translation and metadata
 */
export interface VocabularyItemNode extends UnistLiteral {
  type: 'vocabularyItem';
  /** Unique ID within the syllabus */
  id: string;
  /** Word/phrase in target language */
  word: string;
  /**
   * Transcription/pronunciation
   * Can be a simple string or object with multiple transcription systems
   */
  transcription?: Transcription;
  /** Translation in learner's language */
  translation: string;
  /** Longer explanation/definition */
  definition?: string;
  /** Display text for cards/previews */
  preview?: string;
  /** Category for filtering */
  category?: string;
  /** Tags for discovery */
  tags?: string[];
  /** Part of speech */
  partOfSpeech?: string;
  /** Usage notes */
  notes?: string;
  /** Example sentence */
  example?: string;
  /** IDs of related vocabulary items */
  related?: string[];
  /** The value (same as word for compatibility) */
  value: string;
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data (language-specific extensions go here) */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

// ============================================================================
// Character/Alphabet Nodes (for script learning)
// ============================================================================

/**
 * Character types for alphabet/script learning
 *
 * Core types cover most writing systems. Use `string` escape hatch
 * for language-specific character categories not listed here.
 *
 * @example
 * - Thai: 'consonant', 'vowel', 'tone-mark', 'number', 'symbol'
 * - Japanese: 'consonant', 'vowel', 'syllable-block' (kana), 'logograph' (kanji)
 * - Korean: 'consonant', 'vowel', 'syllable-block' (jamo → syllable)
 * - Chinese: 'logograph', 'radical'
 * - Arabic/Hebrew: 'consonant', 'vowel', 'diacritic'
 */
export type CharacterType =
  | 'consonant'
  | 'vowel'
  | 'tone-mark'
  | 'number'
  | 'symbol'
  | 'diacritic'
  | 'modifier'
  | 'punctuation'
  | 'radical'
  | 'logograph'
  | 'syllable-block'
  | (string & {}); // escape hatch for unlisted types

/**
 * Phonetic categories for consonants
 */
export type PhoneticCategory =
  | 'stop'
  | 'fricative'
  | 'affricate'
  | 'nasal'
  | 'liquid'
  | 'approximant'
  | 'trill';

/**
 * Voicing types for consonants
 */
export type VoicingType = 'voiced' | 'voiceless' | 'ejective' | 'aspirated';

/**
 * Character mnemonic for memory aids
 */
export interface CharacterMnemonic {
  /** Mnemonic text */
  text: string;
  /** Optional image URL for mnemonic */
  imageUrl?: string;
  /** Association word in learner's language */
  association?: string;
}

/**
 * Character set node
 *
 * Collection of characters for alphabet/script learning.
 * Analogous to VocabularySetNode but for individual characters.
 */
export interface CharacterSetNode extends UnistParent {
  type: 'characterSet';
  /** Unique ID within the syllabus */
  id: string;
  /** Set title (e.g., "Basic Vowels", "Aspirated Consonants") */
  title?: string;
  /** Set description */
  description?: string;
  /** Filter by character type */
  charType?: CharacterType;
  /** Filter by phonetic category */
  phoneticCategory?: PhoneticCategory;
  /** Child character items */
  children: CharacterItemNode[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Character item node
 *
 * Individual character/letter with pronunciation and metadata.
 * Used for alphabet/script learning systems.
 */
export interface CharacterItemNode extends UnistLiteral {
  type: 'characterItem';
  /** Unique ID within the syllabus */
  id: string;
  /** The character/letter itself (e.g., "ა", "ก", "अ") */
  char: string;
  /** Name of the character (romanized, e.g., "Ani", "Ko Kai") */
  name: string;
  /** Name in native script (e.g., "ანი", "กอไก่") */
  nativeName?: string;
  /**
   * Transcription/pronunciation
   * Can be a simple string or object with multiple transcription systems
   */
  transcription?: Transcription;
  /** Character type */
  charType: CharacterType;
  /** Display text for cards/previews */
  preview?: string;
  /** Category for filtering */
  category?: string;
  /** Tags for discovery */
  tags?: string[];
  /** Memory aid/mnemonic */
  mnemonic?: CharacterMnemonic | string;
  /** Example words using this character */
  exampleWords?: string[];
  /** Historical/variant forms (e.g., Asomtavruli for Georgian) */
  variants?: {
    /** Variant name */
    name: string;
    /** Variant character form */
    form: string;
  }[];
  /** Usage notes */
  notes?: string;
  /** Audio file path for pronunciation */
  audioPath?: string;
  /**
   * Reference to canonical character ID from @laeng packages.
   * Enables cross-package linking between lesson content and character data.
   * @example "chicken" (references @laeng/th canonical ID for ก)
   */
  canonicalRef?: string;
  /** The value (same as char for Unist Literal compatibility) */
  value: string;
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data (language-specific extensions go here) */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Example set node
 *
 * Collection of example sentences
 */
export interface ExampleSetNode extends UnistParent {
  type: 'exampleSet';
  /** Unique ID within the syllabus */
  id: string;
  /** Set title */
  title?: string;
  /** Set description */
  description?: string;
  /** Child examples */
  children: ExampleNode[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Example node
 *
 * Example sentence demonstrating language usage
 */
export interface ExampleNode extends UnistLiteral {
  type: 'example';
  /** Unique ID within the syllabus */
  id: string;
  /** Text in target language */
  text: string;
  /**
   * Transcription/pronunciation of the example
   * Can be a simple string or object with multiple transcription systems
   */
  transcription?: Transcription;
  /** Translation in learner's language */
  translation: string;
  /** Word-by-word gloss */
  literalTranslation?: string;
  /** Usage notes */
  notes?: string;
  /** IDs of grammar rules this illustrates */
  illustrates?: string[];
  /** The value (same as text for compatibility) */
  value: string;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Exercise types
 */
export type ExerciseType =
  | 'fill-in-blank'
  | 'multiple-choice'
  | 'translation'
  | 'transformation'
  | 'matching'
  | 'true-false'
  | 'open-ended'
  | 'pattern-practice'
  | 'dialogue';

// ============================================================================
// Dialogue Nodes (for structured conversation content)
// ============================================================================

/**
 * Participant in a dialogue
 */
export interface DialogueParticipant {
  /** Speaker ID (e.g., "me", "shopkeeper", "teacher") */
  id: string;
  /** Display name */
  name?: string;
  /** Gender for gendered language particles */
  gender?: 'masculine' | 'feminine' | 'neutral';
  /** Role description */
  role?: string;
}

/**
 * Gender variants for text with gender-specific particles
 * (e.g., Thai ครับ/ค่ะ, Japanese です/ですわ)
 */
export interface GenderVariants {
  /** Text with masculine particles */
  masculine: string;
  /** Text with feminine particles */
  feminine: string;
  /** Gender-neutral alternative (if available) */
  neutral?: string;
}

/**
 * Dialogue turn node
 *
 * Represents a single speaker's utterance in a dialogue.
 * Can contain either plain text or GLOST sentences for full GLOST integration.
 */
export interface DialogueTurnNode extends UnistLiteral {
  type: 'dialogueTurn';
  /** Speaker ID (references DialogueParticipant.id) */
  speakerId: string;
  /** Original text (may contain {masculine|feminine} syntax) */
  text: string;
  /** Pre-parsed gender variants */
  genderVariants?: GenderVariants;
  /**
   * Transcription/pronunciation of the dialogue turn
   * Can be a simple string or object with multiple transcription systems
   */
  transcription?: Transcription;
  /** Translation in learner's language */
  translation: string;
  /**
   * GLOST sentences for this turn (when using full GLOST integration)
   * Type is `unknown[]` to avoid core dependency on GLOST types.
   * Use `@syllst/glost` (future) for type-safe GLOST integration.
   * @see https://github.com/fustilio/glost for GLOST specification
   */
  glostSentences?: unknown[];
  /** The value (same as text for Unist Literal compatibility) */
  value: string;
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Dialogue node
 *
 * Contains a complete dialogue/conversation with participants and turns.
 * Used for structured conversation practice in lessons.
 */
export interface DialogueNode extends UnistParent {
  type: 'dialogue';
  /** Unique ID within the syllabus */
  id: string;
  /** Participants in this dialogue */
  participants: DialogueParticipant[];
  /** Dialogue context (e.g., "shopping", "greeting", "restaurant") */
  context?: string;
  /** Cultural notes about the dialogue */
  culturalNotes?: string;
  /** Language code (e.g., "th-TH", "ja-JP") */
  lang?: string;
  /** Child turns */
  children: DialogueTurnNode[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Structured exercise item for fill-in-blank, transformation, dialogue, etc.
 */
export interface ExerciseItem {
  /** Question/prompt for this item */
  question: string;
  /** Expected answer for this item */
  answer: string;
  /** Optional hint for this item */
  hint?: string;
}

// ============================================================================
// Exercise Node — Discriminated Union (v0.4.0)
// ============================================================================

/**
 * Common fields shared by all exercise types.
 * Extends UnistParent to maintain Unist compatibility.
 * Not exported as a standalone type — use ExerciseNode union.
 */
interface BaseExerciseFields extends UnistParent {
  type: 'exercise';
  /** Unique ID within the syllabus */
  id: string;
  /** Exercise title */
  title?: string;
  /** Instructions/prompt (overall directions) */
  question: string;
  /** Explanation of the answer */
  explanation?: string;
  /** Difficulty level */
  difficulty?: GrammarDifficulty;
  /**
   * Skill category this exercise tests.
   * @example 'character-recognition', 'tone-rule-application', 'vocabulary-recall'
   */
  skill?: string;
  /**
   * IDs of specific items this exercise tests (canonical character refs, vocab IDs, rule IDs).
   * Enables granular tracking of which items a learner has practiced.
   */
  tests?: string[];
  /**
   * ID of the learning objective this exercise maps to.
   * References a LearningObjective.id from the lesson's metadata.
   */
  objectiveId?: string;
  /** Child nodes (additional content) */
  children: ContentNode[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Multiple-choice exercise.
 * Options are required (at least 2). Answer must be a string
 * matching one of the options.
 */
export interface MultipleChoiceExercise extends BaseExerciseFields {
  exerciseType: 'multiple-choice';
  /** Available choices (at least 2) */
  options: string[];
  /** Correct answer — must match one of `options` */
  answer: string;
  /** Structured exercise items (optional) */
  items?: ExerciseItem[];
}

/**
 * Matching exercise.
 * Items are required (at least 2 pairs).
 */
export interface MatchingExercise extends BaseExerciseFields {
  exerciseType: 'matching';
  /** Matching pairs (at least 2) */
  items: ExerciseItem[];
  /** Correct answer(s) */
  answer: string | string[];
  /** Options (for distractor pool, optional) */
  options?: string[];
}

/**
 * Fill-in-blank exercise.
 */
export interface FillInBlankExercise extends BaseExerciseFields {
  exerciseType: 'fill-in-blank';
  /** Structured exercise items */
  items?: ExerciseItem[];
  /** Correct answer(s) */
  answer: string | string[];
  /** Options (word bank, optional) */
  options?: string[];
}

/**
 * True-false exercise.
 * Answer must be "true" or "false".
 */
export interface TrueFalseExercise extends BaseExerciseFields {
  exerciseType: 'true-false';
  /** Correct answer — must be "true" or "false" */
  answer: string;
  /** Structured exercise items (optional) */
  items?: ExerciseItem[];
  /** Options (typically ["true", "false"]) */
  options?: string[];
}

/**
 * Translation exercise.
 */
export interface TranslationExercise extends BaseExerciseFields {
  exerciseType: 'translation';
  /** Correct answer(s) — may have multiple acceptable translations */
  answer: string | string[];
  /** Structured exercise items */
  items?: ExerciseItem[];
  /** Options (optional word bank) */
  options?: string[];
}

/**
 * Transformation exercise.
 * Items are required (at least 1).
 */
export interface TransformationExercise extends BaseExerciseFields {
  exerciseType: 'transformation';
  /** Transformation pairs (at least 1) */
  items: ExerciseItem[];
  /** Correct answer(s) */
  answer: string | string[];
  /** Options (optional) */
  options?: string[];
}

/**
 * Pattern-practice exercise.
 * Items are required (at least 1).
 */
export interface PatternPracticeExercise extends BaseExerciseFields {
  exerciseType: 'pattern-practice';
  /** Pattern practice items (at least 1) */
  items: ExerciseItem[];
  /** Correct answer(s) */
  answer: string | string[];
  /** Options (optional) */
  options?: string[];
}

/**
 * Dialogue exercise.
 * Items are required (at least 1 dialogue turn).
 */
export interface DialogueExercise extends BaseExerciseFields {
  exerciseType: 'dialogue';
  /** Dialogue turns (at least 1) */
  items: ExerciseItem[];
  /** Answer(s) */
  answer: string | string[];
  /** Options (optional) */
  options?: string[];
}

/**
 * Open-ended exercise.
 * Minimal constraints — answer is optional (may be a model response).
 */
export interface OpenEndedExercise extends BaseExerciseFields {
  exerciseType: 'open-ended';
  /** Model answer(s) — optional for open-ended */
  answer?: string | string[];
  /** Structured exercise items */
  items?: ExerciseItem[];
  /** Options (optional) */
  options?: string[];
}

/**
 * Exercise node — discriminated union of all exercise types.
 *
 * The `exerciseType` field acts as the discriminator.
 * Use per-type interfaces (e.g., MultipleChoiceExercise) for
 * type-narrowed access to exercise-specific fields.
 *
 * @example
 * ```typescript
 * if (exercise.exerciseType === 'multiple-choice') {
 *   // TypeScript knows exercise.options is string[] (not optional)
 *   console.log(exercise.options.length);
 * }
 * ```
 */
export type ExerciseNode =
  | MultipleChoiceExercise
  | MatchingExercise
  | FillInBlankExercise
  | TrueFalseExercise
  | TranslationExercise
  | TransformationExercise
  | PatternPracticeExercise
  | DialogueExercise
  | OpenEndedExercise;

/**
 * Content formats
 */
export type ContentFormat = 'markdown' | 'text' | 'html' | 'glost' | 'glost-dialogue';

/**
 * Content node
 *
 * Generic content block (markdown, text, HTML, or GLOST)
 */
export interface ContentNode extends UnistLiteral {
  type: 'content';
  /** Content format */
  format: ContentFormat;
  /** Content value */
  value: string;
  /** Optional reference to GLOST document ID (for format: 'glost' | 'glost-dialogue') */
  ref?: string;
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Metadata node
 *
 * Generic metadata key-value pair
 */
export interface MetadataNode extends UnistLiteral {
  type: 'metadata';
  /** Metadata key */
  key: string;
  /** Metadata value */
  value: unknown;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

// ============================================================================
// Phonological Rule Nodes (v0.3.0 — for tone rules, sound changes, etc.)
// ============================================================================

/**
 * Types of phonological rules
 *
 * Language-agnostic categories covering common phonological phenomena:
 * - 'tone': Tone determination rules (Thai, Chinese, Vietnamese)
 * - 'sound-change': Consonant/vowel changes in context (final consonant merging, etc.)
 * - 'assimilation': Sounds becoming similar to neighboring sounds
 * - 'elision': Sound deletion in connected speech
 * - 'liaison': Sound linking between words (French, etc.)
 * - 'sandhi': Tone/sound changes at word boundaries (Chinese, Thai clusters)
 */
export type PhonologicalRuleType =
  | 'tone'
  | 'sound-change'
  | 'assimilation'
  | 'elision'
  | 'liaison'
  | 'sandhi'
  | (string & {}); // escape hatch

/**
 * Phonological rule node
 *
 * Represents a discrete, trackable phonological rule (tone determination,
 * sound change, etc.). Language-specific conditions go in child
 * RuleConditionNodes or in node.data.
 *
 * @example Thai tone rule: "Mai Ek on Middle-Class Consonants → Low Tone"
 * @example French liaison: "Final consonant pronounced before vowel"
 */
export interface PhonologicalRuleNode extends UnistParent {
  type: 'phonologicalRule';
  /** Unique ID within the syllabus */
  id: string;
  /** Rule title */
  title: string;
  /** Type of phonological rule */
  ruleType: PhonologicalRuleType;
  /** Prose description of the rule */
  description?: string;
  /** Exceptions or special cases */
  exceptions?: string;
  /** IDs of related phonological rules */
  relatedRules?: string[];
  /** Child nodes: conditions that define this rule, examples, and content */
  children: (RuleConditionNode | ExampleNode | ContentNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data (language-specific extensions go here) */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Rule condition node
 *
 * A single condition→result case within a phonological rule.
 * The `condition` record is intentionally generic (Record<string, string>)
 * to support any language's phonological parameters.
 *
 * @example Thai: { consonantClass: 'middle', toneMark: 'mai-ek' } → result: 'low'
 * @example Chinese: { initialTone: '3', followingTone: '3' } → result: '2'
 */
export interface RuleConditionNode extends UnistLiteral {
  type: 'ruleCondition';
  /** Optional ID for tracking individual conditions */
  id?: string;
  /** Condition parameters (language-specific key-value pairs) */
  condition: Record<string, string>;
  /** Result when condition is met (e.g., tone name, transformed sound) */
  result: string;
  /** Example text demonstrating this condition */
  example?: string;
  /** Transcription of the example */
  exampleTranscription?: string;
  /** Translation of the example */
  exampleTranslation?: string;
  /** Additional notes */
  notes?: string;
  /** Serialized condition for Unist Literal compatibility */
  value: string;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

// ============================================================================
// Syllable Pattern Nodes (v0.3.0 — for syllable structure teaching)
// ============================================================================

/**
 * Syllable pattern node
 *
 * Represents an abstract syllable structure pattern for teaching
 * syllable analysis. Language-specific details (live/dead syllables
 * in Thai, open/closed in European languages) go in data or patternType.
 *
 * @example Thai: Live syllable (คำเป็น) — ends in long vowel or sonorant
 * @example Thai: Dead syllable (คำตาย) — ends in stop or short vowel
 * @example English: CVC pattern (cat, dog, run)
 */
export interface SyllablePatternNode extends UnistParent {
  type: 'syllablePattern';
  /** Unique ID within the syllabus */
  id: string;
  /** Pattern title */
  title: string;
  /**
   * Pattern type (language-specific classification).
   * @example Thai: 'live' | 'dead'
   * @example General: 'open' | 'closed'
   */
  patternType?: string;
  /**
   * Abstract syllable structure using linguistic notation.
   * @example 'CV', 'CVC', 'CVCC', 'V', 'VC'
   */
  structure?: string;
  /** Prose description of the pattern */
  description?: string;
  /** Child nodes: examples demonstrating this pattern and content */
  children: (PatternExampleNode | ContentNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

/**
 * Pattern example node
 *
 * A concrete example of a syllable pattern with optional
 * references to canonical character IDs.
 */
export interface PatternExampleNode extends UnistLiteral {
  type: 'patternExample';
  /** Text in target language */
  text: string;
  /** Transcription/pronunciation */
  transcription?: Transcription;
  /** Translation */
  translation?: string;
  /** Additional notes */
  notes?: string;
  /** Canonical character IDs used in this example */
  references?: string[];
  /** The value (same as text for Unist Literal compatibility) */
  value: string;
  /** Unist data (language-specific: consonantClass, syllableType, tone, vowelLength, etc.) */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

// ============================================================================
// Writing Pattern Nodes (v0.3.0 — for script/writing system rules)
// ============================================================================

/**
 * Writing pattern node
 *
 * Represents a writing system rule: character positioning, stroke order,
 * ligatures, or combination rules. Relevant for non-Latin scripts
 * where characters behave differently in context.
 *
 * @example Thai: Vowel เ- is written before the consonant but read after
 * @example Japanese: Kanji stroke order rules
 * @example Arabic: Letter forms change by position (initial/medial/final/isolated)
 * @example Korean: Jamo combine into syllable blocks
 */
export interface WritingPatternNode extends UnistParent {
  type: 'writingPattern';
  /** Unique ID within the syllabus */
  id: string;
  /** Pattern title */
  title: string;
  /**
   * Type of writing pattern.
   * @example 'positioning' — character placement rules (Thai vowels)
   * @example 'stroke-order' — stroke sequence (CJK characters)
   * @example 'ligature' — characters that merge visually (Arabic)
   * @example 'combination' — characters that combine (Korean jamo)
   */
  patternType: string;
  /** Prose description */
  description?: string;
  /** Child nodes: examples and content */
  children: (ExampleNode | ContentNode)[];
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Unist data */
  data?: Data;
  /** Position in source file */
  position?: Position;
}

// ============================================================================
// Union Types for Type Safety
// ============================================================================

/**
 * All possible syllabus node types
 */
export type SyllabusNode =
  | SyllabusRoot
  | ChapterNode
  | SectionNode
  | LessonAstNode
  | GrammarRuleNode
  | VocabularySetNode
  | VocabularyItemNode
  | CharacterSetNode
  | CharacterItemNode
  | ExampleSetNode
  | ExampleNode
  | ExerciseNode
  | ContentNode
  | MetadataNode
  | DialogueNode
  | DialogueTurnNode
  | PhonologicalRuleNode
  | RuleConditionNode
  | SyllablePatternNode
  | PatternExampleNode
  | WritingPatternNode;

/**
 * Parent nodes (nodes with children)
 */
export type SyllabusParent =
  | SyllabusRoot
  | ChapterNode
  | SectionNode
  | LessonAstNode
  | GrammarRuleNode
  | VocabularySetNode
  | CharacterSetNode
  | ExampleSetNode
  | ExerciseNode
  | DialogueNode
  | PhonologicalRuleNode
  | SyllablePatternNode
  | WritingPatternNode;

/**
 * Leaf nodes (nodes without children)
 */
export type SyllabusLeaf =
  | VocabularyItemNode
  | CharacterItemNode
  | ExampleNode
  | ContentNode
  | MetadataNode
  | DialogueTurnNode
  | RuleConditionNode
  | PatternExampleNode;

/**
 * Content-bearing nodes
 */
export type ContentBearingNode =
  | LessonAstNode
  | GrammarRuleNode
  | VocabularySetNode
  | CharacterSetNode
  | ExampleSetNode
  | ExerciseNode;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for SyllabusRoot
 */
export function isSyllabusRoot(node: UnistNode): node is SyllabusRoot {
  return node.type === 'syllabusRoot';
}

/**
 * Type guard for ChapterNode
 */
export function isChapterNode(node: UnistNode): node is ChapterNode {
  return node.type === 'chapter';
}

/**
 * Type guard for SectionNode
 */
export function isSectionNode(node: UnistNode): node is SectionNode {
  return node.type === 'section';
}

/**
 * Type guard for LessonAstNode
 */
export function isLessonAstNode(node: UnistNode): node is LessonAstNode {
  return node.type === 'lesson';
}

/**
 * Type guard for GrammarRuleNode
 */
export function isGrammarRuleNode(node: UnistNode): node is GrammarRuleNode {
  return node.type === 'grammarRule';
}

/**
 * Type guard for VocabularySetNode
 */
export function isVocabularySetNode(node: UnistNode): node is VocabularySetNode {
  return node.type === 'vocabularySet';
}

/**
 * Type guard for VocabularyItemNode
 */
export function isVocabularyItemNode(node: UnistNode): node is VocabularyItemNode {
  return node.type === 'vocabularyItem';
}

/**
 * Type guard for CharacterSetNode
 */
export function isCharacterSetNode(node: UnistNode): node is CharacterSetNode {
  return node.type === 'characterSet';
}

/**
 * Type guard for CharacterItemNode
 */
export function isCharacterItemNode(node: UnistNode): node is CharacterItemNode {
  return node.type === 'characterItem';
}

/**
 * Type guard for ExampleSetNode
 */
export function isExampleSetNode(node: UnistNode): node is ExampleSetNode {
  return node.type === 'exampleSet';
}

/**
 * Type guard for ExampleNode
 */
export function isExampleNode(node: UnistNode): node is ExampleNode {
  return node.type === 'example';
}

/**
 * Type guard for ExerciseNode (any exercise type)
 */
export function isExerciseNode(node: UnistNode): node is ExerciseNode {
  return node.type === 'exercise';
}

/**
 * Type guard for MultipleChoiceExercise
 */
export function isMultipleChoiceExercise(node: UnistNode): node is MultipleChoiceExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'multiple-choice';
}

/**
 * Type guard for MatchingExercise
 */
export function isMatchingExercise(node: UnistNode): node is MatchingExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'matching';
}

/**
 * Type guard for FillInBlankExercise
 */
export function isFillInBlankExercise(node: UnistNode): node is FillInBlankExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'fill-in-blank';
}

/**
 * Type guard for TrueFalseExercise
 */
export function isTrueFalseExercise(node: UnistNode): node is TrueFalseExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'true-false';
}

/**
 * Type guard for TranslationExercise
 */
export function isTranslationExercise(node: UnistNode): node is TranslationExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'translation';
}

/**
 * Type guard for TransformationExercise
 */
export function isTransformationExercise(node: UnistNode): node is TransformationExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'transformation';
}

/**
 * Type guard for PatternPracticeExercise
 */
export function isPatternPracticeExercise(node: UnistNode): node is PatternPracticeExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'pattern-practice';
}

/**
 * Type guard for DialogueExercise
 */
export function isDialogueExercise(node: UnistNode): node is DialogueExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'dialogue';
}

/**
 * Type guard for OpenEndedExercise
 */
export function isOpenEndedExercise(node: UnistNode): node is OpenEndedExercise {
  return node.type === 'exercise' && (node as ExerciseNode).exerciseType === 'open-ended';
}

/**
 * Type guard for ContentNode
 */
export function isContentNode(node: UnistNode): node is ContentNode {
  return node.type === 'content';
}

/**
 * Type guard for MetadataNode
 */
export function isMetadataNode(node: UnistNode): node is MetadataNode {
  return node.type === 'metadata';
}

/**
 * Type guard for DialogueNode
 */
export function isDialogueNode(node: UnistNode): node is DialogueNode {
  return node.type === 'dialogue';
}

/**
 * Type guard for DialogueTurnNode
 */
export function isDialogueTurnNode(node: UnistNode): node is DialogueTurnNode {
  return node.type === 'dialogueTurn';
}

/**
 * Type guard for PhonologicalRuleNode
 */
export function isPhonologicalRuleNode(node: UnistNode): node is PhonologicalRuleNode {
  return node.type === 'phonologicalRule';
}

/**
 * Type guard for RuleConditionNode
 */
export function isRuleConditionNode(node: UnistNode): node is RuleConditionNode {
  return node.type === 'ruleCondition';
}

/**
 * Type guard for SyllablePatternNode
 */
export function isSyllablePatternNode(node: UnistNode): node is SyllablePatternNode {
  return node.type === 'syllablePattern';
}

/**
 * Type guard for PatternExampleNode
 */
export function isPatternExampleNode(node: UnistNode): node is PatternExampleNode {
  return node.type === 'patternExample';
}

/**
 * Type guard for WritingPatternNode
 */
export function isWritingPatternNode(node: UnistNode): node is WritingPatternNode {
  return node.type === 'writingPattern';
}

/**
 * Type guard for parent nodes
 */
export function isParentNode(node: UnistNode): node is SyllabusParent {
  return 'children' in node && Array.isArray(node.children);
}

/**
 * Type guard for leaf nodes
 */
export function isLeafNode(node: UnistNode): node is SyllabusLeaf {
  return !isParentNode(node);
}

// ============================================================================
// Course Bundle Types (v0.2.0)
// ============================================================================

/**
 * Vocabulary index entry - tracks vocabulary items across lessons
 */
export interface VocabularyIndexEntry {
  /** Vocabulary item ID */
  id: string;
  /** Word in target language */
  word: string;
  /** Translation */
  translation: string;
  /** Transcription (if available) */
  transcription?: Transcription;
  /** Lesson IDs where this word appears */
  lessonIds: string[];
  /** First lesson where this word is introduced */
  firstAppearance: string;
  /** Category for filtering */
  category?: string;
  /** Tags for discovery */
  tags?: string[];
}

/**
 * Vocabulary index for a course bundle
 */
export interface VocabularyIndex {
  /** All vocabulary entries indexed by word */
  byWord: Map<string, VocabularyIndexEntry>;
  /** All vocabulary entries indexed by ID */
  byId: Map<string, VocabularyIndexEntry>;
  /** Vocabulary grouped by category */
  byCategory: Map<string, VocabularyIndexEntry[]>;
  /** Vocabulary grouped by lesson */
  byLesson: Map<string, VocabularyIndexEntry[]>;
}

/**
 * Grammar rule index entry - tracks grammar rules across lessons
 */
export interface GrammarRuleIndexEntry {
  /** Grammar rule ID */
  id: string;
  /** Rule title */
  title: string;
  /** Brief explanation */
  explanation: string;
  /** Lesson IDs where this rule is taught */
  lessonIds: string[];
  /** First lesson where this rule is introduced */
  firstAppearance: string;
  /** IDs of related grammar rules */
  relatedRules?: string[];
  /** IDs of rules that should be learned first */
  prerequisites?: string[];
}

/**
 * Grammar rule index for a course bundle
 */
export interface GrammarRuleIndex {
  /** All rules indexed by ID */
  byId: Map<string, GrammarRuleIndexEntry>;
  /** Rules grouped by lesson */
  byLesson: Map<string, GrammarRuleIndexEntry[]>;
  /** Dependency graph (rule ID -> prerequisite rule IDs) */
  dependencies: Map<string, string[]>;
}

/**
 * Exercise index entry - tracks exercises across lessons
 */
export interface ExerciseIndexEntry {
  /** Exercise ID */
  id: string;
  /** Exercise type */
  exerciseType: ExerciseType;
  /** Lesson ID containing this exercise */
  lessonId: string;
  /** Difficulty level */
  difficulty?: GrammarDifficulty;
  /** Grammar rules this exercise tests */
  testsRules?: string[];
}

/**
 * Exercise index for a course bundle
 */
export interface ExerciseIndex {
  /** All exercises indexed by ID */
  byId: Map<string, ExerciseIndexEntry>;
  /** Exercises grouped by type */
  byType: Map<ExerciseType, ExerciseIndexEntry[]>;
  /** Exercises grouped by lesson */
  byLesson: Map<string, ExerciseIndexEntry[]>;
  /** Exercises grouped by difficulty */
  byDifficulty: Map<GrammarDifficulty, ExerciseIndexEntry[]>;
}

/**
 * Course indices - aggregated indices across all lessons
 */
export interface CourseIndices {
  /** Vocabulary index */
  vocabulary: VocabularyIndex;
  /** Grammar rule index */
  grammarRules: GrammarRuleIndex;
  /** Exercise index */
  exercises: ExerciseIndex;
}

/**
 * Course statistics - aggregated statistics across all lessons
 */
export interface CourseStatistics {
  /** Total number of lessons */
  totalLessons: number;
  /** Total vocabulary items (including duplicates across lessons) */
  totalVocabularyItems: number;
  /** Unique vocabulary items (deduplicated by word) */
  uniqueVocabularyItems: number;
  /** Total grammar rules */
  totalGrammarRules: number;
  /** Total exercises */
  totalExercises: number;
  /** Estimated total time in minutes */
  estimatedTotalTime: number;
  /** CEFR level coverage (level -> number of lessons) */
  cefrLevelCoverage: Partial<Record<CEFRLevel, number>>;
  /** Difficulty distribution (difficulty -> number of lessons) */
  difficultyDistribution: Partial<Record<GrammarDifficulty, number>>;
  /** Exercise type distribution (type -> count) */
  exerciseTypeDistribution: Partial<Record<ExerciseType, number>>;
}

/**
 * Course manifest - describes the course bundle contents
 */
export interface CourseManifest {
  /** Unique course ID */
  id: string;
  /** Course title */
  title: string;
  /** Course version (semver) */
  version: string;
  /** Target language code (ISO 639-1) */
  language: string;
  /** Source language code (learner's language) */
  sourceLanguage?: string;
  /** When the bundle was created */
  bundledAt: string; // ISO 8601 timestamp
  /** Ordered list of lesson IDs */
  lessonOrder: string[];
  /** Source information */
  source?: SyllabusSourceInfo;
  /** Course description */
  description?: string;
  /** Course-level CEFR range */
  cefrRange?: {
    min: CEFRLevel;
    max: CEFRLevel;
  };
  /** Course prerequisites (other course IDs) */
  prerequisites?: string[];
  /** Course learning objectives */
  objectives?: string[];
}

/**
 * Course bundle - a packaged collection of lessons with indices and statistics
 */
export interface CourseBundle {
  type: 'courseBundle';
  /** Course manifest */
  manifest: CourseManifest;
  /** Lessons in order */
  lessons: LessonAstNode[];
  /** Course indices for quick lookups */
  indices: CourseIndices;
  /** Aggregated course statistics */
  statistics: CourseStatistics;
  /** Optional syllabus root (if bundling from existing syllabus) */
  syllabusRoot?: SyllabusRoot;
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions?: ExtensionsMap;
  /** Additional metadata */
  data?: Data;
}

/**
 * Type guard for CourseBundle
 */
export function isCourseBundle(node: unknown): node is CourseBundle {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as CourseBundle).type === 'courseBundle'
  );
}
