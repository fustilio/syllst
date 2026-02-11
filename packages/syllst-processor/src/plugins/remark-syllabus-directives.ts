/**
 * Remark Plugin: Syllabus Directives
 *
 * Transforms MDX directives (:::grammar-rule, ::vocab, etc.)
 * into Syllabus Unist nodes using a pluggable transformer
 * registry.
 *
 * Built-in transformers handle all standard directive types.
 * Consumers can register additional transformers via the
 * `transformers` option to support custom directives without
 * forking.
 *
 * @example Default usage (backwards-compatible):
 * ```typescript
 * createMDXParser().use(remarkSyllabusDirectives);
 * ```
 *
 * @example With custom transformers:
 * ```typescript
 * createMDXParser().use(remarkSyllabusDirectives, {
 *   transformers: [myCustomTransformer],
 * });
 * ```
 */

import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root as MdastRoot } from "mdast";
import { DirectiveTransformerRegistry } from "./transformers/transformer-registry.js";
import { builtInTransformers } from "./transformers/index.js";
import type { DirectiveTransformer } from "./transformers/directive-transformer.js";
import type { DirectiveNode } from "./transformers/shared/types.js";

/**
 * Options for the remarkSyllabusDirectives plugin
 */
export interface RemarkSyllabusDirectivesOptions {
  /**
   * Additional transformers to register.
   *
   * These are registered after built-in transformers, so
   * they can override built-in handling for any directive.
   */
  transformers?: DirectiveTransformer[];

  /**
   * If true, skip registering built-in transformers.
   * Only use this if you want full control over which
   * transformers are active.
   *
   * @default false
   */
  skipBuiltIns?: boolean;
}

/**
 * Remark plugin to transform syllabus directives using a
 * pluggable transformer registry.
 *
 * Backwards-compatible: calling without options behaves
 * identically to the previous monolithic implementation.
 */
export const remarkSyllabusDirectives: Plugin<
  [RemarkSyllabusDirectivesOptions?],
  MdastRoot
> = function (options: RemarkSyllabusDirectivesOptions = {}) {
  const registry = new DirectiveTransformerRegistry();

  // Register built-in transformers unless skipped
  if (!options.skipBuiltIns) {
    registry.registerAll(builtInTransformers);
  }

  // Register consumer-provided transformers (override priority)
  if (options.transformers) {
    registry.registerAll(options.transformers);
  }

  return (tree: MdastRoot) => {
    visit(
      tree,
      (node: any, index: number | undefined, parent: any) => {
        if (
          node.type !== "containerDirective" &&
          node.type !== "leafDirective"
        ) {
          return;
        }

        const directive = node as DirectiveNode;
        const context =
          index !== undefined
            ? { index, parent }
            : undefined;

        const transformed = registry.transform(
          directive,
          context
        );

        if (transformed) {
          Object.assign(node, transformed);
        }
      }
    );
  };
};

export default remarkSyllabusDirectives;

// Re-export transformer types for consumer convenience
export type { DirectiveTransformer } from "./transformers/directive-transformer.js";
export type {
  DirectiveNode,
  TransformContext,
} from "./transformers/shared/types.js";
export { DirectiveTransformerRegistry } from "./transformers/transformer-registry.js";
export { builtInTransformers } from "./transformers/index.js";
