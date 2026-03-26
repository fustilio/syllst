/**
 * Word List Loader Utilities
 *
 * Browser-safe utilities for loading word lists from JSON imports.
 * Uses Vite's JSON import feature for browser compatibility.
 */

import type { WordListItem, WordListSet } from '../types/word-lists';

/**
 * Compact JSON format type for word lists
 */
export type CompactWordListJson = {
  id: string;
  name: string;
  desc?: string;
  level?: string; // CEFR level (A1, A2, etc.)
  cat?: string; // top-level category
  subcat?: string; // subcategory
  pos?: string; // part of speech (applies to all words)
  difficulty?: string;
  words?: (string | Record<string, unknown>)[];
};

/**
 * Expands compact JSON format to full WordListSet
 */
export function expandWordListJson(data: CompactWordListJson): WordListSet {
  const examGrade = data.level as any;
  const difficulty = data.difficulty as any;
  const category = data.cat;
  const subcategory = data.subcat;

  const expandedWords: WordListItem[] = (data.words || []).map((word) => {
    if (typeof word === 'string') {
      return {
        word,
        partOfSpeech: data.pos,
        difficulty,
        examGrade,
        category,
      };
    }
    return word as WordListItem;
  });

  return {
    id: data.id,
    name: data.name,
    description: data.desc,
    difficulty,
    examGrade,
    category,
    subcategory,
    words: expandedWords,
  };
}

/**
 * Creates a browser-safe word list loader from pre-imported JSON data
 *
 * @param wordLists - Array of word list JSON data (imported via Vite)
 * @returns Object with word list sets and helper functions
 *
 * @example
 * ```ts
 * import list1 from './json/a1/greetings.json' with { type: 'json' };
 * import list2 from './json/a1/numbers.json' with { type: 'json' };
 *
 * const { wordListSets, getWordListSetById } = createBrowserSafeWordListLoader({
 *   wordLists: [list1, list2],
 * });
 * ```
 */
export function createBrowserSafeWordListLoader({
  wordLists,
}: {
  wordLists: CompactWordListJson[];
}) {
  // Expand all word lists
  const wordListSets: WordListSet[] = wordLists.map(expandWordListJson);

  return {
    wordListSets,

    getWordListSetById(id: string): WordListSet | undefined {
      return wordListSets.find((set) => set.id === id);
    },

    getWordListSetsByDifficulty(difficulty: string): WordListSet[] {
      return wordListSets.filter((set) => set.difficulty === difficulty);
    },

    getWordListSetsByExamGrade(grade: string): WordListSet[] {
      return wordListSets.filter((set) => set.examGrade === grade);
    },

    getWordListSetsByCategory(category: string): WordListSet[] {
      return wordListSets.filter((set) => set.category === category);
    },

    getWordListCategories(): string[] {
      const categories = new Set<string>();
      wordListSets.forEach((set) => {
        if (set.category) {
          categories.add(set.category);
        }
      });
      return Array.from(categories);
    },

    getAllWordListItems(): WordListItem[] {
      return wordListSets.flatMap((set) => set.words);
    },
  };
}
