/**
 * Shared types for directive transformers
 */

/**
 * Directive node from remark-directive
 */
export interface DirectiveNode {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name: string;
  attributes?: Record<string, string>;
  children?: any[];
  data?: any;
}

/**
 * Context provided to transformers during processing.
 * Includes parent node and index for sibling-aware transforms.
 */
export interface TransformContext {
  /** Index of the node in parent's children array */
  index?: number;
  /** Parent node containing this directive */
  parent?: any;
}
