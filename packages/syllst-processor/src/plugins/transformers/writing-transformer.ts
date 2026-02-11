/**
 * Writing Pattern Directive Transformer
 *
 * Handles: :::writing-pattern
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type { WritingPatternNode } from "@syllst/core/types";
import { transformExample } from "./example-transformer.js";

function transformWritingPattern(
  directive: DirectiveNode
): Partial<WritingPatternNode> {
  const {
    id = "",
    title = "",
    patternType = "positioning",
    description: descAttr,
  } = directive.attributes || {};

  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === "paragraph" && !description) {
        description = toString(child);
      } else if (
        (child.type === "leafDirective" ||
          child.type === "containerDirective") &&
        child.name === "example"
      ) {
        children.push(transformExample(child));
      } else if (
        child.type === "paragraph" &&
        description
      ) {
        children.push({
          type: "content",
          format: "text",
          value: toString(child),
        });
      }
    }
  }

  return {
    type: "writingPattern",
    id,
    title,
    patternType,
    description,
    children,
  };
}

export const writingTransformer: DirectiveTransformer = {
  name: "writing",
  directives: ["writing-pattern"],

  canHandle(name: string): boolean {
    return name === "writing-pattern";
  },

  transform(directive: DirectiveNode) {
    return transformWritingPattern(directive);
  },
};
