/**
 * Word List Loader Utilities
 *
 * Utilities for loading word lists from JSON files.
 * JSON format is optimized for minimal bundle size:
 * - Short field names (id, name, desc, level, cat, pos)
 * - Words as string array when metadata is uniform
 * - Inherit list-level metadata to word items
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';

import type { WordListItem, WordListSet } from '../types/word-lists';

/**
 * Compact JSON format type
 */
type CompactWordListJson = {
  id: string;
  name: string;
  desc?: string;
  level?: string; // CEFR level (A1, A2, etc.)
  cat?: string; // top-level category (e.g., "A1", "Adverbs of Time and Place")
  subcat?: string; // subcategory within category (e.g., "Adverbs of Time", "Adverbs of Frequency")
  pos?: string; // part of speech (applies to all words)
  difficulty?: string;
  words: string[] | WordListItem[]; // Can be simple strings or full objects
};

/**
 * Load a word list from a JSON file and expand to full WordListSet format
 */
export function loadWordListFromJson(filePath: string): WordListSet {
  const content = readFileSync(filePath, 'utf-8');
  const data: CompactWordListJson = JSON.parse(content);

  // Validate structure
  if (!data.id || !data.name || !Array.isArray(data.words)) {
    throw new Error(
      `Invalid word list JSON format in ${filePath}. Expected: { id, name, words[] }`,
    );
  }

  // Expand compact format to full WordListSet
  const examGrade = data.level as any;
  const difficulty = data.difficulty as any;
  const category = data.cat;
  const subcategory = data.subcat;

  // If words are strings, expand them with inherited metadata
  const expandedWords: WordListItem[] = data.words.map((word) => {
    if (typeof word === 'string') {
      return {
        word,
        partOfSpeech: data.pos,
        difficulty,
        examGrade,
        category,
      };
    }
    // Already a WordListItem, use as-is
    return word;
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
 * Load all word lists from a directory
 * Only loads .json files
 */
export function loadWordListsFromDirectory(directoryPath: string): WordListSet[] {
  const wordLists: WordListSet[] = [];

  if (!statSync(directoryPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${directoryPath}`);
  }

  const files = readdirSync(directoryPath);

  for (const file of files) {
    const filePath = join(directoryPath, file);
    const ext = extname(file);

    if (ext === '.json') {
      try {
        wordLists.push(loadWordListFromJson(filePath));
      } catch (error) {
        console.warn(`Failed to load word list from ${filePath}:`, error);
      }
    }
  }

  return wordLists;
}

/**
 * Load all word lists from a directory structure
 * Recursively loads all JSON files and returns a flat array
 */
export function loadAllWordLists(baseDirectory: string): WordListSet[] {
  const wordLists: WordListSet[] = [];

  function traverse(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && extname(entry.name) === '.json') {
        try {
          wordLists.push(loadWordListFromJson(fullPath));
        } catch (error) {
          console.warn(`Failed to load word list from ${fullPath}:`, error);
        }
      }
    }
  }

  traverse(baseDirectory);
  return wordLists;
}
