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
} from './base.js';
import { ExtensionsMapSchema } from './extensions.js';

// ============================================================================
// Leaf Node Schemas (nodes without children)
// ============================================================================

/**
 * Vocabulary item node schema
 *
 * Individual word or phrase with translation and metadata. Used for
 * vocabulary learning in lessons. This is a leaf node (no children).
 *
 * @example
 * ```typescript
 * import { VocabularyItemNodeSchema } from '@syllst/core/schemas';
 *
 * const vocabItem = {
 *   type: 'vocabularyItem',
 *   id: 'vocab-hello',
 *   word: 'สวัสดี',
 *   transcription: 'sawatdee',
 *   translation: 'Hello',
 *   partOfSpeech: 'interjection',
 *   value: 'สวัสดี'
 * };
 *
 * const result = VocabularyItemNodeSchema.safeParse(vocabItem);
 * if (result.success) {
 *   console.log('Valid vocabulary item:', result.data);
 * }
 * ```
 */
export const VocabularyItemNodeSchema = z.object({
  type: z.literal('vocabularyItem'),
  /** Unique ID within the syllabus */
  id: z.string().min(1),
  /** Word or phrase in target language */
  word: z.string().min(1),
  /**
   * Transcription/pronunciation
   * Can be a simple string or object with multiple transcription systems
   */
  transcription: TranscriptionSchema.optional(),
  /** Translation in learner's language */
  translation: z.string().min(1),
  /** Longer explanation or definition */
  definition: z.string().optional(),
  /** Display text for cards/previews */
  preview: z.string().optional(),
  /** Category for filtering (e.g., "greetings", "food") */
  category: z.string().optional(),
  /** Tags for discovery and grouping */
  tags: z.array(z.string()).optional(),
  /** Part of speech (e.g., "noun", "verb", "adjective") */
  partOfSpeech: z.string().optional(),
  /** Usage notes or additional information */
  notes: z.string().optional(),
  /** Example sentence using this word */
  example: z.string().optional(),
  /** IDs of related vocabulary items */
  related: z.array(z.string()).optional(),
  /** The value (same as word for Unist Literal compatibility) */
  value: z.string(),
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions: ExtensionsMapSchema.optional(),
  /** Unist data (language-specific extensions go here) */
  data: DataSchema.optional(),
  /** Position in source file */
  position: PositionSchema.optional(),
});

/**
 * Character item node schema
 *
 * Individual character or letter with pronunciation and metadata.
 * Used for alphabet/script learning systems (Thai, Japanese, Korean,
 * Georgian, Arabic, etc.). This is a leaf node (no children).
 *
 * @example
 * ```typescript
 * import { CharacterItemNodeSchema } from '@syllst/core/schemas';
 *
 * // Thai consonant example
 * const thaiChar = {
 *   type: 'characterItem',
 *   id: 'th-ko-kai',
 *   char: 'ก',
 *   name: 'Ko Kai',
 *   nativeName: 'กอไก่',
 *   transcription: 'k',
 *   charType: 'consonant',
 *   canonicalRef: 'chicken',
 *   value: 'ก'
 * };
 *
 * const result = CharacterItemNodeSchema.safeParse(thaiChar);
 * ```
 *
 * @example
 * ```typescript
 * // Japanese hiragana example
 * const hiraganaChar = {
 *   type: 'characterItem',
 *   id: 'ja-hiragana-a',
 *   char: 'あ',
 *   name: 'a',
 *   transcription: 'a',
 *   charType: 'syllable-block',
 *   mnemonic: 'Looks like an antenna',
 *   value: 'あ'
 * };
 * ```
 */
export const CharacterItemNodeSchema = z.object({
  type: z.literal('characterItem'),
  /** Unique ID within the syllabus */
  id: z.string().min(1),
  /** The character/letter itself (e.g., "ა", "ก", "あ") */
  char: z.string().min(1),
  /** Name of the character (romanized, e.g., "Ani", "Ko Kai") */
  name: z.string().min(1),
  /** Name in native script (e.g., "ანი", "กอไก่") */
  nativeName: z.string().optional(),
  /**
   * Transcription/pronunciation
   * Can be a simple string or object with multiple transcription systems
   */
  transcription: TranscriptionSchema.optional(),
  /** Character type (consonant, vowel, tone-mark, etc.) */
  charType: CharacterTypeSchema,
  /** Display text for cards/previews */
  preview: z.string().optional(),
  /** Category for filtering (e.g., "mid-consonant", "short-vowel") */
  category: z.string().optional(),
  /** Tags for discovery and grouping */
  tags: z.array(z.string()).optional(),
  /** Memory aid/mnemonic (string or structured object) */
  mnemonic: z.union([CharacterMnemonicSchema, z.string()]).optional(),
  /** Example words using this character */
  exampleWords: z.array(z.string()).optional(),
  /** Historical/variant forms (e.g., Asomtavruli for Georgian) */
  variants: z.array(CharacterVariantSchema).optional(),
  /** Usage notes or additional information */
  notes: z.string().optional(),
  /** Audio file path for pronunciation */
  audioPath: z.string().optional(),
  /**
   * Reference to canonical character ID from @laeng packages.
   * Enables cross-package linking between lesson content and character data.
   * @example "chicken" (references @laeng/th canonical ID for ก)
   */
  canonicalRef: z.string().optional(),
  /** The value (same as char for Unist Literal compatibility) */
  value: z.string(),
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions: ExtensionsMapSchema.optional(),
  /** Unist data (language-specific extensions go here) */
  data: DataSchema.optional(),
  /** Position in source file */
  position: PositionSchema.optional(),
});

