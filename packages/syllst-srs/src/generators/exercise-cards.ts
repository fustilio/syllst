/**
 * Exercise Node → SRS Card Generators
 *
 * Converts ExerciseNode into SRS cards that mirror the exercise
 * but are presented as single SRS items.
 */

import type { ExerciseNode } from '@syllst/core';
import { isExerciseNode } from '@syllst/core';
import type { Node as UnistNode } from 'unist';
import type { SrsCard, ActivityType, GeneratorOptions } from '../types.js';

function firstAnswer(answer: string | string[] | undefined): string {
  if (Array.isArray(answer)) return answer[0] ?? '';
  return answer ?? '';
}

function allAnswers(answer: string | string[] | undefined): string {
  if (Array.isArray(answer)) return answer.join(' / ');
  return answer ?? '';
}

export function generateExerciseCards(
  node: unknown,
  options: GeneratorOptions = {}
): SrsCard[] {
  if (!isExerciseNode(node as UnistNode)) return [];

  const exercise = node as ExerciseNode;
  const activities = options.activityTypes ??
    (['recognition', 'production'] as ActivityType[]);

  const cards: SrsCard[] = [];

  for (const activity of activities) {
    const card = buildCard(exercise, activity, options);
    if (card) cards.push(card);
  }

  if (options.maxCardsPerNode && cards.length > options.maxCardsPerNode) {
    return cards.slice(0, options.maxCardsPerNode);
  }

  return cards;
}

function buildCard(
  exercise: ExerciseNode,
  activity: ActivityType,
  options: GeneratorOptions
): SrsCard | null {
  const baseRef = exercise.id;
  const prefix = options.tagPrefix ? `${options.tagPrefix}:` : '';

  switch (activity) {
    case 'recognition': {
      // Present the exercise as a recognition card
      return {
        id: `${baseRef}:recognition`,
        sourceRef: baseRef,
        sourceType: 'exercise',
        activityType: 'recognition',
        prompt: {
          text: exercise.question,
        },
        answer: {
          text: firstAnswer(exercise.answer),
          explanation: exercise.explanation,
        },
        difficulty: exercise.difficulty,
        tags: [
          `${prefix}exercise`,
          `${prefix}recognition`,
          exercise.exerciseType,
          ...(exercise.tests ?? []),
        ],
      };
    }

    case 'production': {
      // For production, show exercise items if available
      const itemsText = exercise.items
        ?.map((item, i) => `${i + 1}. ${item.question}`)
        .join('\n');

      return {
        id: `${baseRef}:production`,
        sourceRef: baseRef,
        sourceType: 'exercise',
        activityType: 'production',
        prompt: {
          text: itemsText || exercise.question,
        },
        answer: {
          text: allAnswers(exercise.answer),
          explanation: exercise.explanation,
        },
        difficulty: exercise.difficulty,
        tags: [
          `${prefix}exercise`,
          `${prefix}production`,
          exercise.exerciseType,
          ...(exercise.tests ?? []),
        ],
      };
    }

    case 'comprehension': {
      // Cloze or fill-in-blank style from exercise items
      const itemsText = exercise.items
        ?.map((item, i) => `${i + 1}. ${item.question}${item.hint ? ` (hint: ${item.hint})` : ''}`)
        .join('\n');

      return {
        id: `${baseRef}:comprehension`,
        sourceRef: baseRef,
        sourceType: 'exercise',
        activityType: 'comprehension',
        prompt: {
          text: itemsText || exercise.question,
        },
        answer: {
          text: allAnswers(exercise.answer),
          explanation: exercise.explanation,
        },
        difficulty: exercise.difficulty,
        tags: [
          `${prefix}exercise`,
          `${prefix}comprehension`,
          exercise.exerciseType,
          ...(exercise.tests ?? []),
        ],
      };
    }

    default:
      return null;
  }
}
