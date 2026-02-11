/**
 * Grammar Rule Directive Transformer
 *
 * Handles: :::grammar-rule
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type { GrammarRuleNode } from "@syllst/core/types";

function transformGrammarRule(
  directive: DirectiveNode
): Partial<GrammarRuleNode> {
  const { id = "", title = "" } = directive.attributes || {};

  let explanation = "";
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === "paragraph" && !explanation) {
        explanation = toString(child);
      } else if (
        child.type === "containerDirective" &&
        child.name === "example"
      ) {
        // Nested examples handled by example transformer
        children.push(child);
      } else {
        children.push(child);
      }
    }
  }

  return {
    type: "grammarRule",
    id,
    title,
    explanation,
    children,
  };
}

export const grammarTransformer: DirectiveTransformer = {
  name: "grammar",
  directives: ["grammar-rule"],

  canHandle(name: string): boolean {
    return name === "grammar-rule";
  },

  transform(directive: DirectiveNode) {
    return transformGrammarRule(directive);
  },
};
