/**
 * Word List Ingestion Utilities
 *
 * Convert various source formats into standardized WordListSet format.
 * These utilities help import vocabulary from:
 * - Anki decks (.apkg)
 * - CSV spreadsheets (Reddit, Google Sheets)
 * - Textbook exports (TSV)
 * - Frequency lists
 *
 * All converters output the same canonical JSON format for syllst.
 */

import type { WordListItem, WordListSet, ExamGrade, WordListDifficulty } from '../types/word-lists';

/**
 * Generic row parser for tabular data (CSV, TSV, spreadsheets)
 *
 * @param rows - Array of row objects from CSV/TSV
 * @param columnMap - Mapping from source columns to WordListItem fields
 * @param listMetadata - List-level metadata (id, name, level, etc.)
 *
 * @example
 * ```ts
 * const rows = await parseCSV('thai-vocab.csv');
 * const wordList = convertTabularRowsToWordList(rows, {
 *   word: 'thai_word',
 *   translation: 'english',
 *   pos: 'pos',
 *   category: 'topic',
 * }, {
 *   id: 'a1-thai-vocab',
 *   name: 'Thai Vocabulary',
 *   examGrade: 'A1',
 * });
 * ```
 */
export function convertTabularRowsToWordList(
  rows: Record<string, string>[],
  columnMap: Record<string, string>,
  listMetadata: {
    id: string;
    name: string;
    description?: string;
    examGrade?: ExamGrade;
    difficulty?: WordListDifficulty;
    category?: string;
  }
): WordListSet {
  const words: WordListItem[] = rows.map((row, index) => {
    const wordValue = row[columnMap['word']] || '';
    const item: WordListItem = {
      id: listMetadata.id + ':' + index,
      word: wordValue,
    };

    // Map optional fields
    if (columnMap['translation'] && row[columnMap['translation']]) {
      item.translation = row[columnMap['translation']];
    }
    if (columnMap['pos'] && row[columnMap['pos']]) {
      item.partOfSpeech = row[columnMap['pos']];
    }
    if (columnMap['category'] && row[columnMap['category']]) {
      item.category = row[columnMap['category']];
    }
    // Support new transcriptions format (language-specific schemes)
    if (columnMap['transcriptions']) {
      // Parse transcriptions object if provided as JSON string
      try {
        const transcriptions = JSON.parse(row[columnMap['transcriptions']]);
        item.transcription = transcriptions;
      } catch {
        // Fallback: treat as single string transcription
        item.transcription = row[columnMap['transcriptions']];
      }
    }
    // Backward compatibility: support legacy transliteration field
    if (columnMap['transliteration'] && row[columnMap['transliteration']]) {
      item.transcription = row[columnMap['transliteration']];
    }
    // Backward compatibility: support legacy ipa field
    if (columnMap['ipa'] && row[columnMap['ipa']]) {
      if (typeof item.transcription === 'string') {
        item.transcription = { primary: item.transcription, ipa: row[columnMap['ipa']] };
      } else if (!item.transcription) {
        item.transcription = { primary: '', ipa: row[columnMap['ipa']] };
      } else {
        item.transcription.ipa = row[columnMap['ipa']];
      }
    }
    if (columnMap['example'] && row[columnMap['example']]) {
      item.example = row[columnMap['example']];
    }
    if (columnMap['tags'] && row[columnMap['tags']]) {
      item.tags = row[columnMap['tags']].split(',').map((t: string) => t.trim());
    }

    // Inherit list-level metadata
    if (listMetadata.examGrade) {
      item.examGrade = listMetadata.examGrade;
    }
    if (listMetadata.difficulty) {
      item.difficulty = listMetadata.difficulty;
    }
    if (listMetadata.category && !item.category) {
      item.category = listMetadata.category;
    }

    return item;
  }).filter((item) => item.word); // Filter out empty rows

  return {
    id: listMetadata.id,
    name: listMetadata.name,
    description: listMetadata.description,
    examGrade: listMetadata.examGrade,
    difficulty: listMetadata.difficulty,
    category: listMetadata.category,
    words,
  };
}

/**
 * Parse Anki deck export format
 * Anki cards typically have: Front (word), Back (translation), tags, note type
 *
 * @param cards - Array of Anki card objects
 * @param listMetadata - List-level metadata
 *
 * @example
 * ```ts
 * const ankiCards = await extractAnkiCards('thai-4000.apkg');
 * const wordList = convertAnkiCardsToWordList(ankiCards, {
 *   id: 'anki-thai-4000',
 *   name: 'Thai 4000 Words',
 *   examGrade: 'B1',
 * });
 * ```
 */
