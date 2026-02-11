/**
 * Shared helper utilities for directive transformers
 *
 * Extracted from remark-syllabus-directives.ts for reuse
 * across individual transformer modules.
 */

import { toString } from "mdast-util-to-string";
import type {
  Transcription,
  TranscriptionObject,
  GenderVariants,
} from "@syllst/core/types";

/**
 * Parse transcription attribute - handles both string and
 * JSON object formats
 *
 * @example
 * parseTranscription("khâao") // returns "khâao"
 * parseTranscription('{"primary": "khâao", "ipa": "/kʰâːw/"}')
 * // returns { primary: "khâao", ipa: "/kʰâːw/" }
 */
export function parseTranscription(
  value: string | undefined
): Transcription | undefined {
  if (!value) return undefined;

  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed.primary) {
        return parsed as TranscriptionObject;
      }
    } catch {
      // Not valid JSON, treat as string
    }
  }

  return value;
}

/**
 * Extract data:* attributes from directive attributes
 *
 * @example
 * extractDataAttributes({ "data:tone": "falling", word: "ข้าว" })
 * // returns { tone: "falling" }
 */
export function extractDataAttributes(
  attributes: Record<string, string> | undefined
): Record<string, unknown> | undefined {
  if (!attributes) return undefined;

  const data: Record<string, unknown> = {};
  let hasData = false;

  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("data:")) {
      const dataKey = key.slice(5);
      try {
        data[dataKey] = JSON.parse(value);
      } catch {
        data[dataKey] = value;
      }
      hasData = true;
    }
  }

  return hasData ? data : undefined;
}

/**
 * Parse comma-separated tags
 */
export function parseTags(
  value: string | undefined
): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
}

/**
 * Parse numbered list items into an array of strings
 */
export function parseListItems(text: string): string[] {
  if (!text) return [];

  const lines = text.split("\n").filter((line) => line.trim());
  const items: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(?:\d+\.|-)?\s*(.+)$/);
    if (match && match[1]) {
      items.push(match[1].trim());
    }
  }

  return items;
}

/**
 * Extract text from a list node, preserving bullet/number
 * prefixes for parseListItems() consumption.
 */
export function extractListText(node: any): string {
  if (node.type !== "list" || !node.children)
    return toString(node);
  return node.children
    .map((item: any, index: number) => {
      const content = toString(item);
      return node.ordered
        ? `${index + 1}. ${content}`
        : `- ${content}`;
    })
    .join("\n");
}

/**
 * Pattern for gender variants: {masculine|feminine}
 */
const GENDER_VARIANT_PATTERN = /\{([^|]+)\|([^}]+)\}/g;

/**
 * Parse gender variant syntax from text
 *
 * @example
 * parseGenderVariants("สวัสดี{ครับ|ค่ะ}")
 * // { hasVariants: true, variants: { masculine: "สวัสดีครับ", feminine: "สวัสดีค่ะ" }, ... }
 */
export function parseGenderVariants(text: string): {
  hasVariants: boolean;
  variants?: GenderVariants;
  masculine: string;
  feminine: string;
} {
  const matches = [...text.matchAll(GENDER_VARIANT_PATTERN)];

  if (matches.length === 0) {
    return {
      hasVariants: false,
      masculine: text,
      feminine: text,
    };
  }

  let masculine = text;
  let feminine = text;

  for (const match of matches) {
    const [fullMatch, maleVariant, femaleVariant] = match;
    masculine = masculine.replace(fullMatch, maleVariant ?? "");
    feminine = feminine.replace(fullMatch, femaleVariant ?? "");
  }

  return {
    hasVariants: true,
    variants: { masculine, feminine },
    masculine,
    feminine,
  };
}

/**
 * Collect sibling content after a directive until the next
 * directive or end
 */
export function collectSiblingContent(
  parent: any,
  startIndex: number
): any[] {
  const siblings: any[] = [];
  if (!parent?.children) return siblings;

  for (
    let j = startIndex + 1;
    j < parent.children.length;
    j++
  ) {
    const sibling = parent.children[j];
    if (
      sibling.type === "leafDirective" ||
      sibling.type === "containerDirective"
    ) {
      break;
    }
    siblings.push(sibling);
  }
  return siblings;
}
