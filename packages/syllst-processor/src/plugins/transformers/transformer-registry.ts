/**
 * DirectiveTransformerRegistry
 *
 * Manages registration and lookup of directive transformers.
 * Supports chaining, duplicate detection, and ordered lookup.
 *
 * @module @syllst/processor/plugins/transformers
 */

import type { DirectiveTransformer } from "./directive-transformer.js";
import type {
  DirectiveNode,
  TransformContext,
} from "./shared/types.js";

/**
 * Registry for managing directive transformers.
 *
 * Later registrations take priority over earlier ones
 * (last-registered wins), allowing consumers to override
 * built-in transformers.
 */
export class DirectiveTransformerRegistry {
  private readonly transformers: DirectiveTransformer[] = [];

  /**
   * Register a transformer.
   * Returns this for chaining.
   */
  register(transformer: DirectiveTransformer): this {
    this.transformers.push(transformer);
    return this;
  }

  /**
   * Register multiple transformers at once.
   * Returns this for chaining.
   */
  registerAll(transformers: DirectiveTransformer[]): this {
    for (const t of transformers) {
      this.transformers.push(t);
    }
    return this;
  }

  /**
   * Find a transformer that can handle the given directive.
   * Last-registered matching transformer wins.
   */
  getTransformer(
    directiveName: string
  ): DirectiveTransformer | undefined {
    // Search in reverse so later registrations take priority
    for (let i = this.transformers.length - 1; i >= 0; i--) {
      if (this.transformers[i]!.canHandle(directiveName)) {
        return this.transformers[i];
      }
    }
    return undefined;
  }

  /**
   * Transform a directive using registered transformers.
   *
   * @returns The partial node to assign, or null if no
   *   transformer handles this directive
   */
  transform(
    directive: DirectiveNode,
    context?: TransformContext
  ): Record<string, unknown> | null {
    const transformer = this.getTransformer(directive.name);
    if (!transformer) {
      return null;
    }
    return transformer.transform(directive, context);
  }

  /**
   * Get all registered transformer names.
   */
  getRegisteredNames(): string[] {
    return this.transformers.map((t) => t.name);
  }

  /**
   * Get all directive names handled by registered
   * transformers.
   */
  getHandledDirectives(): string[] {
    const directives = new Set<string>();
    for (const t of this.transformers) {
      for (const d of t.directives) {
        directives.add(d);
      }
    }
    return [...directives];
  }

  /**
   * Check if any registered transformer handles the
   * given directive.
   */
  hasTransformer(directiveName: string): boolean {
    return this.getTransformer(directiveName) !== undefined;
  }
}
