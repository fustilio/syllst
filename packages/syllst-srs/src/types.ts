/**
 * SRS Card Types
 *
 * Language-agnostic schema for spaced-repetition cards derived from
 * syllst AST nodes. Designed to be consumed by any SRS implementation
 * (lalia-prism, Anki, custom FSRS, etc.).
 */

export type ActivityType = 'recognition' | 'production' | 'comprehension' | 'production-type';

export type SourceNodeType =
  | 'vocabularyItem'
  | 'grammarRule'
  | 'example'
  | 'characterItem'
  | 'exercise'
  | 'dialogueTurn'
  | 'phonologicalRule';

export interface SrsPrompt {
  /** Primary text shown to the learner */
  text: string;
  /** Transcription / pronunciation hint */
  transcription?: string;
  /** Context sentence or example */
  context?: string;
  /** Reference to audio asset */
  audioRef?: string;
  /** Reference to image asset */
  imageRef?: string;
}

export interface SrsAnswer {
  /** Primary accepted answer */
  text: string;
  /** Alternative accepted answers */
  alternatives?: string[];
  /** Explanation shown after answering */
  explanation?: string;
}

export interface SrsCard {
  /** Unique card ID */
  id: string;
  /** Canonical reference to source syllst node */
  sourceRef: string;
  /** Source node type */
  sourceType: SourceNodeType;
  /** Activity direction */
  activityType: ActivityType;
  /** What the learner sees */
  prompt: SrsPrompt;
  /** Expected response */
  answer: SrsAnswer;
  /** Difficulty hint for scheduler */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Tags for filtering and deck organization */
  tags: string[];
  /** Lesson this card belongs to */
  lessonId?: string;
  /** CEFR level */
  cefrLevel?: string;
}

export interface GeneratorOptions {
  /** Which activity types to generate (default: all) */
  activityTypes?: ActivityType[];
  /** Tag prefix for generated cards */
  tagPrefix?: string;
  /** Include transcription in prompts when available */
  includeTranscription?: boolean;
  /** Include context sentences when available */
  includeContext?: boolean;
  /** Maximum cards per source node (default: no limit) */
  maxCardsPerNode?: number;
}

export interface DeckBuildOptions extends GeneratorOptions {
  /** Which generators to enable (default: all) */
  generators?: SrsGenerator[];
  /** Deduplicate cards by sourceRef + activityType */
  deduplicate?: boolean;
}

/** A generator function that produces SRS cards from a syllst node */
export type SrsGenerator = (node: unknown, options: GeneratorOptions) => SrsCard[];
