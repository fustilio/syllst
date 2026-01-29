/**
 * Zod schema for the generic extension system
 */

import { z } from 'zod';

/**
 * Node extension schema — generic key-value data
 */
export const NodeExtensionSchema = z.record(z.string(), z.unknown());

/**
 * Extensions map schema — namespace to extension data
 *
 * Node schemas apply `.optional()` themselves when referencing this.
 */
export const ExtensionsMapSchema = z.record(
  z.string(),
  NodeExtensionSchema.optional()
);
