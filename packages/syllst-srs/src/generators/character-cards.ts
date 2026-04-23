/**
 * Character Item → SRS Card Generators
 *
 * Converts CharacterItemNode into recognition and production cards.
 */

import type { CharacterItemNode } from '@syllst/core';
import { isCharacterItemNode } from '@syllst/core';
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

export function generateCharacterCards(
  node: unknown,
  options: GeneratorOptions = {}
): SrsCard[] {
  if (!isCharacterItemNode(node as UnistNode)) return [];

  const char = node as CharacterItemNode;
  const activities = options.activityTypes ??
    (['recognition', 'production'] as ActivityType[]);

  const cards: SrsCard[] = [];
  const transcription = options.includeTranscription !== false
    ? formatTranscription(char.transcription)
    : undefined;

  for (const activity of activities) {
    const card = buildCard(char, activity, transcription, options);
    if (card) cards.push(card);
  }

  if (options.maxCardsPerNode && cards.length > options.maxCardsPerNode) {
    return cards.slice(0, options.maxCardsPerNode);
  }

  return cards;
}

function buildCard(
  char: CharacterItemNode,
  activity: ActivityType,
  transcription: string | undefined,
  options: GeneratorOptions
): SrsCard | null {
  const baseRef = char.id;
  const prefix = options.tagPrefix ? `${options.tagPrefix}:` : '';
  const exampleWords = char.exampleWords?.join(', ');

  switch (activity) {
    case 'recognition': {
      // Show character → recall name + sound
      const context = exampleWords
        ? `Example words: ${exampleWords}`
        : undefined;

      return {
        id: `${baseRef}:recognition`,
        sourceRef: baseRef,
        sourceType: 'characterItem',
        activityType: 'recognition',
        prompt: {
          text: char.char,
          context,
        },
        answer: {
          text: char.name,
          explanation: transcription || char.notes,
        },
        tags: [`${prefix}character`, `${prefix}recognition`, char.charType, ...(char.tags ?? [])],
      };
    }

    case 'production': {
      // Show name/transcription → recall character
      const promptText = transcription
        ? `${char.name} (${transcription})`
        : char.name;

      return {
        id: `${baseRef}:production`,
        sourceRef: baseRef,
        sourceType: 'characterItem',
        activityType: 'production',
        prompt: {
          text: promptText,
        },
        answer: {
          text: char.char,
          explanation: char.notes,
        },
        tags: [`${prefix}character`, `${prefix}production`, char.charType, ...(char.tags ?? [])],
      };
    }

    case 'comprehension': {
      // Show character + hear audio → identify sound (if audio available)
      if (!char.audioPath) return null;

      return {
        id: `${baseRef}:comprehension`,
        sourceRef: baseRef,
        sourceType: 'characterItem',
        activityType: 'comprehension',
        prompt: {
          text: `What sound does this character make?`,
          context: `Character: ${char.char}`,
          audioRef: char.audioPath,
        },
        answer: {
          text: char.name,
          explanation: transcription || char.notes,
        },
        tags: [`${prefix}character`, `${prefix}comprehension`, char.charType, ...(char.tags ?? [])],
      };
    }

    default:
      return null;
  }
}
