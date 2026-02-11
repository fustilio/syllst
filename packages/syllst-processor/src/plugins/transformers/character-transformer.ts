/**
 * Character Directive Transformer
 *
 * Handles: :::character-set, ::character
 */

import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type {
  CharacterSetNode,
  CharacterItemNode,
  CharacterType,
  PhoneticCategory,
} from "@syllst/core/types";
import {
  parseTranscription,
  extractDataAttributes,
  parseTags,
} from "./shared/helpers.js";

function transformCharacterItem(
  directive: DirectiveNode
): Partial<CharacterItemNode> {
  const {
    id = `char-${Math.random().toString(36).substr(2, 9)}`,
    char = "",
    name = "",
    nativeName,
    transcription,
    charType = "consonant",
    preview,
    category,
    tags,
    mnemonic,
    exampleWords,
    notes,
    audioPath,
    canonicalRef,
  } = directive.attributes || {};

  const dataAttrs = extractDataAttributes(directive.attributes);

  const parsedExampleWords = exampleWords
    ? exampleWords.split(",").map((w) => w.trim())
    : undefined;

  return {
    type: "characterItem",
    id,
    char,
    name,
    nativeName,
    transcription: parseTranscription(transcription),
    charType: charType as CharacterType,
    preview,
    category,
    tags: parseTags(tags),
    mnemonic,
    exampleWords: parsedExampleWords,
    notes,
    audioPath,
    canonicalRef,
    value: char,
    data: dataAttrs,
  };
}

function transformCharacterSet(
  directive: DirectiveNode
): Partial<CharacterSetNode> {
  const { id = "", title, description, charType, phoneticCategory } =
    directive.attributes || {};

  const children: CharacterItemNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (
        child.type === "leafDirective" &&
        child.name === "character"
      ) {
        children.push(
          transformCharacterItem(child) as CharacterItemNode
        );
      }
    }
  }

  return {
    type: "characterSet",
    id,
    title,
    description,
    charType: charType as CharacterType | undefined,
    phoneticCategory: phoneticCategory as
      | PhoneticCategory
      | undefined,
    children,
  };
}

export const characterTransformer: DirectiveTransformer = {
  name: "character",
  directives: ["character-set", "character"],

  canHandle(name: string): boolean {
    return name === "character-set" || name === "character";
  },

  transform(directive: DirectiveNode) {
    if (directive.name === "character-set") {
      return transformCharacterSet(directive);
    }
    return transformCharacterItem(directive);
  },
};
