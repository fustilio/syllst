/**
 * Grammar Rule → SRS Card Generators
 *
 * Converts GrammarRuleNode into recognition, production, and
 * comprehension cards.
 */

import type { GrammarRuleNode } from '@syllst/core';
import { isGrammarRuleNode } from '@syllst/core';
import type { Node as UnistNode } from 'unist';
import type { SrsCard, ActivityType, GeneratorOptions } from '../types.js';

export function generateGrammarCards(
  node: unknown,
  options: GeneratorOptions = {}
): SrsCard[] {
  if (!isGrammarRuleNode(node as UnistNode)) return [];

  const rule = node as GrammarRuleNode;
  const activities = options.activityTypes ??
    (['recognition', 'production'] as ActivityType[]);

  const cards: SrsCard[] = [];

  for (const activity of activities) {
    const card = buildCard(rule, activity, options);
    if (card) cards.push(card);
  }

  if (options.maxCardsPerNode && cards.length > options.maxCardsPerNode) {
    return cards.slice(0, options.maxCardsPerNode);
  }

  return cards;
}

function buildCard(
  rule: GrammarRuleNode,
  activity: ActivityType,
  options: GeneratorOptions
): SrsCard | null {
  const baseRef = rule.id;
  const prefix = options.tagPrefix ? `${options.tagPrefix}:` : '';

  // Extract example text from children (ExampleNode or ContentNode)
  const exampleText = rule.children
    .find((c) => c.type === 'example' && 'text' in c)?.text;

  switch (activity) {
    case 'recognition': {
      // Show example sentence → identify the rule
      const promptText = exampleText
        ? `What grammar rule does this illustrate?\n\n${exampleText}`
        : `What is the grammar rule: "${rule.title}"?`;

      return {
        id: `${baseRef}:recognition`,
        sourceRef: baseRef,
        sourceType: 'grammarRule',
        activityType: 'recognition',
        prompt: { text: promptText },
        answer: {
          text: rule.title,
          explanation: rule.explanation,
        },
        tags: [`${prefix}grammar`, `${prefix}recognition`],
      };
    }

    case 'production': {
      // Show rule + example with blank → fill in correct form
      if (!exampleText) return null;
      // Simple heuristic: if the rule title appears in the example, cloze it
      const clozeText = exampleText.replace(
        new RegExp(`\\b${escapeRegex(rule.title)}\\b`, 'i'),
        '_____'
      );

      return {
        id: `${baseRef}:production`,
        sourceRef: baseRef,
        sourceType: 'grammarRule',
        activityType: 'production',
        prompt: {
          text: `Apply the rule "${rule.title}":\n\n${clozeText}`,
        },
        answer: {
          text: exampleText,
          explanation: rule.explanation,
        },
        tags: [`${prefix}grammar`, `${prefix}production`],
      };
    }

    case 'comprehension': {
      // Show rule explanation → identify the rule title
      return {
        id: `${baseRef}:comprehension`,
        sourceRef: baseRef,
        sourceType: 'grammarRule',
        activityType: 'comprehension',
        prompt: {
          text: `Which rule is described by:\n\n${rule.explanation}`,
        },
        answer: {
          text: rule.title,
          explanation: rule.exceptions,
        },
        tags: [`${prefix}grammar`, `${prefix}comprehension`],
      };
    }

    default:
      return null;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
