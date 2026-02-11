/**
 * Syllable Pattern Directive Transformer
 *
 * Handles: :::syllable-pattern, ::pattern-example
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type {
  SyllablePatternNode,
  PatternExampleNode,
} from "@syllst/core/types";
import {
  parseTranscription,
  extractDataAttributes,
} from "./shared/helpers.js";

function transformPatternExample(
  directive: DirectiveNode
): Partial<PatternExampleNode> {
  const {
    text = "",
    transcription,
    translation,
    notes,
    references,
  } = directive.attributes || {};

  const dataAttrs = extractDataAttributes(
    directive.attributes
  );

  return {
    type: "patternExample",
    text,
    transcription: parseTranscription(transcription),
    translation,
    notes,
    references: references
      ? references.split(",").map((r) => r.trim())
      : undefined,
    value: text,
    data: dataAttrs,
  };
}

function transformSyllablePattern(
  directive: DirectiveNode
): Partial<SyllablePatternNode> {
  const {
    id = "",
    title = "",
    patternType,
    structure,
    description: descAttr,
  } = directive.attributes || {};

  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === "paragraph" && !description) {
        description = toString(child);
      } else if (
        child.type === "leafDirective" &&
        child.name === "pattern-example"
      ) {
        children.push(transformPatternExample(child));
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
    type: "syllablePattern",
    id,
    title,
    patternType,
    structure,
    description,
    children,
  };
}

export const syllableTransformer: DirectiveTransformer = {
  name: "syllable",
  directives: ["syllable-pattern", "pattern-example"],

  canHandle(name: string): boolean {
    return (
      name === "syllable-pattern" ||
      name === "pattern-example"
    );
  },

  transform(directive: DirectiveNode) {
    if (directive.name === "syllable-pattern") {
      return transformSyllablePattern(directive);
    }
    return transformPatternExample(directive);
  },
};
