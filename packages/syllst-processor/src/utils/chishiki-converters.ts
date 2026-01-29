/**
 * Chishiki Converters
 *
 * Utilities for converting syllst nodes to Chishiki learning content.
 * These functions implement the SyllstExportable interface for syllst nodes.
 *
 * @see https://github.com/fustilio/chishiki
 * @see @syllst/core/types/chishiki.ts for type definitions
 */

import type {
  SyllabusRoot,
  LessonAstNode,
  VocabularySetNode,
  VocabularyItemNode,
  CharacterSetNode,
  DialogueNode,
  GrammarRuleNode,
  ExerciseNode,
  ContentNode,
  Transcription,
} from '@syllst/core/types';
import type {
  ChishikiLearningContent,
  ChishikiVocabularyItem,
  ChishikiCharacterItem,
  ChishikiDialogueParticipant,
  ChishikiDialogueTurn,
  ChishikiExportOptions,
} from '../types/chishiki';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the primary transcription from a Transcription type
 */
function getPrimaryTranscription(transcription: Transcription | undefined): string | undefined {
  if (!transcription) return undefined;
  if (typeof transcription === 'string') return transcription;
  return transcription.primary;
}

/**
 * Generate an ISO 8601 timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Convert CEFR level to string
 */
function cefrToString(cefrLevel: string | string[] | undefined): string | undefined {
  if (!cefrLevel) return undefined;
  if (Array.isArray(cefrLevel)) return cefrLevel.join(', ');
  return cefrLevel;
}

/**
 * Extract mnemonic string from CharacterMnemonic or string
 */
function getMnemonicString(mnemonic: { text: string } | string | undefined): string | undefined {
  if (!mnemonic) return undefined;
  if (typeof mnemonic === 'string') return mnemonic;
  return mnemonic.text;
}

// ============================================================================
// Node Converters
// ============================================================================

/**
 * Convert a SyllabusRoot to Chishiki learning content
 */
