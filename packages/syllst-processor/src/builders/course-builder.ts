/**
 * Course Builder
 *
 * Functions for building CourseBundle from multiple lessons.
 * Aggregates lessons, builds indices, and calculates statistics.
 */

import type {
  CourseBundle,
  CourseManifest,
  CourseIndices,
  CourseStatistics,
  DifficultyBreakdown,
  VocabularyIndex,
  VocabularyIndexEntry,
  GrammarRuleIndex,
  GrammarRuleIndexEntry,
  ExerciseIndex,
  ExerciseIndexEntry,
  LessonAstNode,
  SyllabusRoot,
  CEFRLevel,
  GrammarDifficulty,
  ExerciseType,
  SyllabusSourceInfo,
} from '@syllst/core/types';
import {
  isVocabularySetNode,
  isGrammarRuleNode,
  isExerciseNode,
} from '@syllst/core/types';

// ============================================================================
// Options
// ============================================================================

/**
 * Options for building a course bundle
 */
export interface BuildCourseBundleOptions {
  /** Course ID */
  id: string;
  /** Course title */
  title: string;
  /** Course version (semver) */
  version: string;
  /** Target language code */
  language: string;
  /** Source language code (learner's language) */
  sourceLanguage?: string;
  /** Course description */
  description?: string;
  /** Source information */
  source?: SyllabusSourceInfo;
  /** CEFR level range */
  cefrRange?: { min: CEFRLevel; max: CEFRLevel };
  /** Course prerequisites */
  prerequisites?: string[];
  /** Course objectives */
  objectives?: string[];
  /** Custom lesson ordering (array of lesson IDs) */
  lessonOrder?: string[];
  /** Original syllabus root (if bundling from syllabus) */
  syllabusRoot?: SyllabusRoot;
}

// ============================================================================
// Index Builders
// ============================================================================

/**
 * Build vocabulary index from lessons
 */
function buildVocabularyIndex(lessons: LessonAstNode[]): VocabularyIndex {
  const byWord = new Map<string, VocabularyIndexEntry>();
  const byId = new Map<string, VocabularyIndexEntry>();
  const byCategory = new Map<string, VocabularyIndexEntry[]>();
  const byLesson = new Map<string, VocabularyIndexEntry[]>();

  for (const lesson of lessons) {
    const lessonEntries: VocabularyIndexEntry[] = [];

    for (const child of lesson.children) {
      if (isVocabularySetNode(child)) {
        for (const item of child.children) {
          // Check if word already exists
          let entry = byWord.get(item.word);

          if (entry) {
            // Add this lesson to existing entry
            if (!entry.lessonIds.includes(lesson.id)) {
              entry.lessonIds.push(lesson.id);
            }
          } else {
            // Create new entry
            entry = {
              id: item.id,
              word: item.word,
              translation: item.translation,
              transcription: item.transcription,
              lessonIds: [lesson.id],
              firstAppearance: lesson.id,
              category: item.category,
              tags: item.tags,
            };
            byWord.set(item.word, entry);
            byId.set(item.id, entry);
          }

          lessonEntries.push(entry);

          // Add to category index
          if (item.category) {
            const categoryEntries = byCategory.get(item.category) || [];
            if (!categoryEntries.find((e) => e.id === entry!.id)) {
              categoryEntries.push(entry);
            }
            byCategory.set(item.category, categoryEntries);
          }
        }
      }
    }

    byLesson.set(lesson.id, lessonEntries);
  }

  return { byWord, byId, byCategory, byLesson };
}

/**
 * Build grammar rule index from lessons
 */
function buildGrammarRuleIndex(lessons: LessonAstNode[]): GrammarRuleIndex {
  const byId = new Map<string, GrammarRuleIndexEntry>();
  const byLesson = new Map<string, GrammarRuleIndexEntry[]>();
  const dependencies = new Map<string, string[]>();

  for (const lesson of lessons) {
    const lessonEntries: GrammarRuleIndexEntry[] = [];

    for (const child of lesson.children) {
      if (isGrammarRuleNode(child)) {
        // Check if rule already exists
        let entry = byId.get(child.id);

        if (entry) {
          // Add this lesson to existing entry
          if (!entry.lessonIds.includes(lesson.id)) {
            entry.lessonIds.push(lesson.id);
          }
        } else {
          // Create new entry
          entry = {
            id: child.id,
            title: child.title,
            explanation: child.explanation,
            lessonIds: [lesson.id],
            firstAppearance: lesson.id,
            relatedRules: child.relatedRules,
          };
          byId.set(child.id, entry);
        }

        lessonEntries.push(entry);

        // Build dependency graph from relatedRules
        if (child.relatedRules && child.relatedRules.length > 0) {
          dependencies.set(child.id, child.relatedRules);
        }
      }
    }

    byLesson.set(lesson.id, lessonEntries);
  }

  return { byId, byLesson, dependencies };
}

