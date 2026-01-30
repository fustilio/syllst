/**
 * Zod schemas for all Syllst node types
 *
 * These schemas match the TypeScript interfaces in types/nodes.ts
 * and provide runtime validation.
 */

import { z } from 'zod';
import {
  PositionSchema,
  DataSchema,
  CEFRLevelSchema,
  GrammarDifficultySchema,
  CharacterTypeSchema,
  PhoneticCategorySchema,
  ExerciseTypeSchema,
  ContentFormatSchema,
  SyllabusSourceInfoSchema,
  LessonMetadataSchema,
  CharacterMnemonicSchema,
  CharacterVariantSchema,
  ExerciseItemSchema,
  TranscriptionSchema,
  PhonologicalRuleTypeSchema,
} from './base';
import { ExtensionsMapSchema } from './extensions';

// ============================================================================
// Leaf Node Schemas (nodes without children)
// ============================================================================

/**
 * Vocabulary item node schema
 */
export const VocabularyItemNodeSchema = z.object({
  type: z.literal('vocabularyItem'),
  id: z.string().min(1),
  word: z.string().min(1),
  transcription: TranscriptionSchema.optional(),
  translation: z.string().min(1),
  definition: z.string().optional(),
  preview: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  partOfSpeech: z.string().optional(),
  notes: z.string().optional(),
  example: z.string().optional(),
  related: z.array(z.string()).optional(),
  value: z.string(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Character item node schema
 */
export const CharacterItemNodeSchema = z.object({
  type: z.literal('characterItem'),
  id: z.string().min(1),
  char: z.string().min(1),
  name: z.string().min(1),
  nativeName: z.string().optional(),
  transcription: TranscriptionSchema.optional(),
  charType: CharacterTypeSchema,
  preview: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mnemonic: z.union([CharacterMnemonicSchema, z.string()]).optional(),
  exampleWords: z.array(z.string()).optional(),
  variants: z.array(CharacterVariantSchema).optional(),
  notes: z.string().optional(),
  audioPath: z.string().optional(),
  canonicalRef: z.string().optional(),
  value: z.string(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Example node schema
 */
export const ExampleNodeSchema = z.object({
  type: z.literal('example'),
  id: z.string().min(1),
  text: z.string().min(1),
  transcription: TranscriptionSchema.optional(),
  translation: z.string().min(1),
  literalTranslation: z.string().optional(),
  notes: z.string().optional(),
  illustrates: z.array(z.string()).optional(),
  value: z.string(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Content node schema
 */
export const ContentNodeSchema = z.object({
  type: z.literal('content'),
  format: ContentFormatSchema,
  value: z.string(),
  ref: z.string().optional(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Metadata node schema
 */
export const MetadataNodeSchema = z.object({
  type: z.literal('metadata'),
  key: z.string().min(1),
  value: z.unknown(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Dialogue Node Schemas (NEW)
// ============================================================================

/**
 * Dialogue participant schema
 */
export const DialogueParticipantSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  gender: z.enum(['masculine', 'feminine', 'neutral']).optional(),
  role: z.string().optional(),
});

/**
 * Gender variants schema
 */
export const GenderVariantsSchema = z.object({
  masculine: z.string(),
  feminine: z.string(),
  neutral: z.string().optional(),
});

/**
 * Dialogue turn node schema
 */
export const DialogueTurnNodeSchema = z.object({
  type: z.literal('dialogueTurn'),
  speakerId: z.string().min(1),
  text: z.string().min(1),
  genderVariants: GenderVariantsSchema.optional(),
  transcription: TranscriptionSchema.optional(),
  translation: z.string().min(1),
  glostSentences: z.array(z.unknown()).optional(), // GLOST types in @syllst/processor
  value: z.string(),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Dialogue node schema
 */
export const DialogueNodeSchema = z.object({
  type: z.literal('dialogue'),
  id: z.string().min(1),
  participants: z.array(DialogueParticipantSchema),
  context: z.string().optional(),
  culturalNotes: z.string().optional(),
  lang: z.string().optional(),
  children: z.array(DialogueTurnNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Phonological Rule Node Schemas (v0.3.0)
// ============================================================================

/**
 * Rule condition node schema
 */
export const RuleConditionNodeSchema = z.object({
  type: z.literal('ruleCondition'),
  id: z.string().optional(),
  condition: z.record(z.string(), z.string()),
  result: z.string().min(1),
  example: z.string().optional(),
  exampleTranscription: z.string().optional(),
  exampleTranslation: z.string().optional(),
  notes: z.string().optional(),
  value: z.string(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Phonological rule node schema
 */
export const PhonologicalRuleNodeSchema = z.object({
  type: z.literal('phonologicalRule'),
  id: z.string().min(1),
  title: z.string().min(1),
  ruleType: PhonologicalRuleTypeSchema,
  description: z.string().optional(),
  exceptions: z.string().optional(),
  relatedRules: z.array(z.string()).optional(),
  children: z.array(
    z.union([RuleConditionNodeSchema, ExampleNodeSchema, ContentNodeSchema])
  ),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Syllable Pattern Node Schemas (v0.3.0)
// ============================================================================

/**
 * Pattern example node schema
 */
export const PatternExampleNodeSchema = z.object({
  type: z.literal('patternExample'),
  text: z.string().min(1),
  transcription: TranscriptionSchema.optional(),
  translation: z.string().optional(),
  notes: z.string().optional(),
  references: z.array(z.string()).optional(),
  value: z.string(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Syllable pattern node schema
 */
export const SyllablePatternNodeSchema = z.object({
  type: z.literal('syllablePattern'),
  id: z.string().min(1),
  title: z.string().min(1),
  patternType: z.string().optional(),
  structure: z.string().optional(),
  description: z.string().optional(),
  children: z.array(
    z.union([PatternExampleNodeSchema, ContentNodeSchema])
  ),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Writing Pattern Node Schemas (v0.3.0)
// ============================================================================

/**
 * Writing pattern node schema
 */
export const WritingPatternNodeSchema = z.object({
  type: z.literal('writingPattern'),
  id: z.string().min(1),
  title: z.string().min(1),
  patternType: z.string().min(1),
  description: z.string().optional(),
  children: z.array(
    z.union([ExampleNodeSchema, ContentNodeSchema])
  ),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Parent Node Schemas (nodes with children)
// ============================================================================

/**
 * Vocabulary set node schema
 */
export const VocabularySetNodeSchema = z.object({
  type: z.literal('vocabularySet'),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  children: z.array(VocabularyItemNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Character set node schema
 */
export const CharacterSetNodeSchema = z.object({
  type: z.literal('characterSet'),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  charType: CharacterTypeSchema.optional(),
  phoneticCategory: PhoneticCategorySchema.optional(),
  children: z.array(CharacterItemNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Example set node schema
 */
export const ExampleSetNodeSchema = z.object({
  type: z.literal('exampleSet'),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  children: z.array(ExampleNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Exercise node schema
 */
export const ExerciseNodeSchema = z.object({
  type: z.literal('exercise'),
  id: z.string().min(1),
  title: z.string().optional(),
  exerciseType: ExerciseTypeSchema,
  question: z.string().min(1),
  items: z.array(ExerciseItemSchema).optional(),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
  difficulty: GrammarDifficultySchema.optional(),
  skill: z.string().optional(),
  tests: z.array(z.string()).optional(),
  objectiveId: z.string().optional(),
  children: z.array(ContentNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Grammar rule node schema (recursive)
 */
export const GrammarRuleNodeSchema: z.ZodType<GrammarRuleNodeSchemaType> = z.lazy(() =>
  z.object({
    type: z.literal('grammarRule'),
    id: z.string().min(1),
    title: z.string().min(1),
    explanation: z.string().min(1),
    exceptions: z.string().optional(),
    relatedRules: z.array(z.string()).optional(),
    commonMistakes: z.array(z.string()).optional(),
    children: z.array(
      z.union([ExampleNodeSchema, GrammarRuleNodeSchema, ContentNodeSchema])
    ),
    extensions: ExtensionsMapSchema.optional(),
    data: DataSchema.optional(),
    position: PositionSchema.optional(),
  })
);

// Type for recursive grammar rule
interface GrammarRuleNodeSchemaType {
  type: 'grammarRule';
  id: string;
  title: string;
  explanation: string;
  exceptions?: string;
  relatedRules?: string[];
  commonMistakes?: string[];
  children: (
    | z.infer<typeof ExampleNodeSchema>
    | GrammarRuleNodeSchemaType
    | z.infer<typeof ContentNodeSchema>
  )[];
  data?: Record<string, unknown>;
  position?: z.infer<typeof PositionSchema>;
}

/**
 * Lesson content child schema (union of all possible lesson children)
 */
export const LessonContentChildSchema: z.ZodTypeAny = z.union([
  GrammarRuleNodeSchema,
  VocabularySetNodeSchema,
  CharacterSetNodeSchema,
  ExampleSetNodeSchema,
  ExerciseNodeSchema,
  ContentNodeSchema,
  DialogueNodeSchema,
  PhonologicalRuleNodeSchema,
  SyllablePatternNodeSchema,
  WritingPatternNodeSchema,
]);

/**
 * Lesson AST node schema
 */
export const LessonAstNodeSchema = z.object({
  type: z.literal('lesson'),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  parentId: z.string().optional(),
  difficulty: GrammarDifficultySchema.optional(),
  cefrLevel: z.union([CEFRLevelSchema, z.array(CEFRLevelSchema)]).optional(),
  categories: z.array(z.string()).optional(),
  metadata: LessonMetadataSchema.optional(),
  children: z.array(LessonContentChildSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Section node schema (recursive, can contain sections or lessons)
 */
export const SectionNodeSchema: z.ZodType<SectionNodeSchemaType> = z.lazy(() =>
  z.object({
    type: z.literal('section'),
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().nonnegative(),
    parentId: z.string().optional(),
    difficulty: GrammarDifficultySchema.optional(),
    cefrLevel: z.union([CEFRLevelSchema, z.array(CEFRLevelSchema)]).optional(),
    categories: z.array(z.string()).optional(),
    children: z.array(z.union([SectionNodeSchema, LessonAstNodeSchema])),
    extensions: ExtensionsMapSchema.optional(),
    data: DataSchema.optional(),
    position: PositionSchema.optional(),
  })
);

// Type for recursive section
interface SectionNodeSchemaType {
  type: 'section';
  id: string;
  title: string;
  description?: string;
  order: number;
  parentId?: string;
  difficulty?: z.infer<typeof GrammarDifficultySchema>;
  cefrLevel?: z.infer<typeof CEFRLevelSchema> | z.infer<typeof CEFRLevelSchema>[];
  categories?: string[];
  children: (SectionNodeSchemaType | z.infer<typeof LessonAstNodeSchema>)[];
  data?: Record<string, unknown>;
  position?: z.infer<typeof PositionSchema>;
}

/**
 * Chapter node schema
 */
export const ChapterNodeSchema = z.object({
  type: z.literal('chapter'),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  difficulty: GrammarDifficultySchema.optional(),
  cefrLevel: z.union([CEFRLevelSchema, z.array(CEFRLevelSchema)]).optional(),
  categories: z.array(z.string()).optional(),
  children: z.array(z.union([SectionNodeSchema, LessonAstNodeSchema])),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

/**
 * Syllabus meta schema
 */
export const SyllabusMetaSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    language: z.string().min(2).max(5),
    source: SyllabusSourceInfoSchema,
    version: z.string().min(1),
    extractedAt: z.string().datetime(),
  })
  .catchall(z.unknown());

/**
 * Syllabus root node schema
 */
export const SyllabusRootSchema = z.object({
  type: z.literal('syllabusRoot'),
  meta: SyllabusMetaSchema,
  children: z.array(z.union([ChapterNodeSchema, MetadataNodeSchema])),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
});

// ============================================================================
// Union Schemas
// ============================================================================

/**
 * All possible syllabus node types schema
 */
export const SyllabusNodeSchema: z.ZodTypeAny = z.union([
  SyllabusRootSchema,
  ChapterNodeSchema,
  SectionNodeSchema,
  LessonAstNodeSchema,
  GrammarRuleNodeSchema,
  VocabularySetNodeSchema,
  VocabularyItemNodeSchema,
  CharacterSetNodeSchema,
  CharacterItemNodeSchema,
  ExampleSetNodeSchema,
  ExampleNodeSchema,
  ExerciseNodeSchema,
  ContentNodeSchema,
  MetadataNodeSchema,
  DialogueNodeSchema,
  DialogueTurnNodeSchema,
  PhonologicalRuleNodeSchema,
  RuleConditionNodeSchema,
  SyllablePatternNodeSchema,
  PatternExampleNodeSchema,
  WritingPatternNodeSchema,
]);

/**
 * Parent nodes schema
 */
export const SyllabusParentSchema: z.ZodTypeAny = z.union([
  SyllabusRootSchema,
  ChapterNodeSchema,
  SectionNodeSchema,
  LessonAstNodeSchema,
  GrammarRuleNodeSchema,
  VocabularySetNodeSchema,
  CharacterSetNodeSchema,
  ExampleSetNodeSchema,
  ExerciseNodeSchema,
  DialogueNodeSchema,
  PhonologicalRuleNodeSchema,
  SyllablePatternNodeSchema,
  WritingPatternNodeSchema,
]);

/**
 * Leaf nodes schema
 */
export const SyllabusLeafSchema: z.ZodTypeAny = z.union([
  VocabularyItemNodeSchema,
  CharacterItemNodeSchema,
  ExampleNodeSchema,
  ContentNodeSchema,
  MetadataNodeSchema,
  DialogueTurnNodeSchema,
  RuleConditionNodeSchema,
  PatternExampleNodeSchema,
]);

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type ZodSyllabusRoot = z.infer<typeof SyllabusRootSchema>;
export type ZodChapterNode = z.infer<typeof ChapterNodeSchema>;
export type ZodSectionNode = z.infer<typeof SectionNodeSchema>;
export type ZodLessonAstNode = z.infer<typeof LessonAstNodeSchema>;
export type ZodGrammarRuleNode = z.infer<typeof GrammarRuleNodeSchema>;
export type ZodVocabularySetNode = z.infer<typeof VocabularySetNodeSchema>;
export type ZodVocabularyItemNode = z.infer<typeof VocabularyItemNodeSchema>;
export type ZodCharacterSetNode = z.infer<typeof CharacterSetNodeSchema>;
export type ZodCharacterItemNode = z.infer<typeof CharacterItemNodeSchema>;
export type ZodExampleSetNode = z.infer<typeof ExampleSetNodeSchema>;
export type ZodExampleNode = z.infer<typeof ExampleNodeSchema>;
export type ZodExerciseNode = z.infer<typeof ExerciseNodeSchema>;
export type ZodContentNode = z.infer<typeof ContentNodeSchema>;
export type ZodMetadataNode = z.infer<typeof MetadataNodeSchema>;
export type ZodDialogueNode = z.infer<typeof DialogueNodeSchema>;
export type ZodDialogueTurnNode = z.infer<typeof DialogueTurnNodeSchema>;
export type ZodDialogueParticipant = z.infer<typeof DialogueParticipantSchema>;
export type ZodGenderVariants = z.infer<typeof GenderVariantsSchema>;
export type ZodPhonologicalRuleNode = z.infer<typeof PhonologicalRuleNodeSchema>;
export type ZodRuleConditionNode = z.infer<typeof RuleConditionNodeSchema>;
export type ZodSyllablePatternNode = z.infer<typeof SyllablePatternNodeSchema>;
export type ZodPatternExampleNode = z.infer<typeof PatternExampleNodeSchema>;
export type ZodWritingPatternNode = z.infer<typeof WritingPatternNodeSchema>;
export type ZodSyllabusNode = z.infer<typeof SyllabusNodeSchema>;
export type ZodSyllabusParent = z.infer<typeof SyllabusParentSchema>;
export type ZodSyllabusLeaf = z.infer<typeof SyllabusLeafSchema>;

// ============================================================================
// Course Bundle Schemas (v0.2.0)
// ============================================================================

/**
 * CEFR range schema
 */
export const CEFRRangeSchema = z.object({
  min: CEFRLevelSchema,
  max: CEFRLevelSchema,
});

/**
 * Course manifest schema
 */
export const CourseManifestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  language: z.string().min(2).max(10),
  sourceLanguage: z.string().min(2).max(10).optional(),
  bundledAt: z.string().datetime(),
  lessonOrder: z.array(z.string().min(1)),
  source: SyllabusSourceInfoSchema.optional(),
  description: z.string().optional(),
  cefrRange: CEFRRangeSchema.optional(),
  prerequisites: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

/**
 * Course statistics schema
 */
export const CourseStatisticsSchema = z.object({
  totalLessons: z.number().int().nonnegative(),
  totalVocabularyItems: z.number().int().nonnegative(),
  uniqueVocabularyItems: z.number().int().nonnegative(),
  totalGrammarRules: z.number().int().nonnegative(),
  totalExercises: z.number().int().nonnegative(),
  estimatedTotalTime: z.number().nonnegative(),
  cefrLevelCoverage: z.record(CEFRLevelSchema, z.number().int().nonnegative()).optional(),
  difficultyDistribution: z.record(GrammarDifficultySchema, z.number().int().nonnegative()).optional(),
  exerciseTypeDistribution: z.record(ExerciseTypeSchema, z.number().int().nonnegative()).optional(),
});

/**
 * Course bundle schema (for validation)
 * Note: Index types use Map which can't be validated with Zod,
 * so we validate the serializable form (with arrays instead of Maps)
 */
export const CourseBundleSchema = z.object({
  type: z.literal('courseBundle'),
  manifest: CourseManifestSchema,
  lessons: z.array(LessonAstNodeSchema),
  statistics: CourseStatisticsSchema,
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
});

// Type exports for course bundle
export type ZodCourseManifest = z.infer<typeof CourseManifestSchema>;
export type ZodCourseStatistics = z.infer<typeof CourseStatisticsSchema>;
export type ZodCourseBundle = z.infer<typeof CourseBundleSchema>;
