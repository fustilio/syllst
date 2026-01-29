/**
 * Generic Extension System
 *
 * Provides a namespace-based extension mechanism for syllst nodes.
 * Consumers (SCORM, xAPI, CMI5, etc.) define their own extension shapes
 * and read/write them through the generic ExtensionsMap.
 *
 * @example
 * ```typescript
 * // Consumer defines their extension shape
 * interface CMI5Extension extends NodeExtension {
 *   auId?: string;
 *   objectiveId?: string;
 *   masteryScore?: number;
 * }
 *
 * // Read from a node
 * const cmi5 = node.extensions?.['cmi5'] as CMI5Extension | undefined;
 *
 * // Write to a node
 * node.extensions = {
 *   ...node.extensions,
 *   cmi5: { auId: 'au-001', masteryScore: 0.8 },
 * };
 * ```
 */

/**
 * Base extension interface
 *
 * All extensions stored in ExtensionsMap should conform to this shape.
 * Consumers can extend this with their own typed fields.
 */
export interface NodeExtension {
  [key: string]: unknown;
}

/**
 * Extensions map (namespace -> extension data)
 *
 * A generic, open-ended map where each key is a namespace string
 * (e.g., 'scorm', 'xapi', 'cmi5') and the value is consumer-defined
 * extension data.
 */
export interface ExtensionsMap {
  [namespace: string]: NodeExtension | undefined;
}
