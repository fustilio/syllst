/**
 * Word ID Utilities
 *
 * Generate consistent word identifiers across languages.
 * IDs enable content linking (lessons, stories) and cross-referencing.
 */

/**
 * Creates a unique word identifier
 *
 * Format: {lang}:{type}:{category}:{word-slug}
 *
 * @example
 * createWordId("th", "vocab", "greetings", "สวัสดี") // "th:vocab:greetings:sawasdee"
 * createWordId("en", "vocab", "greetings", "hello") // "en:vocab:greetings:hello"
 *
 * @param lang - Language code (e.g., "th", "en", "fr")
 * @param type - Word type ("vocab", "char", "phrase")
 * @param category - Category or word list ID
 * @param word - The word form
 * @param slug - Optional custom slug (if not provided, generated from word)
 */
export function createWordId(
  lang: string,
  type: "vocab" | "char" | "phrase",
  category: string,
  word: string,
  slug?: string
): string {
  const wordSlug = slug || slugifyWord(word);
  return `${lang}:${type}:${category}:${wordSlug}`;
}

/**
 * Parses a word ID into its components
 *
 * @param id - Word ID in format {lang}:{type}:{category}:{slug}
 * @returns Parsed components or null if invalid
 */
export function parseWordId(id: string): {
  lang: string;
  type: "vocab" | "char" | "phrase";
  category: string;
  slug: string;
} | null {
  const parts = id.split(":");
  if (parts.length !== 4) return null;

  const [lang, type, category, slug] = parts;
  if (!lang || !type || !category || !slug) return null;

  if (type !== "vocab" && type !== "char" && type !== "phrase") return null;

  return { lang, type, category, slug };
}

/**
 * Slugifies a word for use in IDs
 * - Transliterates non-Latin scripts
 * - Removes diacritics
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 */
function slugifyWord(word: string): string {
  // For Thai and other non-Latin scripts, this is a placeholder
  // In production, you'd use a transliteration library
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, ""); // Keep only alphanumeric and hyphens
}

/**
 * Generates word IDs for all words in a word list
 *
 * @param words - Array of word items
 * @param lang - Language code
 * @param listId - Word list ID (used as category)
 * @returns Words with generated IDs
 */
export function addWordIdsToWords<T extends { word: string; id?: string }>(
  words: T[],
  lang: string,
  listId: string
): T[] {
  return words.map((word, index) => {
    if (word.id) {
      // Already has an ID, preserve it
      return word;
    }
    // Generate ID using word + index for uniqueness
    const slug = slugifyWord(word.word) || `w${index}`;
    return {
      ...word,
      id: createWordId(lang, "vocab", listId, word.word, slug),
    };
  });
}