/**
 * Example node schema
 *
 * Example sentence demonstrating language usage. Used to illustrate
 * grammar rules, vocabulary usage, or provide context for learning.
 * This is a leaf node (no children).
 *
 * @example
 * ```typescript
 * import { ExampleNodeSchema } from '@syllst/core/schemas';
 *
 * const example = {
 *   type: 'example',
 *   id: 'ex-greeting',
 *   text: 'สวัสดีครับ ผมชื่อจอห์น',
 *   transcription: 'sawatdee khrap phom chue john',
 *   translation: 'Hello, my name is John.',
 *   literalTranslation: 'hello [polite-masculine] I name John',
 *   illustrates: ['grammar-self-intro', 'vocab-greetings'],
 *   value: 'สวัสดีครับ ผมชื่อจอห์น'
 * };
 *
 * const result = ExampleNodeSchema.safeParse(example);
 * ```
 */
export const ExampleNodeSchema = z.object({
  type: z.literal('example'),
  /** Unique ID within the syllabus */
  id: z.string().min(1),
  /** Text in target language */
  text: z.string().min(1),
  /**
   * Transcription/pronunciation of the example
   * Can be a simple string or object with multiple transcription systems
   */
  transcription: TranscriptionSchema.optional(),
  /** Translation in learner's language */
  translation: z.string().min(1),
  /** Word-by-word gloss for morpheme-level understanding */
  literalTranslation: z.string().optional(),
  /** Usage notes or additional context */
  notes: z.string().optional(),
  /** IDs of grammar rules or concepts this example illustrates */
  illustrates: z.array(z.string()).optional(),
  /** The value (same as text for Unist Literal compatibility) */
  value: z.string(),
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions: ExtensionsMapSchema.optional(),
  /** Unist data */
  data: DataSchema.optional(),
  /** Position in source file */
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
 *
 * Represents a single speaker's utterance in a dialogue. Used for
 * structured conversation practice. Can contain gender variants for
 * languages with gendered particles (Thai ครับ/ค่ะ, Japanese です/ですわ).
 * This is a leaf node (no children).
 *
 * @example
 * ```typescript
 * import { DialogueTurnNodeSchema } from '@syllst/core/schemas';
 *
 * // Thai dialogue with gender variants
 * const turn = {
 *   type: 'dialogueTurn',
 *   speakerId: 'customer',
 *   text: 'ขอโทษ{ครับ|ค่ะ} ห้องน้ำอยู่ที่ไหน{ครับ|ค่ะ}',
 *   genderVariants: {
 *     masculine: 'ขอโทษครับ ห้องน้ำอยู่ที่ไหนครับ',
 *     feminine: 'ขอโทษค่ะ ห้องน้ำอยู่ที่ไหนค่ะ'
 *   },
 *   transcription: 'kho-thot khrap hong-nam yu thi-nai khrap',
 *   translation: 'Excuse me, where is the bathroom?',
 *   value: 'ขอโทษ{ครับ|ค่ะ} ห้องน้ำอยู่ที่ไหน{ครับ|ค่ะ}'
 * };
 *
 * const result = DialogueTurnNodeSchema.safeParse(turn);
 * ```
 */
export const DialogueTurnNodeSchema = z.object({
  type: z.literal('dialogueTurn'),
  /** Speaker ID (references DialogueParticipant.id) */
  speakerId: z.string().min(1),
  /** Original text (may contain {masculine|feminine} syntax) */
  text: z.string().min(1),
  /** Pre-parsed gender variants for languages with gendered particles */
  genderVariants: GenderVariantsSchema.optional(),
  /**
   * Transcription/pronunciation of the dialogue turn
   * Can be a simple string or object with multiple transcription systems
   */
  transcription: TranscriptionSchema.optional(),
  /** Translation in learner's language */
  translation: z.string().min(1),
  /**
   * GLOST sentences for this turn (when using full GLOST integration)
   * Type is unknown[] to avoid core dependency on GLOST types.
   * Use @syllst/glost for type-safe GLOST integration.
   * @see https://github.com/fustilio/glost
   */
  glostSentences: z.array(z.unknown()).optional(),
  /** The value (same as text for Unist Literal compatibility) */
  value: z.string(),
  /** External format extensions (SCORM, xAPI, CMI5, etc.) */
  extensions: ExtensionsMapSchema.optional(),
  /** Unist data */
  data: DataSchema.optional(),
  /** Position in source file */
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

// ============================================================================
// Exercise Node Schemas — Discriminated Union (v0.4.0)
// ============================================================================

/**
 * Shared base fields for all exercise types (not a standalone schema).
 */
const exerciseBaseFields = {
  type: z.literal('exercise'),
  id: z.string().min(1),
  title: z.string().optional(),
  question: z.string().min(1),
  explanation: z.string().optional(),
  difficulty: GrammarDifficultySchema.optional(),
  skill: z.string().optional(),
  tests: z.array(z.string()).optional(),
  objectiveId: z.string().optional(),
  children: z.array(ContentNodeSchema),
  extensions: ExtensionsMapSchema.optional(),
  data: DataSchema.optional(),
  position: PositionSchema.optional(),
} as const;

/**
 * Multiple-choice exercise schema.
 * Options required (>= 2). Answer is a string.
 */
export const MultipleChoiceExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('multiple-choice'),
  options: z.array(z.string()).min(2),
  answer: z.string(),
  items: z.array(ExerciseItemSchema).optional(),
});

/**
 * Matching exercise schema.
 * Items required (>= 2 pairs).
 */
export const MatchingExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('matching'),
  items: z.array(ExerciseItemSchema).min(2),
  answer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

/**
 * Fill-in-blank exercise schema.
 */
export const FillInBlankExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('fill-in-blank'),
  items: z.array(ExerciseItemSchema).optional(),
  answer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

/**
 * True-false exercise schema.
 * Answer must be "true" or "false".
 */
export const TrueFalseExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('true-false'),
  answer: z.enum(['true', 'false']),
  items: z.array(ExerciseItemSchema).optional(),
  options: z.array(z.string()).optional(),
});

