/**
 * GLOST Integration Types
 *
 * This file provides type definitions for integrating with fustilio/glost.
 * These types mirror the glost-core types to allow optional type-safe integration
 * without requiring glost-core as a hard dependency.
 *
 * For full GLOST functionality, install glost-core:
 * ```bash
 * pnpm add glost-core
 * ```
 *
 * @see https://github.com/fustilio/glost
 * @see docs/ECOSYSTEM.md for integration details
 */

// ============================================================================
// Language and Script Types (compatible with glost-core)
// ============================================================================

/**
 * Language codes following BCP-47 format
 * @see glost-core/types.ts LanguageCode
 */
export type GLOSTLanguageCode =
  | 'th-TH'
  | 'th'
  | 'ja-JP'
  | 'ja'
  | 'zh-CN'
  | 'zh-TW'
  | 'zh'
  | 'ko-KR'
  | 'ko'
  | 'en-US'
  | 'en-GB'
  | 'en'
  | 'fr-FR'
  | 'fr'
  | 'de-DE'
  | 'de'
  | 'es-ES'
  | 'es'
  | string;

/**
 * Script system identifiers
 * @see glost-core/types.ts ScriptSystem
 */
export type GLOSTScriptSystem =
  | 'thai'
  | 'hiragana'
  | 'katakana'
  | 'kanji'
  | 'hanzi'
  | 'hangul'
  | 'latin'
  | 'mixed'
  | string;

// ============================================================================
// Transcription Types (compatible with glost-core)
// ============================================================================

/**
 * Transcription system identifiers
 * @see glost-core/types.ts TranscriptionSystem
 */
export type GLOSTTranscriptionSystem =
  | 'rtgs'
  | 'aua'
  | 'paiboon'
  | 'romaji'
  | 'furigana'
  | 'ipa'
  | 'pinyin'
  | 'hangul'
  | string;

/**
 * Pronunciation context for variants
 */
export type GLOSTPronunciationContext =
  | 'formal'
  | 'informal'
  | 'historical'
  | 'regional'
  | 'dialectal';

/**
 * Pronunciation variant
 */
export interface GLOSTPronunciationVariant {
  text: string;
  context: GLOSTPronunciationContext;
  notes?: string;
}

/**
 * Transcription information for a text segment
 */
export interface GLOSTTranscriptionInfo {
  text: string;
  variants?: GLOSTPronunciationVariant[];
  tone?: number;
  syllables?: string[];
  phonetic?: string;
}

/**
 * Complete transliteration data
 */
export type GLOSTTransliterationData = {
  [system: string]: GLOSTTranscriptionInfo;
};

// ============================================================================
// Quick Translations (compatible with glost-core)
// ============================================================================

/**
 * Quick translations in multiple languages
 */
export type GLOSTQuickTranslations = {
  'en-US'?: string;
  'en-GB'?: string;
  en?: string;
  'th-TH'?: string;
  th?: string;
  'ja-JP'?: string;
  ja?: string;
  'zh-CN'?: string;
  'zh-TW'?: string;
  zh?: string;
  'ko-KR'?: string;
  ko?: string;
  [lang: string]: string | undefined;
};

// ============================================================================
// GLOST Extras (compatible with glost-core)
// ============================================================================

/**
 * Extended metadata for GLOST nodes
 */
export interface GLOSTExtendedMetadata {
  translations?: GLOSTQuickTranslations;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 1 | 2 | 3 | 4 | 5 | string;
  frequency?: 'rare' | 'uncommon' | 'common' | 'very-common';
  culturalNotes?: string;
  related?: string[];
  examples?: string[];
  [key: string]: unknown;
}

/**
 * Extras field for extending GLOST nodes
 */
export interface GLOSTExtras {
  translations?: GLOSTQuickTranslations;
  metadata?: GLOSTExtendedMetadata;
  [key: string]: unknown;
}

// ============================================================================
// Linguistic Metadata (compatible with glost-core)
// ============================================================================

/**
 * Linguistic metadata for a text segment
 */
export interface GLOSTLinguisticMetadata {
  partOfSpeech: string;
  usage?: string;
  etymology?: string;
  examples?: string[];
  frequency?: 'high' | 'medium' | 'low';
  formality?: 'formal' | 'neutral' | 'informal';
  register?: string;
}

// ============================================================================
// GLOST Node Types (compatible with glost-core)
// ============================================================================

/**
 * GLOST Text node
 */
export interface GLOSTText {
  type: 'TextNode';
  value: string;
}

/**
 * GLOST Punctuation node
 */
export interface GLOSTPunctuation {
  type: 'PunctuationNode';
  value: string;
}

/**
 * GLOST WhiteSpace node
 */
