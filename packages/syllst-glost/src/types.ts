/**
 * @syllst/glost Types
 *
 * Type definitions for the GLOST integration plugin.
 */

import type { Root as MdastRoot } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Language provider configuration
 */
export interface LanguageProviderConfig {
  /** Language code (e.g., 'th', 'ja', 'ko') */
  lang: string;
  /** Transcription provider instance (from polyglot-bundles language foundation packages or glost-common) */
  transcriptionProvider?: TranscriptionProvider;
  /** Default transcription scheme to use */
  defaultScheme?: string;
}

/**
 * Transcription provider interface
 * Compatible with glost-common TranscriptionProvider
 */
export interface TranscriptionProvider {
  /** Get transcription for a word in a specific scheme */
  getTranscription(word: string, scheme: string): string | undefined;
  /** Get all available transcriptions for a word */
  getTranscriptions?(word: string): Record<string, string> | undefined;
  /** Get the default transcription scheme */
  getDefaultScheme?(): string;
}

/**
 * Target nodes to enrich with GLOST annotations
 */
export type EnrichTarget = 'vocabularyItem' | 'dialogueTurn' | 'example' | 'all';

/**
 * Plugin options for remarkSyllstGlost
 */
export interface RemarkSyllstGlostOptions {
  /** Language provider configurations */
  languages: LanguageProviderConfig[];

  /** Default language for content without explicit lang */
  defaultLang?: string;

  /** Which node types to enrich (default: ['all']) */
  targets?: EnrichTarget[];

  /** Whether to skip nodes that already have transcription (default: true) */
  skipExisting?: boolean;

  /** Transcription schemes to generate (default: provider's default) */
  schemes?: string[];

  /** Enable word-level annotations for dialogue */
  wordLevelDialogue?: boolean;

  /** Enable sentence-level annotations for dialogue */
  sentenceLevelDialogue?: boolean;
}

/**
 * Enrichment result for tracking what was processed
 */
export interface EnrichmentResult {
  /** Node ID that was enriched */
  nodeId: string;
  /** Node type */
  nodeType: string;
  /** Whether enrichment succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Transcription schemes applied */
  schemesApplied?: string[];
}

/**
 * Plugin metadata attached to vfile after processing
 */
export interface SyllstGlostMeta {
  /** Number of nodes enriched */
  nodesEnriched: number;
  /** Detailed results by node */
  results: EnrichmentResult[];
  /** Processing time in ms */
  processingTime: number;
}

/**
 * Remark plugin type
 */
export type RemarkSyllstGlostPlugin = Plugin<
  [RemarkSyllstGlostOptions?],
  MdastRoot
>;
