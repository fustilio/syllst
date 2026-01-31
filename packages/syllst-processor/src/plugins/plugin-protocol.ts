/**
 * Syllst Plugin Protocol
 *
 * Defines the interface for plugins that extend the @syllst/processor pipeline.
 * Plugins are remark-compatible and integrate via the unified .use() pattern.
 *
 * @module @syllst/processor/plugins/protocol
 */

import type { Root as MdastRoot } from "mdast";
import type { Plugin, Transformer } from "unified";

/**
 * Plugin lifecycle phases
 *
 * Defines when in the processing pipeline a plugin operates:
 * - parse: Operates during MDX parsing phase (modifies MDAST)
 * - transform: Transforms MDAST nodes (e.g., directives → syllst nodes)
 * - validate: Validates transformed nodes
 * - enrich: Enriches existing nodes with additional data
 */
export type PluginPhase = "parse" | "transform" | "validate" | "enrich";

/**
 * Plugin metadata for discovery and conflict resolution
 *
 * Plugins declare capabilities and dependencies for the plugin registry.
 */
export interface SyllstPluginMeta {
  /** Unique plugin name (e.g., "syllst-glost", "syllst-xapi") */
  name: string;

  /** Semantic version (e.g., "0.1.0") */
  version: string;

  /** Primary lifecycle phase this plugin operates in */
  phase: PluginPhase;

  /**
   * Capabilities this plugin provides
   *
   * @example
   * ["transcription:th", "transcription:ja"]
   * ["xapi:vocabulary", "xapi:grammar"]
   */
  provides?: string[];

  /**
   * Capabilities this plugin requires from other plugins
   *
   * @example
   * ["transcription:*"] // Requires any transcription provider
   * ["syllst-core:validated"] // Requires core validation to have run
   */
  requires?: string[];

  /**
   * Plugin names this conflicts with
   *
   * @example
   * ["old-glost-plugin", "legacy-transcription"]
   */
  conflicts?: string[];

  /**
   * Human-readable description of what this plugin does
   */
  description?: string;
}

/**
 * Base plugin options interface
 *
 * All syllst plugins should extend this interface for their options.
 */
export interface SyllstPluginOptions {
  /**
   * Whether this plugin is enabled (default: true)
   *
   * Allows conditional plugin activation without removing from pipeline.
   */
  enabled?: boolean;

  /**
   * Plugin-specific metadata (not passed to plugin function)
   *
   * Used for plugin registry, discovery, and conflict detection.
   * This field is read by the processor but not forwarded to the plugin.
   */
  _meta?: SyllstPluginMeta;
}

/**
 * Syllst plugin function signature
 *
 * Compatible with unified's Plugin type, operating on MDAST trees.
 *
 * @template Options - Plugin-specific options extending SyllstPluginOptions
 *
 * @example
 * ```typescript
 * interface MyPluginOptions extends SyllstPluginOptions {
 *   myConfig: string;
 * }
 *
 * export const myPlugin: SyllstPlugin<MyPluginOptions> = function(options) {
 *   return (tree: MdastRoot, file: VFile) => {
 *     // Transform tree, attach metadata to file.data
 *   };
 * };
 * ```
 */
export type SyllstPlugin<Options extends SyllstPluginOptions = SyllstPluginOptions> =
  Plugin<[Options?], MdastRoot>;

/**
 * Plugin transformer function signature
 *
 * The function returned by a SyllstPlugin that performs the actual transformation.
 */
export type SyllstPluginTransformer = Transformer<MdastRoot>;

/**
 * Plugin metadata attached to VFile after processing
 *
 * Plugins attach their results to file.data[pluginName] for inspection.
 */
export interface SyllstPluginResult {
  /** Plugin name that produced this result */
  pluginName: string;

  /** Plugin version */
  pluginVersion: string;

  /** Processing time in milliseconds */
  processingTime?: number;

  /** Number of nodes processed/enriched */
  nodesProcessed?: number;

  /** Whether processing succeeded */
  success: boolean;

  /** Warnings generated during processing */
  warnings?: string[];

  /** Errors encountered during processing */
  errors?: string[];

  /**
   * Plugin-specific result data
   *
   * Plugins can attach additional data here for downstream consumers.
   */
  data?: Record<string, unknown>;
}

/**
 * Plugin registry for managing multiple plugins
 *
 * Consumer applications can implement this to enable plugin discovery,
 * conflict detection, and capability-based plugin loading.
 */
export interface SyllstPluginRegistry {
  /**
   * Register a plugin with metadata
   */
  register(plugin: SyllstPlugin, meta: SyllstPluginMeta): void;

  /**
   * Get all registered plugins for a specific phase
   */
  getByPhase(phase: PluginPhase): Array<{
    plugin: SyllstPlugin;
    meta: SyllstPluginMeta;
  }>;

  /**
   * Get plugin by name
   */
  getByName(name: string): {
    plugin: SyllstPlugin;
    meta: SyllstPluginMeta;
  } | undefined;

  /**
   * Check for plugin conflicts
   *
   * @returns Array of conflict descriptions, empty if no conflicts
   */
  checkConflicts(): string[];

  /**
   * Validate plugin dependencies
   *
   * @returns Array of missing dependencies, empty if all satisfied
   */
  validateDependencies(): string[];
}

/**
 * Type guard to check if an object is a valid SyllstPluginMeta
 */
export function isSyllstPluginMeta(obj: unknown): obj is SyllstPluginMeta {
  if (typeof obj !== "object" || obj === null) return false;

  const meta = obj as SyllstPluginMeta;

  return (
    typeof meta.name === "string" &&
    typeof meta.version === "string" &&
    (meta.phase === "parse" ||
      meta.phase === "transform" ||
      meta.phase === "validate" ||
      meta.phase === "enrich")
  );
}

/**
 * Type guard to check if an object is a valid SyllstPluginOptions
 */
export function isSyllstPluginOptions(obj: unknown): obj is SyllstPluginOptions {
  if (typeof obj !== "object" || obj === null) return false;

  const opts = obj as SyllstPluginOptions;

  // enabled must be boolean if present
  if (opts.enabled !== undefined && typeof opts.enabled !== "boolean") {
    return false;
  }

  // _meta must be valid if present
  if (opts._meta !== undefined && !isSyllstPluginMeta(opts._meta)) {
    return false;
  }

  return true;
}
