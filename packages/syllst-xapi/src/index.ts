/**
 * @syllst/xapi
 *
 * xAPI profile for language learning, extending cmi5.
 * Provides verbs, activity types, extensions, and
 * Zod validation schemas for type-safe xAPI statement
 * construction.
 *
 * @example
 * ```typescript
 * import {
 *   VERBS,
 *   ACTIVITY_TYPES,
 *   EXTENSIONS,
 * } from "@syllst/xapi";
 *
 * // Or use subpath imports for tree-shaking:
 * import { VERBS } from "@syllst/xapi/verbs";
 * import {
 *   ContextExtensionsSchema,
 * } from "@syllst/xapi/extensions";
 * ```
 */

// Types
export * from "./types.js";

// Verbs
export * from "./verbs.js";

// Activity Types
export * from "./activity-types.js";

// Extensions (IRIs, types, and Zod schemas)
export * from "./extensions.js";

// Composite Schemas
export * from "./schemas.js";

// Profile Document
export { SYLLST_XAPI_PROFILE } from "./profile.js";
