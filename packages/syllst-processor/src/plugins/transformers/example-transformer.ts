/**
 * Example Directive Transformer
 *
 * Handles: :::example-set, ::example
 */

import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type {
  ExampleSetNode,
  ExampleNode,
} from "@syllst/core/types";
import {
  parseTranscription,
  extractDataAttributes,
} from "./shared/helpers.js";

export function transformExample(
  directive: DirectiveNode
): Partial<ExampleNode> {
  const {
    id = `example-${Math.random().toString(36).substr(2, 9)}`,
    text = "",
    translation = "",
    transcription,
    notes,
    literalTranslation,
  } = directive.attributes || {};

  const illustrates = directive.attributes?.illustrates
    ?.split(",")
    .map((s) => s.trim());

  const data = extractDataAttributes(directive.attributes);

  return {
    type: "example",
    id,
    text,
    transcription: parseTranscription(transcription),
    translation,
    literalTranslation,
    notes,
    illustrates,
    value: text,
    ...(data && { data }),
  };
}

function transformExampleSet(
  directive: DirectiveNode
): Partial<ExampleSetNode> {
  const { id = "", title, description } =
    directive.attributes || {};

  const children: ExampleNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (
        child.type === "leafDirective" &&
        child.name === "example"
      ) {
        children.push(transformExample(child) as ExampleNode);
      } else if (
        child.type === "containerDirective" &&
        child.name === "example"
      ) {
        children.push(transformExample(child) as ExampleNode);
      }
    }
  }

  return {
    type: "exampleSet",
    id,
    title,
    description,
    children,
  };
}

export const exampleTransformer: DirectiveTransformer = {
  name: "example",
  directives: ["example-set", "example"],

  canHandle(name: string): boolean {
    return name === "example-set" || name === "example";
  },

  transform(directive: DirectiveNode) {
    if (directive.name === "example-set") {
      return transformExampleSet(directive);
    }
    return transformExample(directive);
  },
};