export function syllabusRootToChishiki(
  node: SyllabusRoot,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  return {
    id: options.id || node.meta.id,
    type: 'course',
    title: node.meta.title,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl || node.meta.source?.url,
    language: node.meta.language,
    data: {
      // Note: SyllabusSourceInfo doesn't have description, use title as fallback
      description: node.meta.source?.title,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a LessonAstNode to Chishiki learning content
 */
export function lessonToChishiki(
  node: LessonAstNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  return {
    id: options.id || node.id,
    type: 'lesson',
    title: node.title,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    // Note: LessonMetadata doesn't have language field, leave undefined
    data: {
      description: node.description,
      cefrLevel: cefrToString(node.cefrLevel),
      difficulty: node.difficulty,
      estimatedTime: node.metadata?.estimatedTime,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a VocabularySetNode to Chishiki learning content
 */
export function vocabularySetToChishiki(
  node: VocabularySetNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  const items: ChishikiVocabularyItem[] = node.children.map((item) => ({
    id: item.id,
    word: item.word,
    transcription: getPrimaryTranscription(item.transcription),
    translation: item.translation,
    partOfSpeech: item.partOfSpeech,
    notes: item.notes,
    example: item.example,
  }));

  return {
    id: options.id || node.id,
    type: 'vocabulary-set',
    title: node.title || `Vocabulary Set: ${node.id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      items,
      description: node.description,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a VocabularyItemNode to Chishiki learning content
 */
export function vocabularyItemToChishiki(
  node: VocabularyItemNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  return {
    id: options.id || node.id,
    type: 'vocabulary',
    title: node.word,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      word: node.word,
      transcription: getPrimaryTranscription(node.transcription),
      translation: node.translation,
      partOfSpeech: node.partOfSpeech,
      notes: node.notes,
      example: node.example,
      examples: node.related,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a CharacterSetNode to Chishiki learning content
 */
export function characterSetToChishiki(
  node: CharacterSetNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  const items: ChishikiCharacterItem[] = node.children.map((item) => ({
    id: item.id,
    char: item.char,
    name: item.name,
    nativeName: item.nativeName,
    transcription: getPrimaryTranscription(item.transcription),
    charType: item.charType,
    mnemonic: getMnemonicString(item.mnemonic),
    notes: item.notes,
  }));

  return {
    id: options.id || node.id,
    type: 'character-set',
    title: node.title || `Character Set: ${node.id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      items,
      charType: node.charType,
      description: node.description,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a DialogueNode to Chishiki learning content
 */
export function dialogueToChishiki(
  node: DialogueNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  const participants: ChishikiDialogueParticipant[] = node.participants.map((p) => ({
    id: p.id,
    name: p.name || p.id, // Default to ID if name is not set
    role: p.role,
  }));

  const turns: ChishikiDialogueTurn[] = node.children.map((turn) => ({
    speakerId: turn.speakerId,
    text: turn.text,
    transcription: getPrimaryTranscription(turn.transcription),
    translation: turn.translation,
  }));

  return {
    id: options.id || node.id,
    type: 'dialogue',
    title: `Dialogue: ${node.id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    language: node.lang,
    data: {
      participants,
      turns,
      context: node.context,
      culturalNotes: node.culturalNotes,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a GrammarRuleNode to Chishiki learning content
 */
export function grammarRuleToChishiki(
  node: GrammarRuleNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  return {
    id: options.id || node.id,
    type: 'grammar-rule',
    title: node.title || `Grammar Rule: ${node.id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      explanation: node.explanation,
      exceptions: node.exceptions,
      relatedRules: node.relatedRules,
      commonMistakes: node.commonMistakes,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert an ExerciseNode to Chishiki learning content
 */
export function exerciseToChishiki(
  node: ExerciseNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();

  return {
    id: options.id || node.id,
    type: 'exercise',
    title: node.title || `Exercise: ${node.id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      exerciseType: node.exerciseType,
      question: node.question,
      answer: node.answer,
      options: node.options,
      difficulty: node.difficulty,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Convert a ContentNode to Chishiki learning content
 */
export function contentToChishiki(
  node: ContentNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent {
  const timestamp = getTimestamp();
  const id = options.id || `content-${Date.now()}`;

  return {
    id,
    type: 'text',
    title: `Content: ${id}`,
    parentId: options.parentId,
    sourceUrl: options.sourceUrl,
    data: {
      content: node.value,
      format: node.format,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// ============================================================================
// Generic Converter
// ============================================================================

/**
 * Syllst node with at least a type property
 */
type SyllstNode = { type: string; [key: string]: unknown };

/**
 * Convert any supported syllst node to Chishiki learning content
 *
 * @param node - The syllst node to convert
 * @param options - Export options
 * @returns Chishiki learning content, or null if the node type is not supported
 *
 * @example
 * ```typescript
 * import { toChishikiContent } from '@syllst/processor';
 *
 * const lesson = await buildLessonFromMDX(mdxContent);
 * const chishikiContent = toChishikiContent(lesson);
 *
 * // Import to Chishiki
 * await chishiki.content.import(chishikiContent);
 * ```
 */
export function toChishikiContent(
  node: SyllstNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent | null {
  switch (node.type) {
    case 'syllabusRoot':
      return syllabusRootToChishiki(node as unknown as SyllabusRoot, options);
    case 'lesson':
      return lessonToChishiki(node as unknown as LessonAstNode, options);
    case 'vocabularySet':
      return vocabularySetToChishiki(node as unknown as VocabularySetNode, options);
    case 'vocabularyItem':
      return vocabularyItemToChishiki(node as unknown as VocabularyItemNode, options);
    case 'characterSet':
      return characterSetToChishiki(node as unknown as CharacterSetNode, options);
    case 'dialogue':
      return dialogueToChishiki(node as unknown as DialogueNode, options);
    case 'grammarRule':
      return grammarRuleToChishiki(node as unknown as GrammarRuleNode, options);
    case 'exercise':
      return exerciseToChishiki(node as unknown as ExerciseNode, options);
    case 'content':
      return contentToChishiki(node as unknown as ContentNode, options);
    default:
      return null;
  }
}

/**
 * Convert a lesson and all its children to Chishiki learning content
 *
 * @param lesson - The lesson to convert
 * @param options - Export options
 * @returns Array of Chishiki learning content (lesson + children)
 */
export function lessonToChishikiBundle(
  lesson: LessonAstNode,
  options: ChishikiExportOptions = {}
): ChishikiLearningContent[] {
  const contents: ChishikiLearningContent[] = [];

  // Convert the lesson itself
  const lessonContent = lessonToChishiki(lesson, options);
  contents.push(lessonContent);

  // Convert all children with the lesson as parent
  const childOptions: ChishikiExportOptions = {
    ...options,
    parentId: lessonContent.id,
  };

  for (const child of lesson.children) {
    const childContent = toChishikiContent(child as unknown as SyllstNode, childOptions);
    if (childContent) {
      contents.push(childContent);
    }

    // If the child has its own children (e.g., VocabularySet with VocabularyItems),
    // we don't recursively convert them here - Chishiki will handle that via the
    // items array in the vocabulary-set data
  }

  return contents;
}
