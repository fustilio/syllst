/**
 * Phonological Rule Directive Transformer
 *
 * Handles: :::phonological-rule, ::rule-condition
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type {
  PhonologicalRuleNode,
  RuleConditionNode,
  PhonologicalRuleType,
} from "@syllst/core/types";
import { transformExample } from "./example-transformer.js";

function transformRuleCondition(
  directive: DirectiveNode
): Partial<RuleConditionNode> {
  const {
    id,
    result = "",
    example,
    exampleTranscription,
    exampleTranslation,
    notes,
  } = directive.attributes || {};

  let condition: Record<string, string> = {};
  const conditionAttr = directive.attributes?.condition;
  if (conditionAttr) {
    try {
      condition = JSON.parse(conditionAttr);
    } catch {
      condition = { rule: conditionAttr };
    }
  }

  const conditionStr = Object.entries(condition)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  const value = `${conditionStr} → ${result}`;

  return {
    type: "ruleCondition",
    id,
    condition,
    result,
    example,
    exampleTranscription,
    exampleTranslation,
    notes,
    value,
  };
}

function transformPhonologicalRule(
  directive: DirectiveNode
): Partial<PhonologicalRuleNode> {
  const {
    id = "",
    title = "",
    ruleType = "tone",
    description: descAttr,
    exceptions,
    relatedRules,
  } = directive.attributes || {};

  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === "paragraph" && !description) {
        description = toString(child);
      } else if (
        child.type === "leafDirective" &&
        child.name === "rule-condition"
      ) {
        children.push(transformRuleCondition(child));
      } else if (
        child.type === "leafDirective" &&
        child.name === "example"
      ) {
        children.push(transformExample(child));
      } else if (
        child.type === "containerDirective" &&
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
    type: "phonologicalRule",
    id,
    title,
    ruleType: ruleType as PhonologicalRuleType,
    description,
    exceptions,
    relatedRules: relatedRules
      ? relatedRules.split(",").map((r) => r.trim())
      : undefined,
    children,
  };
}

export const phonologicalTransformer: DirectiveTransformer =
  {
    name: "phonological",
    directives: ["phonological-rule", "rule-condition"],

    canHandle(name: string): boolean {
      return (
        name === "phonological-rule" ||
        name === "rule-condition"
      );
    },

    transform(directive: DirectiveNode) {
      if (directive.name === "phonological-rule") {
        return transformPhonologicalRule(directive);
      }
      return transformRuleCondition(directive);
    },
  };
