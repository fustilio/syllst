/**
 * Example Node → SRS Card Generators
 *
 * Converts ExampleNode into recognition, production, and
 * comprehension cards.
 */

import type { ExampleNode } from '@syllst/core';
import { isExampleNode } from '@syllst/core';
import type { Node as UnistNode } from 'unist';
import type { SrsCard, ActivityType, GeneratorOptions } from '../types.js';

function formatTranscription(t: unknown): string | undefined {
  if (!t) return undefined;
  if (typeof t === 'string') return t;
  if (typeof t === 'object' && t !== null) {
    const obj = t as Record<string, unknown>;
    return (obj.primary as string) ?? (obj.ipa as string) ?? undefined;
  }
  return undefined;
}

export function generateExampleCards(
  node: unknown,
  options: GeneratorOptions = {}
): SrsCard[] {
  if (!isExampleNode(node as UnistNode)) return [];

  const example = node as ExampleNode;
  const activities = options.activityTypes ??
    (['recognition', 'production'] as ActivityType[]);

  const cards: SrsCard[] = [];
  const transcription = options.includeTranscription !== false
    ? formatTranscription(example.transcription)
    : undefined;

  for (const activity of activities) {
    const card = buildCard(example, activity, transcription, options);
    if (card) cards.push(card);
  }

  if (options.maxCardsPerNode && cards.length > options.maxCardsPerNode) {
    return cards.slice(0, options.maxCardsPerNode);
  }

  return cards;
}

function buildCard(
  example: ExampleNode,
  activity: ActivityType,
  transcription: string | undefined,
  options: GeneratorOptions
): SrsCard | null {
  const baseRef = example.id;
  const prefix = options.tagPrefix ? `${options.tagPrefix}:` : '';

  switch (activity) {
    case 'recognition': {
      // Show target text → recall translation
      return {
        id: `${baseRef}:recognition`,
        sourceRef: baseRef,
        sourceType: 'example',
        activityType: 'recognition',
        prompt: {
          text: example.text,
          transcription,
        },
        answer: {
          text: example.translation,
          explanation: example.notes,
        },
        tags: [`${prefix}example`, `${prefix}recognition`],
      };
    }

    case 'production': {
      // Show translation → recall target text
      return {
        id: `${baseRef}:production`,
        sourceRef: baseRef,
        sourceType: 'example',
        activityType: 'production',
        prompt: {
          text: example.translation,
          transcription,
        },
        answer: {
          text: example.text,
          explanation: example.literalTranslation || example.notes,
        },
        tags: [`${prefix}example`, `${prefix}production`],
      };
    }

    case 'comprehension': {
      // Show target text → transcribe / identify grammar
      const promptText = transcription
        ? `Listen and transcribe:\n\n${example.text}`
        : `Transcribe this sentence:\n\n${example.text}`;

      return {
        id: `${baseRef}:comprehension`,
        sourceRef: baseRef,
        sourceType: 'example',
        activityType: 'comprehension',
        prompt: {
          text: promptText,
          transcription,
        },
        answer: {
          text: example.text,
          explanation: example.translation,
        },
        tags: [`${prefix}example`, `${prefix}comprehension`],
      };
    }

    default:
      return null;
  }
}