/**
 * Translation exercise schema.
 */
export const TranslationExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('translation'),
  answer: z.union([z.string(), z.array(z.string())]),
  items: z.array(ExerciseItemSchema).optional(),
  options: z.array(z.string()).optional(),
});

/**
 * Transformation exercise schema.
 * Items required (>= 1).
 */
export const TransformationExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('transformation'),
  items: z.array(ExerciseItemSchema).min(1),
  answer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

/**
 * Pattern-practice exercise schema.
 * Items required (>= 1).
 */
export const PatternPracticeExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('pattern-practice'),
  items: z.array(ExerciseItemSchema).min(1),
  answer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

/**
 * Dialogue exercise schema.
 * Items required (>= 1 dialogue turn).
 */
export const DialogueExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('dialogue'),
  items: z.array(ExerciseItemSchema).min(1),
  answer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

/**
 * Open-ended exercise schema.
 * Answer is optional.
 */
export const OpenEndedExerciseSchema = z.object({
  ...exerciseBaseFields,
  exerciseType: z.literal('open-ended'),
  answer: z.union([z.string(), z.array(z.string())]).optional(),
  items: z.array(ExerciseItemSchema).optional(),
  options: z.array(z.string()).optional(),
});

/**
 * Exercise node schema — discriminated union on `exerciseType`.
 *
 * Each branch enforces per-type structural requirements:
 * - multiple-choice: options required (>= 2), answer is string
 * - matching: items required (>= 2 pairs)
 * - true-false: answer must be "true" or "false"
 * - transformation/pattern-practice/dialogue: items required (>= 1)
 * - open-ended: answer is optional
 * - fill-in-blank/translation: minimal constraints
 */
export const ExerciseNodeSchema = z.discriminatedUnion(
  'exerciseType',
  [
    MultipleChoiceExerciseSchema,
    MatchingExerciseSchema,
    FillInBlankExerciseSchema,
    TrueFalseExerciseSchema,
    TranslationExerciseSchema,
    TransformationExerciseSchema,
    PatternPracticeExerciseSchema,
    DialogueExerciseSchema,
    OpenEndedExerciseSchema,
  ]
);

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
export type ZodMultipleChoiceExercise = z.infer<typeof MultipleChoiceExerciseSchema>;
export type ZodMatchingExercise = z.infer<typeof MatchingExerciseSchema>;
export type ZodFillInBlankExercise = z.infer<typeof FillInBlankExerciseSchema>;
export type ZodTrueFalseExercise = z.infer<typeof TrueFalseExerciseSchema>;
export type ZodTranslationExercise = z.infer<typeof TranslationExerciseSchema>;
export type ZodTransformationExercise = z.infer<typeof TransformationExerciseSchema>;
export type ZodPatternPracticeExercise = z.infer<typeof PatternPracticeExerciseSchema>;
export type ZodDialogueExercise = z.infer<typeof DialogueExerciseSchema>;
export type ZodOpenEndedExercise = z.infer<typeof OpenEndedExerciseSchema>;
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
