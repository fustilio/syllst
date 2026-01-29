/**
 * @syllst/xapi - Composite Schemas
 *
 * Zod schemas for validating language-learning
 * xAPI statement fragments (verb, result, context,
 * activity definition).
 */

import { z } from "zod";
import { VERBS } from "./verbs.js";
import { ACTIVITY_TYPES } from "./activity-types.js";
import {
  ContextExtensionsSchema,
  ResultExtensionsSchema,
  ActivityExtensionsSchema,
} from "./extensions.js";

// ============================================================
// Verb Schema
// ============================================================

/**
 * Schema for any xAPI verb object.
 */
export const VerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string(), z.string()),
});

/**
 * Schema restricted to verbs known to this profile.
 */
export const ProfileVerbSchema = z.object({
  id: z.enum(
    Object.values(VERBS) as [string, ...string[]]
  ),
  display: z.record(z.string(), z.string()),
});

// ============================================================
// Activity Definition Schema
// ============================================================

/**
 * Schema for an xAPI activity definition with
 * language-learning extensions.
 */
export const ActivityDefinitionSchema = z.object({
  type: z.string().url().optional(),
  name: z
    .record(z.string(), z.string())
    .optional(),
  description: z
    .record(z.string(), z.string())
    .optional(),
  extensions:
    ActivityExtensionsSchema.optional(),
});

/**
 * Schema for an activity definition restricted
 * to activity types known to this profile.
 */
export const ProfileActivityDefinitionSchema =
  z.object({
    type: z
      .enum(
        Object.values(ACTIVITY_TYPES) as [
          string,
          ...string[],
        ]
      )
      .optional(),
    name: z
      .record(z.string(), z.string())
      .optional(),
    description: z
      .record(z.string(), z.string())
      .optional(),
    extensions:
      ActivityExtensionsSchema.optional(),
  });

// ============================================================
// Result Schema
// ============================================================

/**
 * Schema for an xAPI result object with
 * language-learning extensions.
 */
export const ResultSchema = z.object({
  score: z
    .object({
      scaled: z
        .number()
        .min(-1)
        .max(1)
        .optional(),
      raw: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(),
  extensions: ResultExtensionsSchema.optional(),
});

// ============================================================
// Context Schema
// ============================================================

/**
 * Schema for an xAPI context object with
 * language-learning extensions.
 */
export const ContextSchema = z
  .object({
    registration: z.string().uuid().optional(),
    language: z.string().optional(),
    extensions:
      ContextExtensionsSchema.optional(),
  })
  .passthrough();
