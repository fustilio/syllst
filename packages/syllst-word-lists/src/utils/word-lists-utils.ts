/**
 * Word List Utilities
 *
 * Factory functions and utilities for creating and managing word lists
 * across all language packages. These utilities ensure consistent API
 * surface and support the single source of truth principle.
 */

import type {
  ExamGrade,
  WordListDifficulty,
  WordListItem,
  WordListSet,
} from '../types/word-lists';

/**
 * Configuration for creating word list utilities
 */
export type WordListUtilsConfig = {
  /** Array of word list sets */
  wordListSets: WordListSet[];
};

/**
 * Creates word list utilities from configuration
 * This factory function provides a standard API for word list operations
 */
export function createWordListUtils(config: WordListUtilsConfig) {
  const { wordListSets } = config;

  return {
    /**
     * Get all word list sets
     */
    getAllWordListSets(): WordListSet[] {
      return wordListSets;
    },

    /**
     * Get word list set by ID
     */
    getWordListSetById(id: string): WordListSet | undefined {
      return wordListSets.find((set) => set.id === id);
    },

    /**
     * Get word list sets by difficulty
     */
    getWordListSetsByDifficulty(difficulty: WordListDifficulty): WordListSet[] {
      return wordListSets.filter((set) => set.difficulty === difficulty);
    },

    /**
     * Get word list sets by exam grade
     */
    getWordListSetsByExamGrade(grade: ExamGrade): WordListSet[] {
      return wordListSets.filter((set) => set.examGrade === grade);
    },

    /**
     * Get word list sets by category
     */
    getWordListSetsByCategory(category: string): WordListSet[] {
      return wordListSets.filter((set) => set.category === category);
    },

    /**
     * Get word list sets by category and subcategory
     */
    getWordListSetsByCategoryAndSubcategory(
      category: string,
      subcategory?: string,
    ): WordListSet[] {
      return wordListSets.filter((set) => {
        if (set.category !== category) return false;
        if (subcategory !== undefined) {
          return set.subcategory === subcategory;
        }
        return true;
      });
    },

    /**
     * Get all unique categories
     */
    getWordListCategories(): string[] {
      const categories = new Set<string>();
      wordListSets.forEach((set) => {
        if (set.category) {
          categories.add(set.category);
        }
      });
      return Array.from(categories).sort();
    },

    /**
     * Get all unique subcategories for a given category
     */
    getWordListSubcategories(category: string): string[] {
      const subcategories = new Set<string>();
      wordListSets.forEach((set) => {
        if (set.category === category && set.subcategory) {
          subcategories.add(set.subcategory);
        }
      });
      return Array.from(subcategories).sort();
    },

    /**
     * Get all words from all sets
     */
    getAllWordListItems(): WordListItem[] {
      const allWords: WordListItem[] = [];
      wordListSets.forEach((set) => {
        allWords.push(...set.words);
      });
      return allWords;
    },

    /**
     * Get unique words from all sets (deduplicated)
     */
    getUniqueWords(): string[] {
      const words = new Set<string>();
      wordListSets.forEach((set) => {
        set.words.forEach((item) => {
          words.add(item.word);
        });
      });
      return Array.from(words);
    },

    /**
     * Search word lists by word
     */
    searchWordLists(query: string): WordListItem[] {
      const lowerQuery = query.toLowerCase();
      const results: WordListItem[] = [];

      wordListSets.forEach((set) => {
        set.words.forEach((item) => {
          if (
            item.word.includes(query) ||
            item.translation?.toLowerCase().includes(lowerQuery) ||
            item.transliteration?.toLowerCase().includes(lowerQuery)
          ) {
            results.push(item);
          }
        });
      });

      return results;
    },

    /**
     * Get word list statistics
     */
    getWordListStats(): {
      totalSets: number;
      totalWords: number;
      byDifficulty: Record<WordListDifficulty, number>;
      byExamGrade: Record<ExamGrade, number>;
      byCategory: Record<string, number>;
    } {
      const stats = {
        totalSets: wordListSets.length,
        totalWords: 0,
        byDifficulty: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
        } as Record<WordListDifficulty, number>,
        byExamGrade: {
          'Pre-A1': 0,
          A1: 0,
          A2: 0,
          B1: 0,
          B2: 0,
          C1: 0,
          C2: 0,
        } as Record<ExamGrade, number>,
        byCategory: {} as Record<string, number>,
      };

      wordListSets.forEach((set) => {
        const wordCount = set.words.length;
        stats.totalWords += wordCount;

        if (set.difficulty) {
          stats.byDifficulty[set.difficulty] += wordCount;
        }
        if (set.examGrade) {
          stats.byExamGrade[set.examGrade] += wordCount;
        }
        if (set.category) {
          const categoryKey = set.subcategory
            ? `${set.category} > ${set.subcategory}`
            : set.category;
          stats.byCategory[categoryKey] =
            (stats.byCategory[categoryKey] || 0) + wordCount;
        }
      });

      return stats;
    },
  };
}
