/**
 * Configuration Schema for syllst Ecosystem
 *
 * Defines the structure for syllst.config.json configuration file.
 */

import { z } from 'zod';

/**
 * Duplicate ID handling behavior
 */
export const DuplicateIdBehaviorSchema = z.enum(['error', 'warn', 'warn-and-use-first']);

export type DuplicateIdBehavior = z.infer<typeof DuplicateIdBehaviorSchema>;

/**
 * AI Provider types
 */
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'local']);

export type AIProvider = z.infer<typeof AIProviderSchema>;

/**
 * Cache location types
 */
export const CacheLocationSchema = z.enum(['local', 'online']);

export type CacheLocation = z.infer<typeof CacheLocationSchema>;

/**
 * syllst configuration section
 */
export const SyllstConfigSchema = z.object({
  /** Default language code */
  defaultLanguage: z.string().optional(),
  /** Schema version */
  version: z.string().optional(),
});

export type SyllstConfig = z.infer<typeof SyllstConfigSchema>;

/**
 * AI transformation configuration section
 */
export const AIConfigSchema = z.object({
  /** AI provider to use */
  provider: AIProviderSchema.default('openai'),
  /** Model name/version */
  model: z.string().optional(),
  /** Cache configuration */
  cache: z.object({
    /** Whether caching is enabled */
    enabled: z.boolean().default(true),
    /** Cache location */
    location: CacheLocationSchema.default('local'),
    /** Time to live in seconds (optional) */
    ttl: z.number().optional(),
  }).default({
    enabled: true,
    location: 'local',
  }),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

/**
 * External format configuration section
 */
export const ExternalFormatsConfigSchema = z.object({
  /** Whether to generate SCORM packages */
  scorm: z.object({
    enabled: z.boolean().default(false),
  }).optional(),
  /** Whether to generate xAPI statements */
  xapi: z.object({
    enabled: z.boolean().default(false),
    endpoint: z.string().url().optional(),
  }).optional(),
  /** Whether to generate CMI5 packages */
  cmi5: z.object({
    enabled: z.boolean().default(false),
    courseId: z.string().optional(),
  }).optional(),
  /** Whether to generate IMS CC packages */
  imscc: z.object({
    enabled: z.boolean().default(false),
  }).optional(),
  /** Whether to generate QTI packages */
  qti: z.object({
    enabled: z.boolean().default(false),
  }).optional(),
});

export type ExternalFormatsConfig = z.infer<typeof ExternalFormatsConfigSchema>;

/**
 * Complete syllst configuration schema
 */
export const SyllstConfigFileSchema = z.object({
  /** syllst configuration */
  syllst: SyllstConfigSchema.optional(),
  /** AI transformation configuration */
  ai: AIConfigSchema.optional(),
  /** External format configuration */
  externalFormats: ExternalFormatsConfigSchema.optional(),
});

export type SyllstConfigFile = z.infer<typeof SyllstConfigFileSchema>;

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SyllstConfigFile = {
  syllst: {},
  ai: {
    provider: 'openai',
    cache: {
      enabled: true,
      location: 'local',
    },
  },
  externalFormats: {},
};
