/**
 * Zod schemas for GLOST integration types
 *
 * These schemas validate GLOST nodes when used in syllst content.
 * For full GLOST validation, use the glost-core validators.
 *
 * @see types/glost.ts for type definitions
 * @see https://github.com/fustilio/glost
 */

import { z } from 'zod';

// ============================================================================
// Base GLOST Schemas
// ============================================================================

/**
 * GLOST language code schema
 */
export const GLOSTLanguageCodeSchema = z.string().min(2);

/**
 * GLOST script system schema
 */
export const GLOSTScriptSystemSchema = z.string().min(2);

/**
 * GLOST transcription info schema
 */
export const GLOSTTranscriptionInfoSchema = z.object({
  text: z.string(),
  variants: z
    .array(
      z.object({
        text: z.string(),
        context: z.enum(['formal', 'informal', 'historical', 'regional', 'dialectal']),
        notes: z.string().optional(),
      })
    )
    .optional(),
  tone: z.number().optional(),
  syllables: z.array(z.string()).optional(),
  phonetic: z.string().optional(),
});

/**
 * GLOST transliteration data schema
 */
export const GLOSTTransliterationDataSchema = z.record(z.string(), GLOSTTranscriptionInfoSchema);

/**
 * GLOST quick translations schema
 */
export const GLOSTQuickTranslationsSchema = z.record(z.string(), z.string().optional());

/**
 * GLOST extras schema
 */
export const GLOSTExtrasSchema = z
  .object({
    translations: GLOSTQuickTranslationsSchema.optional(),
    metadata: z
      .object({
        translations: GLOSTQuickTranslationsSchema.optional(),
        difficulty: z.union([z.enum(['beginner', 'intermediate', 'advanced']), z.number(), z.string()]).optional(),
        frequency: z.enum(['rare', 'uncommon', 'common', 'very-common']).optional(),
        culturalNotes: z.string().optional(),
        related: z.array(z.string()).optional(),
        examples: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/**
 * GLOST linguistic metadata schema
 */
export const GLOSTLinguisticMetadataSchema = z.object({
  partOfSpeech: z.string(),
  usage: z.string().optional(),
  etymology: z.string().optional(),
  examples: z.array(z.string()).optional(),
  frequency: z.enum(['high', 'medium', 'low']).optional(),
  formality: z.enum(['formal', 'neutral', 'informal']).optional(),
  register: z.string().optional(),
});

// ============================================================================
// GLOST Node Schemas
// ============================================================================

/**
 * GLOST Text node schema
 */
export const GLOSTTextSchema = z.object({
  type: z.literal('TextNode'),
  value: z.string(),
});

/**
 * GLOST Punctuation node schema
 */
export const GLOSTPunctuationSchema = z.object({
  type: z.literal('PunctuationNode'),
  value: z.string(),
});

/**
 * GLOST WhiteSpace node schema
 */
export const GLOSTWhiteSpaceSchema = z.object({
  type: z.literal('WhiteSpaceNode'),
  value: z.string(),
});

/**
 * GLOST Symbol node schema
 */
export const GLOSTSymbolSchema = z.object({
  type: z.literal('SymbolNode'),
  value: z.string(),
});

/**
 * GLOST Word content schema (union of leaf nodes)
 */
export const GLOSTWordContentSchema = z.union([
  GLOSTTextSchema,
  GLOSTSymbolSchema,
  GLOSTPunctuationSchema,
  GLOSTWhiteSpaceSchema,
]);

/**
 * GLOST Word node schema
 */
export const GLOSTWordSchema = z.object({
  type: z.literal('WordNode'),
  lang: GLOSTLanguageCodeSchema.optional(),
  script: GLOSTScriptSystemSchema.optional(),
  transcription: GLOSTTransliterationDataSchema.optional(),
  metadata: GLOSTLinguisticMetadataSchema.optional(),
  extras: GLOSTExtrasSchema.optional(),
  children: z.array(GLOSTWordContentSchema),
});

/**
 * GLOST Sentence content schema
 */
export const GLOSTSentenceContentSchema = z.union([
  GLOSTWordSchema,
  GLOSTPunctuationSchema,
  GLOSTSymbolSchema,
  GLOSTWhiteSpaceSchema,
]);

/**
 * GLOST Sentence node schema
 *
 * This is the primary schema used for DialogueTurnNode.glostSentences
 */
export const GLOSTSentenceSchema = z.object({
  type: z.literal('SentenceNode'),
  lang: GLOSTLanguageCodeSchema,
  script: GLOSTScriptSystemSchema,
  originalText: z.string(),
  transcription: GLOSTTransliterationDataSchema.optional(),
  extras: GLOSTExtrasSchema.optional(),
  children: z.array(GLOSTSentenceContentSchema),
});

/**
 * GLOST Paragraph node schema
 */
export const GLOSTParagraphSchema = z.object({
  type: z.literal('ParagraphNode'),
  lang: GLOSTLanguageCodeSchema.optional(),
  script: GLOSTScriptSystemSchema.optional(),
  extras: GLOSTExtrasSchema.optional(),
  children: z.array(GLOSTSentenceSchema),
});

/**
 * GLOST Root (document) node schema
 */
export const GLOSTRootSchema = z.object({
  type: z.literal('RootNode'),
  lang: GLOSTLanguageCodeSchema,
  script: GLOSTScriptSystemSchema,
  extras: GLOSTExtrasSchema.optional(),
  metadata: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
      date: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  children: z.array(GLOSTParagraphSchema),
});

// ============================================================================
// Type Exports
// ============================================================================

export type GLOSTTextSchemaType = z.infer<typeof GLOSTTextSchema>;
export type GLOSTWordSchemaType = z.infer<typeof GLOSTWordSchema>;
export type GLOSTSentenceSchemaType = z.infer<typeof GLOSTSentenceSchema>;
export type GLOSTParagraphSchemaType = z.infer<typeof GLOSTParagraphSchema>;
export type GLOSTRootSchemaType = z.infer<typeof GLOSTRootSchema>;