export interface GLOSTWhiteSpace {
  type: 'WhiteSpaceNode';
  value: string;
}

/**
 * GLOST Symbol node
 */
export interface GLOSTSymbol {
  type: 'SymbolNode';
  value: string;
}

/**
 * GLOST Word node content
 */
export type GLOSTWordContent = GLOSTText | GLOSTSymbol | GLOSTPunctuation | GLOSTWhiteSpace;

/**
 * GLOST Word node
 * @see glost-core/types.ts GLOSTWord
 */
export interface GLOSTWord {
  type: 'WordNode';
  lang?: GLOSTLanguageCode;
  script?: GLOSTScriptSystem;
  transcription?: GLOSTTransliterationData;
  metadata?: GLOSTLinguisticMetadata;
  extras?: GLOSTExtras;
  children: GLOSTWordContent[];
}

/**
 * GLOST Sentence node content
 */
export type GLOSTSentenceContent = GLOSTWord | GLOSTPunctuation | GLOSTSymbol | GLOSTWhiteSpace;

/**
 * GLOST Sentence node
 * @see glost-core/types.ts GLOSTSentence
 */
export interface GLOSTSentence {
  type: 'SentenceNode';
  lang: GLOSTLanguageCode;
  script: GLOSTScriptSystem;
  originalText: string;
  transcription?: GLOSTTransliterationData;
  extras?: GLOSTExtras;
  children: GLOSTSentenceContent[];
}

/**
 * GLOST Paragraph node
 */
export interface GLOSTParagraph {
  type: 'ParagraphNode';
  lang?: GLOSTLanguageCode;
  script?: GLOSTScriptSystem;
  extras?: GLOSTExtras;
  children: GLOSTSentence[];
}

/**
 * GLOST Root node (document)
 */
export interface GLOSTRoot {
  type: 'RootNode';
  lang: GLOSTLanguageCode;
  script: GLOSTScriptSystem;
  extras?: GLOSTExtras;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    description?: string;
  };
  children: GLOSTParagraph[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a GLOST Text node
 */
export function isGLOSTText(node: unknown): node is GLOSTText {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'TextNode' &&
    'value' in node &&
    typeof (node as { value: unknown }).value === 'string'
  );
}

/**
 * Type guard to check if a value is a GLOST Word node
 */
export function isGLOSTWord(node: unknown): node is GLOSTWord {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'WordNode' &&
    'children' in node &&
    Array.isArray((node as { children: unknown }).children)
  );
}

/**
 * Type guard to check if a value is a GLOST Sentence node
 */
export function isGLOSTSentence(node: unknown): node is GLOSTSentence {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'SentenceNode' &&
    'lang' in node &&
    'script' in node &&
    'originalText' in node &&
    'children' in node &&
    Array.isArray((node as { children: unknown }).children)
  );
}

/**
 * Type guard to check if a value is a GLOST Paragraph node
 */
export function isGLOSTParagraph(node: unknown): node is GLOSTParagraph {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'ParagraphNode' &&
    'children' in node &&
    Array.isArray((node as { children: unknown }).children)
  );
}

/**
 * Type guard to check if a value is a GLOST Root node
 */
export function isGLOSTRoot(node: unknown): node is GLOSTRoot {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'RootNode' &&
    'lang' in node &&
    'script' in node &&
    'children' in node &&
    Array.isArray((node as { children: unknown }).children)
  );
}

/**
 * Type guard to check if an array contains GLOST Sentence nodes
 */
export function isGLOSTSentenceArray(nodes: unknown): nodes is GLOSTSentence[] {
  return Array.isArray(nodes) && nodes.every(isGLOSTSentence);
}

/**
 * Validate GLOST sentences for use in DialogueTurnNode.glostSentences
 *
 * @param sentences - Array of potential GLOST sentences
 * @returns Validation result with valid flag and any errors
 */
export function validateGLOSTSentences(sentences: unknown[]): {
  valid: boolean;
  errors: string[];
  sentences: GLOSTSentence[];
} {
  const errors: string[] = [];
  const validSentences: GLOSTSentence[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    if (!isGLOSTSentence(sentence)) {
      errors.push(`sentences[${i}]: Not a valid GLOST Sentence node`);
      continue;
    }

    // Validate required fields
    if (!sentence.originalText) {
      errors.push(`sentences[${i}]: Missing required field 'originalText'`);
    }

    if (!sentence.lang) {
      errors.push(`sentences[${i}]: Missing required field 'lang'`);
    }

    if (!sentence.script) {
      errors.push(`sentences[${i}]: Missing required field 'script'`);
    }

    if (errors.length === 0) {
      validSentences.push(sentence);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sentences: validSentences,
  };
}
