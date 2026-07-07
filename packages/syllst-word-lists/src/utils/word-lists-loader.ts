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

import type { WordListSet } from '../types/word-lists';
import { expandWordListJson, type CompactWordListJson } from './word-lists';

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

  return expandWordListJson(data);
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
