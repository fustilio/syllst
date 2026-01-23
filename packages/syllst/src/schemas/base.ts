/**
 * Base Zod schemas for Syllst
 *
 * These schemas provide runtime validation for Unist base types
 * and syllabus-specific enums/interfaces.
 */

import { z } from 'zod';

// ============================================================================
// Unist Base Schemas
// ============================================================================

/**
 * Unist Point schema
 */
export const PointSchema = z.object({
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Unist Position schema
 */
export const PositionSchema = z.object({
  start: PointSchema,
  end: PointSchema,
});

/**
 * Unist Data schema (extensible key-value store)
 */
export const DataSchema = z.record(z.string(), z.unknown());

// ============================================================================
// Syllabus-Specific Enums
// ============================================================================

/**
 * CEFR levels
 */
export const CEFRLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

/**
 * Grammar difficulty levels
 */
export const GrammarDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

/**
 * Move-on criteria (CMI5-inspired)
 */
export const MoveOnCriteriaSchema = z.enum(['Passed', 'Completed', 'CompletedAndPassed', 'NotApplicable']);

/**
 * Character types
 */
export const CharacterTypeSchema = z.enum(['vowel', 'consonant']);

/**
 * Phonetic categories
 */
export const PhoneticCategorySchema = z.enum([
  'stop',
  'fricative',
  'affricate',
  'nasal',
  'liquid',
  'approximant',
  'trill',
]);

/**
 * Voicing types
 */
export const VoicingTypeSchema = z.enum(['voiced', 'voiceless', 'ejective', 'aspirated']);

/**
 * Exercise types
 */
export const ExerciseTypeSchema = z.enum([
  'fill-in-blank',
  'multiple-choice',
  'translation',
  'transformation',
  'matching',
  'true-false',
  'open-ended',
  'pattern-practice',
  'dialogue',
]);

/**
 * Content formats
 */
export const ContentFormatSchema = z.enum(['markdown', 'text', 'html', 'glost', 'glost-dialogue']);

/**
 * Gender enum (for vocabulary and characters)
 */
export const GrammaticalGenderSchema = z.enum(['masculine', 'feminine', 'neuter']);

// ============================================================================
// Supporting Interfaces
// ============================================================================

/**
 * Syllabus source info schema
 */
export const SyllabusSourceInfoSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  authors: z.array(z.string()).optional(),
  year: z.number().int().positive().optional(),
  publisher: z.string().optional(),
});

/**
 * Learning objective schema (CMI5-inspired)
 */
export const LearningObjectiveSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  masteryScore: z.number().min(0).max(1).optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * Completion criteria schema (CMI5-inspired)
 */
export const CompletionCriteriaSchema = z.object({
  masteryScore: z.number().min(0).max(1).optional(),
  masteryPercentage: z.number().min(0).max(1).optional(),
  minMasteredCount: z.number().int().nonnegative().optional(),
  requireAllExercises: z.boolean().optional(),
  requireAllContent: z.boolean().optional(),
}).partial();

/**
 * Lesson metadata schema
 */
export const LessonMetadataSchema = z.object({
  pageNumber: z.number().int().positive().optional(),
  sectionNumber: z.string().optional(),
  estimatedTime: z.number().int().positive().optional(),
  prerequisites: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(), // Legacy: string array
  learningObjectives: z.array(LearningObjectiveSchema).optional(), // CMI5-inspired: structured objectives
  takeaways: z.array(z.string()).optional(),
  culturalNotes: z.string().optional(),
  notes: z.string().optional(),
  sourceFile: z.string().optional(),
  completionCriteria: CompletionCriteriaSchema.optional(), // CMI5-inspired
  moveOn: MoveOnCriteriaSchema.optional(), // CMI5-inspired
  defaultMasteryScore: z.number().min(0).max(1).optional(), // CMI5-inspired
}).partial();

/**
 * Character mnemonic schema
 */
export const CharacterMnemonicSchema = z.object({
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
  association: z.string().optional(),
});

/**
 * Character transliteration schema
 */
export const CharacterTransliterationSchema = z
  .object({
    primary: z.string().min(1),
    ipa: z.string().optional(),
    national: z.string().optional(),
    iso: z.string().optional(),
  })
  .catchall(z.string().optional());

/**
 * Character variant schema
 */
export const CharacterVariantSchema = z.object({
  name: z.string().min(1),
  form: z.string().min(1),
});

/**
 * Exercise item schema
 */
export const ExerciseItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  hint: z.string().optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type ZodCEFRLevel = z.infer<typeof CEFRLevelSchema>;
export type ZodGrammarDifficulty = z.infer<typeof GrammarDifficultySchema>;
export type ZodCharacterType = z.infer<typeof CharacterTypeSchema>;
export type ZodPhoneticCategory = z.infer<typeof PhoneticCategorySchema>;
export type ZodVoicingType = z.infer<typeof VoicingTypeSchema>;
export type ZodExerciseType = z.infer<typeof ExerciseTypeSchema>;
export type ZodContentFormat = z.infer<typeof ContentFormatSchema>;
export type ZodPosition = z.infer<typeof PositionSchema>;
export type ZodData = z.infer<typeof DataSchema>;
export type ZodSyllabusSourceInfo = z.infer<typeof SyllabusSourceInfoSchema>;
export type ZodLessonMetadata = z.infer<typeof LessonMetadataSchema>;
export type ZodCharacterMnemonic = z.infer<typeof CharacterMnemonicSchema>;
export type ZodCharacterTransliteration = z.infer<typeof CharacterTransliterationSchema>;
export type ZodExerciseItem = z.infer<typeof ExerciseItemSchema>;
