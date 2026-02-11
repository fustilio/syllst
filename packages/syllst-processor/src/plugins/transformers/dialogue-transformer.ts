/**
 * Dialogue Directive Transformer
 *
 * Handles: :::dialogue, ::turn, ::cultural-note
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type {
  DirectiveNode,
  TransformContext,
} from "./shared/types.js";
import type {
  DialogueNode,
  DialogueTurnNode,
  DialogueParticipant,
} from "@syllst/core/types";
import {
  parseGenderVariants,
  collectSiblingContent,
} from "./shared/helpers.js";

/**
 * Extract turn content from a list of nodes (children or
 * siblings). Supports `transcription:` annotations.
 */
function extractTurnContent(nodes: any[]): {
  text: string;
  translation: string;
  transcription?: string;
} {
  let text = "";
  let translation = "";
  let transcription: string | undefined;

  for (const child of nodes) {
    if (child.type === "paragraph") {
      const content = toString(child);
      if (content.startsWith("#")) {
        const match = content.match(
          /^#\s*(\S+):\s*(.+)$/
        );
        if (match) {
          const [, annotationType, value] = match;
          if (annotationType === "transcription") {
            transcription = value ?? "";
          } else {
            translation = value ?? "";
          }
        }
      } else if (!text) {
        text = content;
      }
    } else if (child.type === "heading") {
      const content = toString(child);
      const match = content.match(/^(\S+):\s*(.+)$/);
      if (match) {
        const [, annotationType, value] = match;
        if (annotationType === "transcription") {
          transcription = value ?? "";
        } else {
          translation = value ?? "";
        }
      }
    } else if (child.type === "text") {
      if (!text) {
        text = child.value || "";
      }
    }
  }

  return { text, translation, transcription };
}

function transformDialogueTurnWithSiblings(
  directive: DirectiveNode,
  siblingContent: any[] = []
): Partial<DialogueTurnNode> {
  const { speaker = "unknown" } =
    directive.attributes || {};

  let content = extractTurnContent(
    directive.children || []
  );

  if (!content.text && siblingContent.length > 0) {
    content = extractTurnContent(siblingContent);
  }

  const { text, translation, transcription } = content;
  const { hasVariants, variants, masculine } =
    parseGenderVariants(text);

  return {
    type: "dialogueTurn",
    speakerId: speaker,
    text,
    genderVariants: hasVariants ? variants : undefined,
    transcription,
    translation: translation || "",
    value: masculine,
  };
}

function transformDialogue(
  directive: DirectiveNode
): Partial<DialogueNode> {
  const {
    id = `dialogue-${Math.random().toString(36).substr(2, 9)}`,
    context,
    lang,
  } = directive.attributes || {};

  const participants: DialogueParticipant[] = [];
  const children: DialogueTurnNode[] = [];
  let culturalNotes: string | undefined;

  if (directive.children) {
    let i = 0;
    while (i < directive.children.length) {
      const child = directive.children[i];

      if (
        (child.type === "leafDirective" ||
          child.type === "containerDirective") &&
        child.name === "turn"
      ) {
        const siblingContent: any[] = [];
        if (child.type === "leafDirective") {
          let j = i + 1;
          while (j < directive.children.length) {
            const nextChild = directive.children[j];
            if (
              nextChild.type === "leafDirective" ||
              nextChild.type === "containerDirective"
            ) {
              break;
            }
            siblingContent.push(nextChild);
            j++;
          }
          i = j;
        } else {
          i++;
        }

        const turn = transformDialogueTurnWithSiblings(
          child,
          siblingContent
        );
        children.push(turn as DialogueTurnNode);

        const speakerId = turn.speakerId || "unknown";
        if (!participants.some((p) => p.id === speakerId)) {
          participants.push({
            id: speakerId,
            name: child.attributes?.name,
            gender: child.attributes?.gender as
              | "masculine"
              | "feminine"
              | "neutral"
              | undefined,
            role: child.attributes?.role,
          });
        }
        continue;
      }

      if (
        (child.type === "leafDirective" ||
          child.type === "containerDirective") &&
        child.name === "cultural-note"
      ) {
        const siblingContent: any[] = [];
        if (child.type === "leafDirective") {
          let j = i + 1;
          while (j < directive.children.length) {
            const nextChild = directive.children[j];
            if (
              nextChild.type === "leafDirective" ||
              nextChild.type === "containerDirective"
            ) {
              break;
            }
            siblingContent.push(nextChild);
            j++;
          }
          i = j;
        } else {
          i++;
        }

        if (siblingContent.length > 0) {
          culturalNotes = siblingContent
            .map((node) => toString(node))
            .join("\n")
            .trim();
        } else {
          culturalNotes = toString(child);
        }
        continue;
      }

      i++;
    }
  }

  return {
    type: "dialogue",
    id,
    participants,
    context,
    culturalNotes,
    lang,
    children,
  };
}

export const dialogueTransformer: DirectiveTransformer = {
  name: "dialogue",
  directives: ["dialogue", "turn", "cultural-note"],

  canHandle(name: string): boolean {
    return (
      name === "dialogue" ||
      name === "turn" ||
      name === "cultural-note"
    );
  },

  transform(
    directive: DirectiveNode,
    context?: TransformContext
  ) {
    if (directive.name === "dialogue") {
      return transformDialogue(directive);
    }

    if (directive.name === "turn") {
      if (
        directive.type === "leafDirective" &&
        context?.index !== undefined &&
        context?.parent
      ) {
        const siblingContent = collectSiblingContent(
          context.parent,
          context.index
        );
        return transformDialogueTurnWithSiblings(
          directive,
          siblingContent
        );
      }
      return transformDialogueTurnWithSiblings(directive);
    }

    // cultural-note: handled inside dialogue transform
    return null;
  },
};
