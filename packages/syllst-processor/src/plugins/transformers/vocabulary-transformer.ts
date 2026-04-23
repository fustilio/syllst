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
  const attrs = directive.attributes || {};
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
  } = attrs;

  // Support alias attributes used by ::vocab-item
  const effectiveTranscription = transcription || attrs.pronunciation;
  const effectiveTranslation = translation || attrs.meaning;

  const dataAttrs = extractDataAttributes(directive.attributes);

  return {
    type: "vocabularyItem",
    id,
    word,
    transcription: parseTranscription(effectiveTranscription),
    translation: effectiveTranslation,
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
        (child.name === "vocab" || child.name === "vocab-item")
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
  directives: ["vocabulary-set", "vocab", "vocab-item"],

  canHandle(name: string): boolean {
    return name === "vocabulary-set" || name === "vocab" || name === "vocab-item";
  },

  transform(directive: DirectiveNode) {
    if (directive.name === "vocabulary-set") {
      return transformVocabularySet(directive);
    }
    return transformVocabularyItem(directive);
  },
};