/**
 * Build exercise index from lessons
 */
function buildExerciseIndex(lessons: LessonAstNode[]): ExerciseIndex {
  const byId = new Map<string, ExerciseIndexEntry>();
  const byType = new Map<ExerciseType, ExerciseIndexEntry[]>();
  const byLesson = new Map<string, ExerciseIndexEntry[]>();
  const byDifficulty = new Map<GrammarDifficulty, ExerciseIndexEntry[]>();

  for (const lesson of lessons) {
    const lessonEntries: ExerciseIndexEntry[] = [];

    for (const child of lesson.children) {
      if (isExerciseNode(child)) {
        const entry: ExerciseIndexEntry = {
          id: child.id,
          exerciseType: child.exerciseType,
          lessonId: lesson.id,
          difficulty: child.difficulty,
        };

        byId.set(child.id, entry);
        lessonEntries.push(entry);

        // Add to type index
        const typeEntries = byType.get(child.exerciseType) || [];
        typeEntries.push(entry);
        byType.set(child.exerciseType, typeEntries);

        // Add to difficulty index
        if (child.difficulty) {
          const difficultyEntries = byDifficulty.get(child.difficulty) || [];
          difficultyEntries.push(entry);
          byDifficulty.set(child.difficulty, difficultyEntries);
        }
      }
    }

    byLesson.set(lesson.id, lessonEntries);
  }

  return { byId, byType, byLesson, byDifficulty };
}

/**
 * Build all course indices from lessons
 */
function buildCourseIndices(lessons: LessonAstNode[]): CourseIndices {
  return {
    vocabulary: buildVocabularyIndex(lessons),
    grammarRules: buildGrammarRuleIndex(lessons),
    exercises: buildExerciseIndex(lessons),
  };
}

// ============================================================================
// Difficulty Scoring
// ============================================================================

/**
 * Exercise complexity weights by type
 * Higher weights indicate more difficult exercise types
 */
const EXERCISE_COMPLEXITY_WEIGHTS: Record<ExerciseType, number> = {
  "matching": 1.0,
  "true-false": 1.2,
  "multiple-choice": 1.5,
  "fill-in-blank": 2.0,
  "pattern-practice": 2.5,
  "transformation": 3.0,
  "translation": 3.5,
  "dialogue": 4.0,
  "open-ended": 4.5,
};

/**
 * Calculate exercise complexity score (0-100)
 * Based on weighted average of exercise types
 */
function calculateExerciseComplexity(
  indices: CourseIndices
): number {
  const exercises = Array.from(indices.exercises.byId.values());
  if (exercises.length === 0) return 0;

  let totalWeight = 0;
  for (const exercise of exercises) {
    totalWeight += EXERCISE_COMPLEXITY_WEIGHTS[exercise.exerciseType] || 1.0;
  }

  const avgWeight = totalWeight / exercises.length;
  // Normalize: matching (1.0) = 0, open-ended (4.5) = 100
  const minWeight = 1.0;
  const maxWeight = 4.5;
  return Math.min(100, ((avgWeight - minWeight) / (maxWeight - minWeight)) * 100);
}

/**
 * Calculate vocabulary density score (0-100)
 * Measures vocabulary items per exercise/lesson ratio
 */
function calculateVocabularyDensity(
  lessons: LessonAstNode[],
  indices: CourseIndices
): number {
  const totalVocab = indices.vocabulary.byWord.size;
  const totalExercises = indices.exercises.byId.size;
  const totalLessons = lessons.length;

  if (totalLessons === 0) return 0;

  // Calculate vocab-per-lesson ratio
  const vocabPerLesson = totalVocab / totalLessons;

  // Calculate vocab-per-exercise ratio (if exercises exist)
  const vocabPerExercise = totalExercises > 0
    ? totalVocab / totalExercises
    : vocabPerLesson;

  // Higher density = harder
  // Normalize based on typical ranges:
  // Low: 1-5 vocab per lesson = 0-30
  // Medium: 5-15 vocab per lesson = 30-70
  // High: 15+ vocab per lesson = 70-100
  const densityScore = Math.min(100, (vocabPerLesson / 20) * 100);

  // Bonus for high vocab-per-exercise ratio (indicates complex exercises)
  const exerciseBonus = Math.min(20, vocabPerExercise * 5);

  return Math.min(100, densityScore + exerciseBonus);
}

/**
 * Calculate maximum prerequisite depth using BFS
 */
