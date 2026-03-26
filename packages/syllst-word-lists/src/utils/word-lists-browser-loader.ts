/**
 * Browser Word List Loader
 *
 * Creates a word list loader for browser environments.
 * Unlike the Node.js loader, this loader works with pre-imported JSON data
 * and doesn't rely on filesystem access.
 *
 * @example
 * ```ts
 * import { createBrowserWordListLoader } from "@syllst/content-shared";
 *
 * const {
 *   wordListSets,
 *   getWordListSetById,
 *   getWordListSetsByDifficulty,
 *   // ... other functions
 * } = createBrowserWordListLoader({
 *   wordLists: [list1, list2, ...]
 * });
 * ```
 */

import type { WordListItem, WordListSet, WordListDifficulty, ExamGrade } from '../types/word-lists';
import { createWordListUtils } from './word-lists-utils';
import type { CompactWordListJson } from './word-lists';

/**
 * Configuration for creating browser word list loaders
 */
export type BrowserWordListLoaderConfig = {
  /** Array of word list JSON data (imported in browser) */
  wordLists: CompactWordListJson[];
};

/**
 * Expands compact JSON format to full WordListSet
 */
function expandWordListJson(data: CompactWordListJson): WordListSet {
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
 * Creates a browser word list loader
 */
export function createBrowserWordListLoader(config: BrowserWordListLoaderConfig) {
  const { wordLists } = config;

  // Expand all word lists
  const wordListSets: WordListSet[] = wordLists.map(expandWordListJson);
  const wordListUtils = createWordListUtils({ wordListSets });

  return {
    /** Word list sets */
    wordListSets,

    /** Get word list set by ID */
    getWordListSetById(id: string): WordListSet | undefined {
      return wordListUtils.getWordListSetById(id);
    },

    /** Get word list sets by difficulty */
    getWordListSetsByDifficulty(difficulty: WordListDifficulty): WordListSet[] {
      return wordListUtils.getWordListSetsByDifficulty(difficulty);
    },

    /** Get word list sets by exam grade */
    getWordListSetsByExamGrade(grade: ExamGrade): WordListSet[] {
      return wordListUtils.getWordListSetsByExamGrade(grade);
    },

    /** Get word list sets by category */
    getWordListSetsByCategory(category: string): WordListSet[] {
      return wordListUtils.getWordListSetsByCategory(category);
    },

    /** Get all unique categories */
    getWordListCategories(): string[] {
      return wordListUtils.getWordListCategories();
    },

    /** Get all words from all sets */
    getAllWordListItems(): WordListItem[] {
      return wordListUtils.getAllWordListItems();
    },
  };
}

/**
 * Node.js Word List Loader (with Browser Fallback)
 *
 * Creates a word list loader that lazily loads word lists from the filesystem
 * only in Node.js environments. In browser builds, returns empty arrays.
 *
 * This is for packages that store word lists as JSON files in their directory.
 *
 * @example
 * ```ts
 * import { createNodeWordListLoader } from "@syllst/content-shared";
 *
 * const {
 *   wordListSets,
 *   getWordListSetById,
 *   getWordListSetsByDifficulty,
 *   // ... other functions
 * } = createNodeWordListLoader({ jsonDirPath: "json" });
 * ```
 */

import { loadAllWordLists } from './word-lists-loader';

/**
 * Configuration for creating node word list loaders
 */
export type NodeWordListLoaderConfig = {
  /** Relative path from the module to the JSON word lists directory (default: "json") */
  jsonDirPath?: string;
};

/**
 * Creates a node.js word list loader with browser fallback
 */
export function createNodeWordListLoader(config: NodeWordListLoaderConfig) {
  const { jsonDirPath = 'json' } = config;

  // Lazy loading: only load when accessed (avoids fs APIs in browser builds)
  let _wordListSets: WordListSet[] | null = null;
  let _wordListUtils: ReturnType<typeof createWordListUtils> | null = null;

  function getWordListSets(): WordListSet[] {
    if (_wordListSets === null) {
      // Check if we're in a Node.js environment (fs APIs available)
      if (typeof process !== 'undefined' && process.versions?.node) {
        try {
          // Only import fs-dependent modules in Node.js
          const { dirname, join } = require('path');
          const { fileURLToPath } = require('url');

          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
          const loadedSets = loadAllWordLists(join(__dirname, jsonDirPath));
          _wordListSets = loadedSets;
          _wordListUtils = createWordListUtils({
            wordListSets: loadedSets,
          });
        } catch (error) {
          // If loading fails (e.g., in browser), return empty array
          _wordListSets = [];
          _wordListUtils = createWordListUtils({
            wordListSets: [],
          });
        }
      } else {
        // Browser environment - return empty array
        _wordListSets = [];
        _wordListUtils = createWordListUtils({
          wordListSets: [],
        });
      }
    }
    // At this point, _wordListSets is guaranteed to be non-null
    return _wordListSets!;
  }

  function getWordListUtils() {
    if (_wordListUtils === null) {
      getWordListSets(); // This will initialize _wordListUtils
    }
    return _wordListUtils!;
  }

  // Initialize word list sets (lazy - will load when first accessed in Node.js)
  // In browser builds, this will remain empty
  const wordListSets: WordListSet[] = getWordListSets();

  return {
    /** Word list sets (lazy loaded, empty in browser) */
    wordListSets,

    /** Get word list set by ID */
    getWordListSetById(id: string): WordListSet | undefined {
      return getWordListUtils().getWordListSetById(id);
    },

    /** Get word list sets by difficulty */
    getWordListSetsByDifficulty(difficulty: WordListDifficulty): WordListSet[] {
      return getWordListUtils().getWordListSetsByDifficulty(difficulty);
    },

    /** Get word list sets by exam grade */
    getWordListSetsByExamGrade(grade: ExamGrade): WordListSet[] {
      return getWordListUtils().getWordListSetsByExamGrade(grade);
    },

    /** Get word list sets by category */
    getWordListSetsByCategory(category: string): WordListSet[] {
      return getWordListUtils().getWordListSetsByCategory(category);
    },

    /** Get all unique categories */
    getWordListCategories(): string[] {
      return getWordListUtils().getWordListCategories();
    },

    /** Get all words from all sets */
    getAllWordListItems(): WordListItem[] {
      return getWordListUtils().getAllWordListItems();
    },
  };
}
