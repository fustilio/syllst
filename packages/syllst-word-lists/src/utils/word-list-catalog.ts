/**
 * Word List Catalog
 *
 * Descriptor-based lazy loading for word lists.
 *
 * Mirrors the parallel-text descriptor pattern used in polyglot-bundles:
 *   { id, name, description?, itemCount?, load: () => Promise<WordListSet> }
 *
 * Metadata is eager so consumers can discover available sets without
 * loading payloads. Each set's JSON is loaded on demand via the
 * descriptor's `load()` function, enabling per-set Vite chunk splitting.
 */

import type {
  ExamGrade,
  WordListDifficulty,
  WordListSet,
} from '../types/word-lists';
import { expandWordListJson, type CompactWordListJson } from './word-lists';
import { parseWordListSet } from './parse-word-list';

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Source metadata for a word list set.
 */
export type WordListSource = {
  /** Human-readable source name */
  readonly name: string;
  /** URL where the data was obtained */
  readonly url?: string;
  /** License identifier or URL */
  readonly license?: string;
  /** ISO date string when the source was accessed */
  readonly accessedAt?: string;
};

/**
 * A descriptor for a single word list set.
 *
 * The `load()` function is where the heavy payload lives. It should
 * dynamically import the set's JSON and expand it to a full WordListSet.
 *
 * @example
 * ```ts
 * {
 *   id: "a1-basic-greetings",
 *   name: "Basic Greetings",
 *   examGrade: "A1",
 *   category: "greetings",
 *   itemCount: 10,
 *   source: { name: "Wiktionary", url: "https://en.wiktionary.org" },
 *   load: async () => {
 *     const data = await import("./json/a1/basic-greetings.json");
 *     return expandWordListJson(data.default);
 *   },
 * }
 * ```
 */
export type WordListSetDescriptor = {
  /** Unique identifier */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Short description */
  readonly description?: string;
  /** CEFR exam grade */
  readonly examGrade?: ExamGrade;
  /** Thematic category */
  readonly category?: string;
  /** Subcategory */
  readonly subcategory?: string;
  /** Overall difficulty */
  readonly difficulty?: WordListDifficulty;
  /** Known word count (for UI previews) */
  readonly itemCount?: number;
  /** Source metadata */
  readonly source?: WordListSource;
  /** Lazy loader — returns the full WordListSet */
  readonly load: () => Promise<WordListSet>;
};

/**
 * A catalog of word list descriptors with filter utilities.
 */
export type WordListCatalog = {
  /** All descriptors */
  readonly descriptors: readonly WordListSetDescriptor[];
  /** Get descriptor by ID */
  readonly getDescriptorById: (
    id: string,
  ) => WordListSetDescriptor | undefined;
  /** Get descriptors by CEFR exam grade */
  readonly getDescriptorsByExamGrade: (
    grade: ExamGrade,
  ) => WordListSetDescriptor[];
  /** Get descriptors by category */
  readonly getDescriptorsByCategory: (
    category: string,
  ) => WordListSetDescriptor[];
  /** Get descriptors by difficulty */
  readonly getDescriptorsByDifficulty: (
    difficulty: WordListDifficulty,
  ) => WordListSetDescriptor[];
  /** Get all unique categories */
  readonly getCategories: () => string[];
};

// ─── Factory ───────────────────────────────────────────────────────────────

/**
 * Creates a word list catalog from an array of descriptors.
 *
 * All filter operations are O(n) over the descriptor array.
 * No JSON is loaded until a consumer calls `descriptor.load()`.
 */
export function createWordListCatalog(
  descriptors: WordListSetDescriptor[],
): WordListCatalog {
  return {
    descriptors,

    getDescriptorById(id: string) {
      return descriptors.find((d) => d.id === id);
    },

    getDescriptorsByExamGrade(grade: ExamGrade) {
      return descriptors.filter((d) => d.examGrade === grade);
    },

    getDescriptorsByCategory(category: string) {
      return descriptors.filter((d) => d.category === category);
    },

    getDescriptorsByDifficulty(difficulty: WordListDifficulty) {
      return descriptors.filter((d) => d.difficulty === difficulty);
    },

    getCategories() {
      const categories = new Set<string>();
      descriptors.forEach((d) => {
        if (d.category) categories.add(d.category);
      });
      return Array.from(categories).sort();
    },
  };
}

// ─── JSON Descriptor Factory ─────────────────────────────────────────────────

/**
 * Creates a WordListSetDescriptor that loads its payload from a JSON file.
 *
 * @param meta - Descriptor metadata (all fields except `load`)
 * @param loader - Function that imports the JSON module (e.g. `() => import("./json/...")`)
 * @returns A WordListSetDescriptor with a lazy `load()` function
 *
 * @example
 * ```ts
 * jsonDescriptor(
 *   {
 *     id: "a1-greetings",
 *     name: "Basic Greetings",
 *     examGrade: "A1",
 *     category: "greetings",
 *     itemCount: 10,
 *   },
 *   () => import("./json/a1/greetings.json"),
 * );
 * ```
 */
export function jsonDescriptor(
  meta: Omit<WordListSetDescriptor, "load"> & { source?: WordListSource },
  loader: () => Promise<{ default: unknown }>,
): WordListSetDescriptor {
  return {
    ...meta,
    load: async () => {
      const data = await loader();
      return expandWordListJson(data.default as CompactWordListJson);
    },
  };
}

/**
 * Like {@link jsonDescriptor}, but routes the loaded JSON through
 * {@link parseWordListSet} — the tolerant parser that normalizes legacy
 * shapes (`transcriptions` plural, `{primary, ipa, ...}`, set-level `pos`,
 * etc.) into canonical `WordListSet`.
 *
 * Prefer this for new word-list JSON files; reserve `jsonDescriptor` for
 * already-canonical compact JSON.
 */
export function parsedJsonDescriptor(
  meta: Omit<WordListSetDescriptor, "load"> & { source?: WordListSource },
  loader: () => Promise<{ default: unknown }>,
): WordListSetDescriptor {
  return {
    ...meta,
    load: async () => {
      const data = await loader();
      return parseWordListSet(data.default);
    },
  };
}