function calculatePrerequisiteDepth(
  lessons: LessonAstNode[],
  indices: CourseIndices
): number {
  // Build lesson prerequisite map
  const lessonPrereqs = new Map<string, string[]>();
  for (const lesson of lessons) {
    if (lesson.metadata?.prerequisites) {
      lessonPrereqs.set(lesson.id, lesson.metadata.prerequisites);
    }
  }

  // Build grammar rule dependency map (already in indices)
  const grammarDeps = indices.grammarRules.dependencies;

  // Find max depth for lesson prerequisites
  let maxLessonDepth = 0;
  for (const lesson of lessons) {
    const depth = getDepth(lesson.id, lessonPrereqs);
    maxLessonDepth = Math.max(maxLessonDepth, depth);
  }

  // Find max depth for grammar rule dependencies
  let maxGrammarDepth = 0;
  for (const ruleId of grammarDeps.keys()) {
    const depth = getDepth(ruleId, grammarDeps);
    maxGrammarDepth = Math.max(maxGrammarDepth, depth);
  }

  // Take the maximum of both
  const maxDepth = Math.max(maxLessonDepth, maxGrammarDepth);

  // Normalize: 0-2 levels = 0-40, 3-5 levels = 40-80, 6+ = 80-100
  return Math.min(100, (maxDepth / 6) * 100);
}

/**
 * Get depth of a node in a dependency graph using BFS
 */
function getDepth(
  nodeId: string,
  graph: Map<string, string[]>
): number {
  const visited = new Set<string>();
  let depth = 0;
  let queue: string[] = [nodeId];

  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const id of queue) {
      if (visited.has(id)) continue;
      visited.add(id);

      const deps = graph.get(id);
      if (deps && deps.length > 0) {
        nextQueue.push(...deps);
      }
    }

    if (nextQueue.length > 0) {
      depth++;
      queue = nextQueue;
    } else {
      break;
    }
  }

  return depth;
}

/**
 * Calculate content mix score (0-100)
 * Higher score for lessons with diverse content types
 */
function calculateContentMixScore(
  lessons: LessonAstNode[]
): number {
  if (lessons.length === 0) return 0;

  let totalMixScore = 0;

  for (const lesson of lessons) {
    const contentTypes = new Set<string>();

    for (const child of lesson.children) {
      contentTypes.add(child.type);
    }

    // Score based on diversity (1 type = 20, 2 types = 40, 3+ types = 60+)
    const mixScore = Math.min(100, contentTypes.size * 20);
    totalMixScore += mixScore;
  }

  return totalMixScore / lessons.length;
}

/**
 * Calculate overall difficulty breakdown
 */
function calculateDifficultyBreakdown(
  lessons: LessonAstNode[],
  indices: CourseIndices
): DifficultyBreakdown {
  const exerciseComplexity = calculateExerciseComplexity(indices);
  const vocabularyDensity = calculateVocabularyDensity(lessons, indices);
  const prerequisiteDepth = calculatePrerequisiteDepth(lessons, indices);
  const contentMixScore = calculateContentMixScore(lessons);

  // Weighted average: exercises and vocab are most important
  const score = Math.round(
    exerciseComplexity * 0.35 +
    vocabularyDensity * 0.35 +
    prerequisiteDepth * 0.15 +
    contentMixScore * 0.15
  );

  // Determine overall level based on score
  let overall: 'beginner' | 'intermediate' | 'advanced';
  if (score < 35) {
    overall = 'beginner';
  } else if (score < 70) {
    overall = 'intermediate';
  } else {
    overall = 'advanced';
  }

  return {
    overall,
    score,
    factors: {
      exerciseComplexity,
      vocabularyDensity,
      prerequisiteDepth,
      contentMixScore,
    },
  };
}

// ============================================================================
// Statistics Calculator
// ============================================================================

/**
 * Calculate course statistics from lessons and indices
 */