export function convertAnkiCardsToWordList(
  cards: Array<{
    front: string;
    back?: string;
    tags?: string[];
    noteType?: string;
    fields?: Record<string, string>;
  }>,
  listMetadata: {
    id: string;
    name: string;
    description?: string;
    examGrade?: ExamGrade;
    difficulty?: WordListDifficulty;
    category?: string;
  }
): WordListSet {
  const words: WordListItem[] = cards.map((card, index) => {
    const item: WordListItem = {
      id: listMetadata.id + ':' + index,
      word: card.front,
    };

    if (card.back) {
      item.translation = card.back;
    }
    if (card.tags) {
      item.tags = card.tags;
    }
    if (card.fields) {
      // Map Anki fields to WordListItem
      if (card.fields['pos']) item.partOfSpeech = card.fields['pos'];

      // Support new transcriptions format
      if (card.fields['transcriptions']) {
        try {
          const transcriptions = JSON.parse(card.fields['transcriptions']);
          item.transcription = transcriptions;
        } catch {
          // Fallback: treat as single string transcription
          item.transcription = card.fields['transcriptions'];
        }
      }

      // Backward compatibility: legacy transliteration field
      if (card.fields['transliteration']) {
        if (!item.transcription) {
          item.transcription = card.fields['transliteration'];
        }
      }
      // Backward compatibility: legacy ipa field
      if (card.fields['ipa']) {
        if (typeof item.transcription === 'string') {
          item.transcription = { primary: item.transcription, ipa: card.fields['ipa'] };
        } else if (!item.transcription) {
          item.transcription = { primary: '', ipa: card.fields['ipa'] };
        } else {
          item.transcription.ipa = card.fields['ipa'];
        }
      }
      if (card.fields['example']) item.example = card.fields['example'];
    }

    // Inherit list-level metadata
    if (listMetadata.examGrade) {
      item.examGrade = listMetadata.examGrade;
    }
    if (listMetadata.difficulty) {
      item.difficulty = listMetadata.difficulty;
    }

    return item;
  });

  return {
    id: listMetadata.id,
    name: listMetadata.name,
    description: listMetadata.description,
    examGrade: listMetadata.examGrade,
    difficulty: listMetadata.difficulty,
    category: listMetadata.category,
    words,
  };
}

/**
 * Parse frequency list format
 * Common format: word, rank, frequency per million
 *
 * @param entries - Array of frequency entries
 * @param listMetadata - List-level metadata
 *
 * @example
 * ```ts
 * const freqData = await parseFrequencyList('thai-frequency.tsv');
 * const wordList = convertFrequencyListToWordList(freqData, {
 *   id: 'thai-frequency-2000',
 *   name: 'Thai 2000 Most Common',
 *   difficulty: 'beginner',
 * });
 * ```
 */
export function convertFrequencyListToWordList(
  entries: Array<{
    word: string;
    rank: number;
    frequency?: number;
    translation?: string;
    pos?: string;
  }>,
  listMetadata: {
    id: string;
    name: string;
    description?: string;
    examGrade?: ExamGrade;
    difficulty?: WordListDifficulty;
    category?: string;
  }
): WordListSet {
  const words: WordListItem[] = entries.map((entry, index) => ({
    id: listMetadata.id + ':' + index,
    word: entry.word,
    translation: entry.translation,
    partOfSpeech: entry.pos,
    frequency: entry.rank, // Use rank as frequency (lower = more common)
    examGrade: listMetadata.examGrade,
    difficulty: listMetadata.difficulty,
    category: listMetadata.category,
  }));

  return {
    id: listMetadata.id,
    name: listMetadata.name,
    description: listMetadata.description,
    examGrade: listMetadata.examGrade,
    difficulty: listMetadata.difficulty,
    category: listMetadata.category,
    words,
  };
}

/**
 * Normalize and deduplicate words
 * Removes duplicates by word form, keeps first occurrence
 *
 * @param words - Array of word items
 * @param normalizeFn - Optional normalization function (default: lowercase)
 */
export function deduplicateWords(
  words: WordListItem[],
  normalizeFn: (word: string) => string = (w) => w.toLowerCase()
): WordListItem[] {
  const seen = new Set<string>();
  return words.filter((word) => {
    const normalized = normalizeFn(word.word);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Merge multiple word lists with conflict resolution
 *
 * @param lists - Array of word lists to merge
 * @param conflictStrategy - How to handle duplicates: 'first', 'last', 'merge'
 *
 * @example
 * ```ts
 * const merged = mergeWordLists([ankiList, textbookList, frequencyList], 'merge');
 * // Combines all sources, keeping richest metadata for duplicates
 * ```
 */
export function mergeWordLists(
  lists: WordListSet[],
  conflictStrategy: 'first' | 'last' | 'merge' = 'merge'
): WordListSet {
  const allWords = lists.flatMap((l) => l.words);
  const mergedWords = new Map<string, WordListItem>();

  allWords.forEach((word) => {
    const key = word.word.toLowerCase();
    const existing = mergedWords.get(key);

    if (!existing) {
      mergedWords.set(key, word);
    } else if (conflictStrategy === 'last') {
      mergedWords.set(key, word);
    } else if (conflictStrategy === 'merge') {
      // Keep the richer metadata
      mergedWords.set(key, {
        ...existing,
        ...word,
        word: existing.word, // Preserve original word form
      });
    }
  });

  return {
    id: lists[0]?.id || 'merged',
    name: lists.map((l) => l.name).join(' + '),
    description: 'Merged from multiple sources',
    words: Array.from(mergedWords.values()),
  };
}
