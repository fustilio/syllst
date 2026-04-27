/**
 * Syllabi Comparison Types
 *
 * Multi-level comparison framework for syllst syllabi.
 */

import type { SyllabusRoot, CourseBundle, LessonAstNode } from '@syllst/core';

export type ComparisonInput = SyllabusRoot | CourseBundle | LessonAstNode[];

export type ComparisonLevel =
  | 'topic'
  | 'content'
  | 'structural'
  | 'resource';

export interface ComparisonOptions {
  /** Which comparison levels to run (default: all) */
  levels?: ComparisonLevel[];
  /** Minimum similarity for fuzzy text matching (0-1) */
  similarityThreshold?: number;
  /** Normalize text before matching (strip HTML, lowercase, trim) */
  normalizeText?: boolean;
  /** When comparing vocabulary, also match by translation */
  matchByTranslation?: boolean;
  /** Weight for vocabulary in content overlap score */
  vocabWeight?: number;
  /** Weight for grammar rules in content overlap score */
  grammarWeight?: number;
  /** Weight for examples in content overlap score */
  exampleWeight?: number;
}

// ============================================================================
// Topic Coverage
// ============================================================================

export interface TopicCoverageReport {
  /** Topics (categories) present in A but not in B */
  onlyInA: string[];
  /** Topics present in B but not in A */
  onlyInB: string[];
  /** Topics present in both */
  inBoth: string[];
  /** CEFR level coverage in A */
  cefrA: Record<string, number>;
  /** CEFR level coverage in B */
  cefrB: Record<string, number>;
  /** Difficulty distribution in A */
  difficultyA: Record<string, number>;
  /** Difficulty distribution in B */
  difficultyB: Record<string, number>;
  /** Topic coverage score (0-1): inBoth / union */
  score: number;
}

// ============================================================================
// Content Overlap
// ============================================================================

export interface MatchedItem {
  /** Item from syllabus A */
  itemA: string;
  /** Matching item from syllabus B */
  itemB: string;
  /** Similarity score */
  score: number;
}

export interface ContentOverlapReport {
  /** Vocabulary items only in A */
  vocabOnlyInA: string[];
  /** Vocabulary items only in B */
  vocabOnlyInB: string[];
  /** Matched vocabulary items */
  vocabMatched: MatchedItem[];
  /** Vocabulary overlap score (0-1) */
  vocabScore: number;

  /** Grammar rules only in A */
  grammarOnlyInA: string[];
  /** Grammar rules only in B */
  grammarOnlyInB: string[];
  /** Matched grammar rules */
  grammarMatched: MatchedItem[];
  /** Grammar overlap score (0-1) */
  grammarScore: number;

  /** Examples only in A */
  examplesOnlyInA: string[];
  /** Examples only in B */
  examplesOnlyInB: string[];
  /** Matched examples */
  examplesMatched: MatchedItem[];
  /** Example overlap score (0-1) */
  examplesScore: number;

  /** Overall content overlap score (weighted average) */
  overallScore: number;
}

// ============================================================================
// Structural Diff
// ============================================================================

export interface LessonDiff {
  lessonId: string;
  title: string;
  status: 'only-in-a' | 'only-in-b' | 'matched';
  /** If matched, similarity score */
  similarity?: number;
}

export interface StructuralDiffReport {
  /** Number of lessons in A */
  lessonCountA: number;
  /** Number of lessons in B */
  lessonCountB: number;
  /** Lesson-by-lesson diff */
  lessonDiffs: LessonDiff[];
  /** Number of chapters in A */
  chapterCountA: number;
  /** Number of chapters in B */
  chapterCountB: number;
  /** Prerequisite chains in A (lessonId → prerequisites) */
  prerequisitesA: Record<string, string[]>;
  /** Prerequisite chains in B */
  prerequisitesB: Record<string, string[]>;
  /** Structural similarity score (0-1) */
  score: number;
}

// ============================================================================
// Resource Comparison
// ============================================================================

export interface LessonResourceMetrics {
  lessonId: string;
  title: string;
  exampleCount: number;
  exerciseCount: number;
  contentNodeCount: number;
  culturalNotes: boolean;
  estimatedTime?: number;
}

export interface ResourceComparisonReport {
  /** Average examples per lesson */
  avgExamplesPerLessonA: number;
  avgExamplesPerLessonB: number;
  /** Average exercises per lesson */
  avgExercisesPerLessonA: number;
  avgExercisesPerLessonB: number;
  /** Total content nodes (markdown, html, etc.) */
  totalContentNodesA: number;
  totalContentNodesB: number;
  /** Per-lesson resource metrics */
  lessonMetricsA: LessonResourceMetrics[];
  lessonMetricsB: LessonResourceMetrics[];
  /** Which syllabus has richer resources? */
  enrichmentDirection: 'a' | 'b' | 'equal';
  /** Resource comparison score (0-1) */
  score: number;
}

// ============================================================================
// Pluggable Comparison Strategies
// ============================================================================

export interface ComparableItem {
  id: string;
  text: string;
  translation?: string;
}

export interface StrategyMatchedPair {
  itemA: ComparableItem;
  itemB: ComparableItem;
  similarity: number;
}

export interface StrategyMatchResult {
  matched: number;
  onlyInA: number;
  onlyInB: number;
  score: number;
  details: StrategyMatchedPair[];
}

export interface MatchStrategy {
  name: string;
  match(setA: ComparableItem[], setB: ComparableItem[]): Promise<StrategyMatchResult> | StrategyMatchResult;
}

// ============================================================================
// Overall Report
// ============================================================================

export interface ComparisonReport {
  syllabusA: { id: string; title: string };
  syllabusB: { id: string; title: string };
  topicCoverage: TopicCoverageReport;
  contentOverlap: ContentOverlapReport;
  structuralDiff: StructuralDiffReport;
  resourceComparison: ResourceComparisonReport;
}
