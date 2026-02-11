/**
 * DirectiveTransformer Interface
 *
 * Defines the contract for pluggable directive transformers.
 * Each transformer handles one or more related MDX directive
 * types and converts them into Syllst AST nodes.
 *
 * @module @syllst/processor/plugins/transformers
 */

import type { DirectiveNode, TransformContext } from "./shared/types.js";

/**
 * Interface for a directive transformer.
 *
 * Implement this to add custom directive handling without
 * modifying the core plugin.
 *
 * @example
 * ```typescript
 * const myTransformer: DirectiveTransformer = {
 *   name: 'my-custom',
 *   directives: ['my-widget'],
 *   canHandle(name) { return name === 'my-widget'; },
 *   transform(directive) {
 *     return { type: 'myWidget', id: directive.attributes?.id };
 *   },
 * };
 * ```
 */
export interface DirectiveTransformer {
  /** Human-readable transformer name */
  readonly name: string;

  /** List of directive names this transformer handles */
  readonly directives: readonly string[];

  /**
   * Check if this transformer can handle the directive.
   *
   * @param directiveName - The directive name
   *   (e.g., "vocabulary-set", "vocab")
   * @returns true if this transformer handles it
   */
  canHandle(directiveName: string): boolean;

  /**
   * Transform the directive node into a partial Syllst node.
   *
   * The returned object is assigned onto the MDAST node via
   * Object.assign, converting it in-place.
   *
   * @param directive - The directive node from remark-directive
   * @param context - Optional transform context (parent, index)
   * @returns Partial node to assign, or null to skip
   */
  transform(
    directive: DirectiveNode,
    context?: TransformContext
  ): Record<string, unknown> | null;
}
