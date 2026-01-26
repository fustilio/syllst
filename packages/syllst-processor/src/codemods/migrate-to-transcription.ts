/**
 * Codemod: Migrate to Transcription
 *
 * Migrates syllst content from deprecated fields to new v0.2.0 fields:
 * - transliteration → transcription
 * - gender → data.gender
 * - phoneticCategory → data.phoneticCategory
 * - voicing → data.voicing
 *
 * @example
 * ```typescript
 * import { migrateToTranscription } from '@syllst/processor/codemods';
 *
 * const migrated = migrateToTranscription(lesson);
 * ```
 */

import type {
  VocabularyItemNode,
  CharacterItemNode,
  LessonAstNode,
  SyllabusRoot,
} from '@syllst/core/types';

/**
 * Legacy vocabulary item with deprecated fields
 * Used for migration from pre-v0.2.0 content
 */
interface LegacyVocabularyItem {
  type: 'vocabularyItem';
  id: string;
  word: string;
  transliteration?: string;
  transcription?: string;
  translation: string;
  gender?: string;
  partOfSpeech?: string;
  notes?: string;
  example?: string;
  related?: string[];
  value: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Legacy character transliteration object
 */
interface LegacyCharacterTransliteration {
  primary: string;
  ipa?: string;
  national?: string;
  iso?: string;
}

/**
 * Legacy character item with deprecated fields
 * Used for migration from pre-v0.2.0 content
 */
interface LegacyCharacterItem {
  type: 'characterItem';
  id: string;
  char: string;
  name: string;
  nativeName?: string;
  transliteration?: string | LegacyCharacterTransliteration;
  transcription?: string | { primary: string; [key: string]: string | undefined };
  charType: 'vowel' | 'consonant';
  phoneticCategory?: string;
  voicing?: string;
  mnemonic?: unknown;
  exampleWords?: string[];
  variants?: unknown[];
  notes?: string;
  audioPath?: string;
  value: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface MigrationResult {
  /** The migrated node */
  node: unknown;
  /** List of migrations that were applied */
  migrations: string[];
  /** Whether any migrations were needed */
  hadDeprecatedFields: boolean;
}

/**
 * Migrate a VocabularyItemNode from deprecated to new fields
 */
function migrateVocabularyItem(node: LegacyVocabularyItem): MigrationResult {
  const migrations: string[] = [];
  const migrated: Record<string, unknown> = { ...node };

  // Migrate transliteration → transcription
  if (node.transliteration && !node.transcription) {
    migrated.transcription = node.transliteration;
    delete migrated.transliteration;
    migrations.push('transliteration → transcription');
  }

  // Migrate gender → data.gender
  if (node.gender) {
    migrated.data = {
      ...(migrated.data as Record<string, unknown> || {}),
      gender: node.gender,
    };
    delete migrated.gender;
    migrations.push('gender → data.gender');
  }

  return {
    node: migrated as unknown as VocabularyItemNode,
    migrations,
    hadDeprecatedFields: migrations.length > 0,
  };
}

/**
 * Migrate a CharacterItemNode from deprecated to new fields
 */
function migrateCharacterItem(node: LegacyCharacterItem): MigrationResult {
  const migrations: string[] = [];
  const migrated: Record<string, unknown> = { ...node };

  // Migrate transliteration → transcription
  if (node.transliteration && !node.transcription) {
    // Handle both string and object transliteration
    if (typeof node.transliteration === 'string') {
      migrated.transcription = node.transliteration;
    } else {
      // LegacyCharacterTransliteration object → TranscriptionObject
      const trans = node.transliteration;
      migrated.transcription = {
        primary: trans.primary,
        ...(trans.ipa && { ipa: trans.ipa }),
        ...(trans.national && { national: trans.national }),
        ...(trans.iso && { iso: trans.iso }),
      };
    }
    delete migrated.transliteration;
    migrations.push('transliteration → transcription');
  }

  // Migrate phoneticCategory → data.phoneticCategory
  if (node.phoneticCategory) {
    migrated.data = {
      ...(migrated.data as Record<string, unknown> || {}),
      phoneticCategory: node.phoneticCategory,
    };
    delete migrated.phoneticCategory;
    migrations.push('phoneticCategory → data.phoneticCategory');
  }

  // Migrate voicing → data.voicing
  if (node.voicing) {
    migrated.data = {
      ...(migrated.data as Record<string, unknown> || {}),
      voicing: node.voicing,
    };
    delete migrated.voicing;
    migrations.push('voicing → data.voicing');
  }

  return {
    node: migrated as unknown as CharacterItemNode,
    migrations,
    hadDeprecatedFields: migrations.length > 0,
  };
}

/**
 * Recursively migrate all nodes in a tree
 */
function migrateNode(node: unknown): MigrationResult {
  if (!node || typeof node !== 'object') {
    return { node, migrations: [], hadDeprecatedFields: false };
  }

  const obj = node as Record<string, unknown>;
  const allMigrations: string[] = [];

  // Handle specific node types
  if (obj.type === 'vocabularyItem') {
    return migrateVocabularyItem(node as LegacyVocabularyItem);
  }

  if (obj.type === 'characterItem') {
    return migrateCharacterItem(node as LegacyCharacterItem);
  }

  // Recursively handle children
  if ('children' in obj && Array.isArray(obj.children)) {
    const migratedChildren = obj.children.map((child) => {
      const result = migrateNode(child);
      allMigrations.push(...result.migrations);
      return result.node;
    });

    return {
      node: { ...obj, children: migratedChildren },
      migrations: allMigrations,
      hadDeprecatedFields: allMigrations.length > 0,
    };
  }

  return { node, migrations: allMigrations, hadDeprecatedFields: allMigrations.length > 0 };
}

/**
 * Migrate a lesson to use new v0.2.0 fields
 *
 * @param lesson - The lesson to migrate (may have deprecated fields)
 * @returns Migration result with the migrated lesson and list of changes
 */
export function migrateLesson(lesson: LessonAstNode | Record<string, unknown>): MigrationResult {
  return migrateNode(lesson);
}

/**
 * Migrate an entire syllabus to use new v0.2.0 fields
 *
 * @param syllabus - The syllabus root to migrate (may have deprecated fields)
 * @returns Migration result with the migrated syllabus and list of changes
 */
export function migrateSyllabus(syllabus: SyllabusRoot | Record<string, unknown>): MigrationResult {
  return migrateNode(syllabus);
}

/**
 * Convenience export for migrating any node type
 */
export const migrateToTranscription = migrateNode;

export default migrateToTranscription;
