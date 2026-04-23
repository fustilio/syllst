/**
 * Vocabulary Item → SRS Card Generators
 *
 * Converts VocabularyItemNode into recognition, production, and
 * comprehension cards.
 */

import type {
  VocabularyItemNode,
  Transcription,
} from '@syllst/core';
import { isVocabularyItemNode } from '@syllst/core';
import type { Node as UnistNode } from 'unist';
import type { SrsCard, ActivityType, GeneratorOptions } from '../types.js';

function formatTranscription(t: Transcription | undefined): string | undefined {
  if (!t) return undefined;
  if (typeof t === 'string') return t;
  return t.primary ?? t.ipa;
}

export function generateVocabularyCards(
  node: unknown,
  options: GeneratorOptions = {}
): SrsCard[] {
  if (!isVocabularyItemNode(node as UnistNode)) return [];

  const item = node as VocabularyItemNode;
  const activities = options.activityTypes ??
    (['recognition', 'production', 'comprehension'] as ActivityType[]);

  const cards: SrsCard[] = [];
  const transcription = options.includeTranscription !== false
    ? formatTranscription(item.transcription)
    : undefined;

  for (const activity of activities) {
    const card = buildCard(item, activity, transcription, options);
    if (card) cards.push(card);
  }

  if (options.maxCardsPerNode && cards.length > options.maxCardsPerNode) {
    return cards.slice(0, options.maxCardsPerNode);
  }

  return cards;
}

function buildCard(
  item: VocabularyItemNode,
  activity: ActivityType,
  transcription: string | undefined,
  options: GeneratorOptions
): SrsCard | null {
  const baseRef = item.id;
  const prefix = options.tagPrefix ? `${options.tagPrefix}:` : '';

  switch (activity) {
    case 'recognition': {
      // Show target word → recall translation
      const context = options.includeContext !== false ? item.example : undefined;
      return {
        id: `${baseRef}:recognition`,
        sourceRef: baseRef,
        sourceType: 'vocabularyItem',
        activityType: 'recognition',
        prompt: {
          text: item.word,
          transcription,
          context,
        },
        answer: {
          text: item.translation,
          explanation: item.definition || item.notes,
        },
        tags: [`${prefix}vocabulary`, `${prefix}recognition`, ...(item.tags ?? [])],
      };
    }

    case 'production': {
      // Show translation (+ transcription hint) → recall target word
      return {
        id: `${baseRef}:production`,
        sourceRef: baseRef,
        sourceType: 'vocabularyItem',
        activityType: 'production',
        prompt: {
          text: item.translation,
          transcription,
        },
        answer: {
          text: item.word,
          alternatives: item.related,
          explanation: item.definition || item.notes,
        },
        tags: [`${prefix}vocabulary`, `${prefix}production`, ...(item.tags ?? [])],
      };
    }

    case 'comprehension': {
      // Cloze-style: example sentence with word blanked
      if (!item.example) return null;
      const clozeText = item.example.replace(
        new RegExp(`\\b${escapeRegex(item.word)}\\b`, 'i'),
        '_____'
      );
      return {
        id: `${baseRef}:comprehension`,
        sourceRef: baseRef,
        sourceType: 'vocabularyItem',
        activityType: 'comprehension',
        prompt: {
          text: clozeText,
          transcription,
        },
        answer: {
          text: item.word,
          explanation: item.translation,
        },
        tags: [`${prefix}vocabulary`, `${prefix}comprehension`, ...(item.tags ?? [])],
      };
    }

    default:
      return null;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