function calculateCourseStatistics(
  lessons: LessonAstNode[],
  indices: CourseIndices
): CourseStatistics {
  // Count vocabulary items
  let totalVocabularyItems = 0;
  for (const lesson of lessons) {
    for (const child of lesson.children) {
      if (isVocabularySetNode(child)) {
        totalVocabularyItems += child.children.length;
      }
    }
  }

  // CEFR level coverage
  const cefrLevelCoverage: Partial<Record<CEFRLevel, number>> = {};
  for (const lesson of lessons) {
    const levels = Array.isArray(lesson.cefrLevel)
      ? lesson.cefrLevel
      : lesson.cefrLevel
        ? [lesson.cefrLevel]
        : [];
    for (const level of levels) {
      cefrLevelCoverage[level] = (cefrLevelCoverage[level] || 0) + 1;
    }
  }

  // Difficulty distribution
  const difficultyDistribution: Partial<Record<GrammarDifficulty, number>> = {};
  for (const lesson of lessons) {
    if (lesson.difficulty) {
      difficultyDistribution[lesson.difficulty] =
        (difficultyDistribution[lesson.difficulty] || 0) + 1;
    }
  }

  // Exercise type distribution
  const exerciseTypeDistribution: Partial<Record<ExerciseType, number>> = {};
  for (const [type, entries] of indices.exercises.byType) {
    exerciseTypeDistribution[type] = entries.length;
  }

  // Estimated total time
  let estimatedTotalTime = 0;
  for (const lesson of lessons) {
    if (lesson.metadata?.estimatedTime) {
      estimatedTotalTime += lesson.metadata.estimatedTime;
    }
  }

  // Calculate difficulty breakdown
  const difficultyBreakdown = calculateDifficultyBreakdown(lessons, indices);

  return {
    totalLessons: lessons.length,
    totalVocabularyItems,
    uniqueVocabularyItems: indices.vocabulary.byWord.size,
    totalGrammarRules: indices.grammarRules.byId.size,
    totalExercises: indices.exercises.byId.size,
    estimatedTotalTime,
    cefrLevelCoverage,
    difficultyDistribution,
    exerciseTypeDistribution,
    difficultyBreakdown,
  };
}

// ============================================================================
// Course Builder
// ============================================================================

/**
 * Build a course bundle from an array of lessons
 *
 * @param lessons - Array of lessons to bundle
 * @param options - Bundle options
 * @returns CourseBundle with indices and statistics
 *
 * @example
 * ```typescript
 * import { buildCourseBundle, buildLessonFromMDX } from '@syllst/processor';
 *
 * // Build lessons from MDX files
 * const lessons = await Promise.all(
 *   mdxFiles.map(file => buildLessonFromMDX(file))
 * );
 *
 * // Create course bundle
 * const bundle = buildCourseBundle(lessons, {
 *   id: 'thai-basics',
 *   title: 'Thai for Beginners',
 *   version: '1.0.0',
 *   language: 'th',
 *   sourceLanguage: 'en',
 * });
 *
 * // Access indices
 * const word = bundle.indices.vocabulary.byWord.get('สวัสดี');
 * ```
 */
export function buildCourseBundle(
  lessons: LessonAstNode[],
  options: BuildCourseBundleOptions
): CourseBundle {
  // Sort lessons by order field, or use provided order
  const orderedLessons = options.lessonOrder
    ? options.lessonOrder
        .map((id) => lessons.find((l) => l.id === id))
        .filter((l): l is LessonAstNode => l !== undefined)
    : [...lessons].sort((a, b) => a.order - b.order);

  // Build indices
  const indices = buildCourseIndices(orderedLessons);

  // Calculate statistics
  const statistics = calculateCourseStatistics(orderedLessons, indices);

  // Create manifest
  const manifest: CourseManifest = {
    id: options.id,
    title: options.title,
    version: options.version,
    language: options.language,
    sourceLanguage: options.sourceLanguage,
    bundledAt: new Date().toISOString(),
    lessonOrder: orderedLessons.map((l) => l.id),
    source: options.source,
    description: options.description,
    cefrRange: options.cefrRange,
    prerequisites: options.prerequisites,
    objectives: options.objectives,
  };

  return {
    type: 'courseBundle',
    manifest,
    lessons: orderedLessons,
    indices,
    statistics,
    syllabusRoot: options.syllabusRoot,
  };
}

/**
 * Build a course bundle from a syllabus root
 *
 * Extracts all lessons from the syllabus hierarchy and creates a bundle.
 *
 * @param syllabus - Syllabus root node
 * @param options - Additional bundle options (overrides syllabus metadata)
 * @returns CourseBundle
 */
export function buildCourseBundleFromSyllabus(
  syllabus: SyllabusRoot,
  options?: Partial<BuildCourseBundleOptions>
): CourseBundle {
  // Extract all lessons from the syllabus hierarchy
  const lessons: LessonAstNode[] = [];

  function extractLessons(children: unknown[]): void {
    for (const child of children) {
      if (typeof child === 'object' && child !== null && 'type' in child) {
        const node = child as { type: string; children?: unknown[] };
        if (node.type === 'lesson') {
          lessons.push(node as unknown as LessonAstNode);
        } else if (node.children && Array.isArray(node.children)) {
          extractLessons(node.children);
        }
      }
    }
  }

  extractLessons(syllabus.children);

  // Build bundle with syllabus metadata as defaults
  return buildCourseBundle(lessons, {
    id: options?.id || syllabus.meta.id,
    title: options?.title || syllabus.meta.title,
    version: options?.version || syllabus.meta.version,
    language: options?.language || syllabus.meta.language,
    source: options?.source || syllabus.meta.source,
    syllabusRoot: syllabus,
    ...options,
  });
}
