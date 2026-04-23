/**
 * Content Overlap Comparison
 *
 * Compares specific vocabulary, grammar rules, and examples
 * between two syllabi using fuzzy text matching.
 */

import { visit } from 'unist-util-visit';
import type { Node as UnistNode } from 'unist';
import type { ComparisonInput, ContentOverlapReport, MatchedItem, ComparisonOptions } from './types.js';
import { extractLessons, calculateSimilarity } from './utils.js';
import type { LessonAstNode, VocabularyItemNode, GrammarRuleNode, ExampleNode } from '@syllst/core';

interface ContentItem {
  id: string;
  text: string;
  translation?: string;
}

export function compareContentOverlap(
  a: ComparisonInput,
  b: ComparisonInput,
  options: ComparisonOptions = {}
): ContentOverlapReport {
  const lessonsA = extractLessons(a);
  const lessonsB = extractLessons(b);

  const vocabA = extractVocabulary(lessonsA);
  const vocabB = extractVocabulary(lessonsB);
  const vocabResult = matchItemSets(vocabA, vocabB, options);

  const grammarA = extractGrammar(lessonsA);
  const grammarB = extractGrammar(lessonsB);
  const grammarResult = matchItemSets(grammarA, grammarB, options);

  const examplesA = extractExamples(lessonsA);
  const examplesB = extractExamples(lessonsB);
  const examplesResult = matchItemSets(examplesA, examplesB, options);

  const vocabWeight = options.vocabWeight ?? 0.5;
  const grammarWeight = options.grammarWeight ?? 0.3;
  const exampleWeight = options.exampleWeight ?? 0.2;

  const overallScore =
    vocabResult.score * vocabWeight +
    grammarResult.score * grammarWeight +
    examplesResult.score * exampleWeight;

  return {
    vocabOnlyInA: vocabResult.onlyInA,
    vocabOnlyInB: vocabResult.onlyInB,
    vocabMatched: vocabResult.matched,
    vocabScore: vocabResult.score,

    grammarOnlyInA: grammarResult.onlyInA,
    grammarOnlyInB: grammarResult.onlyInB,
    grammarMatched: grammarResult.matched,
    grammarScore: grammarResult.score,

    examplesOnlyInA: examplesResult.onlyInA,
    examplesOnlyInB: examplesResult.onlyInB,
    examplesMatched: examplesResult.matched,
    examplesScore: examplesResult.score,

    overallScore,
  };
}

function extractVocabulary(lessons: LessonAstNode[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const lesson of lessons) {
    visit(lesson as unknown as UnistNode, 'vocabularyItem', (node) => {
      const item = node as unknown as VocabularyItemNode;
      items.push({
        id: item.id,
        text: item.word,
        translation: item.translation,
      });
    });
  }
  return items;
}

function extractGrammar(lessons: LessonAstNode[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const lesson of lessons) {
    visit(lesson as unknown as UnistNode, 'grammarRule', (node) => {
      const rule = node as unknown as GrammarRuleNode;
      items.push({
        id: rule.id,
        text: rule.title,
        translation: rule.explanation,
      });
    });
  }
  return items;
}

function extractExamples(lessons: LessonAstNode[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const lesson of lessons) {
    visit(lesson as unknown as UnistNode, 'example', (node) => {
      const ex = node as unknown as ExampleNode;
      items.push({
        id: ex.id,
        text: ex.text,
        translation: ex.translation,
      });
    });
  }
  return items;
}

interface MatchResult {
  onlyInA: string[];
  onlyInB: string[];
  matched: MatchedItem[];
  score: number;
}

function matchItemSets(
  setA: ContentItem[],
  setB: ContentItem[],
  options: ComparisonOptions
): MatchResult {
  const threshold = options.similarityThreshold ?? 0.6;
  const matchByTranslation = options.matchByTranslation ?? true;

  const matched: MatchedItem[] = [];
  const matchedB = new Set<number>();

  for (const itemA of setA) {
    let bestMatch: { index: number; score: number } | null = null;

    for (let i = 0; i < setB.length; i++) {
      if (matchedB.has(i)) continue;

      const itemB = setB[i]!;
      let score = calculateSimilarity(itemA.text, itemB.text);

      if (matchByTranslation && itemA.translation && itemB.translation) {
        const transScore = calculateSimilarity(itemA.translation, itemB.translation);
        score = Math.max(score, transScore);
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { index: i, score };
      }
    }

    if (bestMatch && bestMatch.score >= threshold) {
      matched.push({
        itemA: itemA.text,
        itemB: setB[bestMatch.index]!.text,
        score: bestMatch.score,
      });
      matchedB.add(bestMatch.index);
    }
  }

  const matchedAIds = new Set(matched.map((m) => m.itemA));
  const onlyInA = setA.filter((a) => !matchedAIds.has(a.text)).map((a) => a.text);

  const onlyInB = setB
    .filter((_, i) => !matchedB.has(i))
    .map((b) => b.text);

  const unionSize = setA.length + setB.length - matched.length;
  const score = unionSize > 0 ? matched.length / unionSize : 0;

  return { onlyInA, onlyInB, matched, score };
}
