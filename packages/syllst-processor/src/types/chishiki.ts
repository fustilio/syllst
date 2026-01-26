/**
 * Chishiki Integration Types
 *
 * This file provides type definitions for integrating with fustilio/chishiki.
 * These types define the interface for exporting syllst content to Chishiki's
 * Learning Record Store for practice and review.
 *
 * @see https://github.com/fustilio/chishiki
 * @see docs/ECOSYSTEM.md for integration details
 */

// ============================================================================
// Chishiki Content Types
// ============================================================================

/**
 * Chishiki learning content types
 *
 * These map to syllst node types:
 * - 'course' ← SyllabusRoot
 * - 'lesson' ← LessonAstNode
 * - 'vocabulary-set' ← VocabularySetNode
 * - 'dialogue' ← DialogueNode
 * - 'grammar-rule' ← GrammarRuleNode
 * - 'exercise' ← ExerciseNode
 * - 'text' ← ContentNode (markdown/text)
 */
export type ChishikiContentType =
  | 'course'
  | 'lesson'
  | 'vocabulary-set'
  | 'vocabulary'
  | 'dialogue'
  | 'grammar-rule'
  | 'exercise'
  | 'text';

/**
 * Chishiki learning content
 *
 * This is the primary interface for content in Chishiki's LRS.
 * @see chishiki/packages/sqlite/content.ts ContentManager
 */
export interface ChishikiLearningContent {
  /** Unique identifier (maps to syllst node ID) */
  id: string;
  /** Content type */
  type: ChishikiContentType;
  /** Display title */
  title: string;
  /** Parent content ID (for hierarchy) */
  parentId?: string;
  /** Original source URL (for imported content) */
  sourceUrl?: string;
  /** Language code (BCP-47) */
  language?: string;
  /** Content-specific data */
  data: ChishikiContentData;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

/**
 * Content-specific data payload
 *
 * The structure varies by content type.
 */
export interface ChishikiContentData {
  // Course/Lesson metadata
  description?: string;
  estimatedTime?: number;
  cefrLevel?: string;
  objectives?: string[];

  // Vocabulary data
  word?: string;
  transcription?: string;
  translation?: string;
  partOfSpeech?: string;
  examples?: string[];
  items?: ChishikiVocabularyItem[];

  // Dialogue data
  participants?: ChishikiDialogueParticipant[];
  turns?: ChishikiDialogueTurn[];
  context?: string;
  culturalNotes?: string;

  // Grammar rule data
  explanation?: string;
  pattern?: string;
  difficulty?: string;

  // Exercise data
  exerciseType?: string;
  question?: string;
  answer?: string | string[];
  options?: string[];

  // Text content
  content?: string;
  format?: string;

  // Allow additional fields
  [key: string]: unknown;
}

/**
 * Vocabulary item for vocabulary-set content
 */
export interface ChishikiVocabularyItem {
  id: string;
  word: string;
  transcription?: string;
  translation: string;
  partOfSpeech?: string;
  notes?: string;
  example?: string;
}

/**
 * Dialogue participant
 */
export interface ChishikiDialogueParticipant {
  id: string;
  name: string;
  role?: string;
}

/**
 * Dialogue turn
 */
export interface ChishikiDialogueTurn {
  speakerId: string;
  text: string;
  transcription?: string;
  translation: string;
}

// ============================================================================
// Chishiki Activity Types
// ============================================================================

/**
 * Activity types supported by Chishiki
 *
 * These define how content can be practiced.
 */
export type ChishikiActivityType =
  | 'flashcard'
  | 'cloze'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'typing'
  | 'quiz';

/**
 * Activity hints for Chishiki activity generation
 *
 * These optional hints can be included in syllst content to guide
 * how Chishiki generates activities from the content.
 */
export interface ChishikiActivityHints {
  /** Suggested activity types for this content */
  suggestedActivities?: ChishikiActivityType[];
  /** For flashcards: which field should be the front */
  flashcardFront?: string;
  /** For flashcards: which field should be the back */
  flashcardBack?: string;
  /** For cloze: patterns to create blanks from (e.g., "{{word}}") */
  clozeTargets?: string[];
  /** Default difficulty for generated activities */
  defaultDifficulty?: 'easy' | 'medium' | 'hard';
  /** Whether to include audio in activities */
  includeAudio?: boolean;
  /** Custom activity generation options */
  [key: string]: unknown;
}

// ============================================================================
// Export Interface
// ============================================================================

/**
 * Interface for syllst nodes that can be exported to Chishiki
 *
 * Implement this interface on syllst nodes to enable Chishiki integration.
 */
export interface SyllstExportable {
  /**
   * Convert this node to Chishiki learning content
   *
   * @param options - Export options
   * @returns Chishiki learning content
   */
  toChishikiContent(options?: ChishikiExportOptions): ChishikiLearningContent;
}

/**
 * Options for exporting to Chishiki
 */
export interface ChishikiExportOptions {
  /** Parent content ID to link to */
  parentId?: string;
  /** Source URL for the content */
  sourceUrl?: string;
  /** Override the generated ID */
  id?: string;
  /** Include activity hints in the exported data */
  includeActivityHints?: boolean;
}

// ============================================================================
// Content Type Mapping
// ============================================================================

/**
 * Mapping from syllst node types to Chishiki content types
 */
export const SYLLST_TO_CHISHIKI_TYPE_MAP: Record<string, ChishikiContentType> = {
  syllabusRoot: 'course',
  lesson: 'lesson',
  vocabularySet: 'vocabulary-set',
  vocabularyItem: 'vocabulary',
  dialogue: 'dialogue',
  grammarRule: 'grammar-rule',
  exercise: 'exercise',
  content: 'text',
};

/**
 * Get the Chishiki content type for a syllst node type
 *
 * @param syllstType - The syllst node type
 * @returns The corresponding Chishiki content type, or undefined
 */
export function getChishikiContentType(syllstType: string): ChishikiContentType | undefined {
  return SYLLST_TO_CHISHIKI_TYPE_MAP[syllstType];
}

/**
 * Check if a syllst node type is exportable to Chishiki
 *
 * @param syllstType - The syllst node type
 * @returns True if the type can be exported
 */
export function isExportableToChishiki(syllstType: string): boolean {
  return syllstType in SYLLST_TO_CHISHIKI_TYPE_MAP;
}
