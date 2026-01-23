/**
 * Zod schemas for external format extensions
 */

import { z } from 'zod';

/**
 * Base extension schema
 */
const BaseExtensionSchema = z.object({
  format: z.string(),
  version: z.string().optional(),
}).passthrough();

/**
 * SCORM extension schema
 */
export const SCORMExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('scorm'),
  version: z.enum(['1.2', '2004']).optional(),
  identifier: z.string().optional(),
  itemIdentifier: z.string().optional(),
  launchParameters: z.record(z.string(), z.string()).optional(),
});

/**
 * xAPI extension schema
 */
export const xAPIExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('xapi'),
  activityId: z.string().optional(),
  activityType: z.string().optional(),
  contextExtensions: z.record(z.string(), z.unknown()).optional(),
});

/**
 * CMI5 extension schema
 */
export const CMI5ExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('cmi5'),
  auId: z.string().optional(),
  courseId: z.string().optional(),
  objectiveIds: z.array(z.string()).optional(),
  launchParameters: z.object({
    endpoint: z.string().optional(),
    fetch: z.string().optional(),
    actor: z.string().optional(),
    registration: z.string().optional(),
    activityId: z.string().optional(),
  }).optional(),
});

/**
 * IMS CC extension schema
 */
export const IMSCCExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('imscc'),
  identifier: z.string().optional(),
  resourceType: z.string().optional(),
});

/**
 * QTI extension schema
 */
export const QTIExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('qti'),
  version: z.enum(['2.1', '2.2']).optional(),
  itemIdentifier: z.string().optional(),
  assessmentIdentifier: z.string().optional(),
});

/**
 * LTI extension schema
 */
export const LTIExtensionSchema = BaseExtensionSchema.extend({
  format: z.literal('lti'),
  version: z.enum(['1.0', '1.1', '1.2', '1.3']).optional(),
  toolId: z.string().optional(),
  launchUrl: z.string().optional(),
});

/**
 * Node extension union schema
 */
export const NodeExtensionSchema = z.discriminatedUnion('format', [
  SCORMExtensionSchema,
  xAPIExtensionSchema,
  CMI5ExtensionSchema,
  IMSCCExtensionSchema,
  QTIExtensionSchema,
  LTIExtensionSchema,
]);

/**
 * Extensions map schema
 * Maps format names to their extension schemas
 */
export const ExtensionsMapSchema = z.object({
  scorm: SCORMExtensionSchema.optional(),
  xapi: xAPIExtensionSchema.optional(),
  cmi5: CMI5ExtensionSchema.optional(),
  imscc: IMSCCExtensionSchema.optional(),
  qti: QTIExtensionSchema.optional(),
  lti: LTIExtensionSchema.optional(),
}).catchall(BaseExtensionSchema.optional()); // Allow for custom, un-typed extensions
