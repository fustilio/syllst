/**
 * Vocabulary Directive Transformer
 *
 * Handles: :::vocabulary-set, ::vocab
 */

import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type {
  VocabularySetNode,
  VocabularyItemNode,
} from "@syllst/core/types";
import {
  parseTranscription,
  extractDataAttributes,
  parseTags,
} from "./shared/helpers.js";

function transformVocabularyItem(
  directive: DirectiveNode
): Partial<VocabularyItemNode> {
  const {
    id = `vocab-${Math.random().toString(36).substr(2, 9)}`,
    word = "",
    translation = "",
    transcription,
    definition,
    preview,
    category,
    tags,
    partOfSpeech,
    notes,
    example,
  } = directive.attributes || {};

  const dataAttrs = extractDataAttributes(directive.attributes);

  return {
    type: "vocabularyItem",
    id,
    word,
    transcription: parseTranscription(transcription),
    translation,
    definition,
    preview,
    category,
    tags: parseTags(tags),
    partOfSpeech,
    notes,
    example,
    value: word,
    data: dataAttrs,
  };
}

function transformVocabularySet(
  directive: DirectiveNode
): Partial<VocabularySetNode> {
  const { id = "", title, description } =
    directive.attributes || {};

  const children: VocabularyItemNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (
        child.type === "leafDirective" &&
        child.name === "vocab"
      ) {
        children.push(
          transformVocabularyItem(child) as VocabularyItemNode
        );
      }
    }
  }

  return {
    type: "vocabularySet",
    id,
    title,
    description,
    children,
  };
}

export const vocabularyTransformer: DirectiveTransformer = {
  name: "vocabulary",
  directives: ["vocabulary-set", "vocab"],

  canHandle(name: string): boolean {
    return name === "vocabulary-set" || name === "vocab";
  },

  transform(directive: DirectiveNode) {
    if (directive.name === "vocabulary-set") {
      return transformVocabularySet(directive);
    }
    return transformVocabularyItem(directive);
  },
};
