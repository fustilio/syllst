/**
 * Tolerant JSON → canonical word-list parser.
 *
 * Accepts the variety of shapes found in real authoring data and emits a
 * canonical `WordListSet`. Vendored from polyglot-bundles per RFC
 * `2026-05-12-word-list-item-schema-rfc.md` (see syllst inbox/resolved/).
 *
 * Tolerated shapes (normalized on output):
 *   - `transcriptions` (plural) → `transcription`  (warns)
 *   - `transcription: "khâao"` (bare)              → `{ schemes: { default } }`
 *   - `transcription: { scheme, value }` (CN)      → `{ schemes: { [scheme]: value } }`
 *   - `transcription: { primary, ipa, ... }`       → `{ schemes, primary }` (primary becomes a key)
 *   - `transcription: { paiboon+, aua, ... }`      → `{ schemes }`
 *   - legacy flat `ipa` field                       → folded into `transcription.schemes.ipa`
 *   - legacy flat `transliteration` field           → folded into `transcription.schemes.romanization`
 *   - `reading: "atama"` (bare)                     → `{ default: "atama" }`
 *   - set-level `pos` / `cat` / `level` aliases     → `partOfSpeech` / `category` / `examGrade` (warns on pos)
 *   - bare-string entries in `words`                → expanded using set defaults
 *
 * Malformed input (missing `id` / `name` / `words`, non-string transcription
 * values, items missing `word`) throws.
 */

import type { CanonicalTranscriptionObject } from '@syllst/core';
import type {
  ExamGrade,
  WordListDifficulty,
  WordListItem,
  WordListSet,
} from '../types/word-lists';

type RawWord = string | Record<string, unknown>;
type RawSet = Record<string, unknown> & { words?: readonly RawWord[] };

const warnedKeys = new Set<string>();
function warnOnce(key: string, message: string): void {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[@syllst/word-lists] ${message}`);
}

function pickString(...candidates: readonly unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c;
  }
  return undefined;
}

function parseTranscription(raw: unknown): CanonicalTranscriptionObject | undefined {
  if (raw === undefined || raw === null) return undefined;

  if (typeof raw === 'string') {
    return { schemes: { default: raw } };
  }

  if (typeof raw !== 'object') {
    throw new Error(`transcription: expected string or object, got ${typeof raw}`);
  }

  const obj = raw as Record<string, unknown>;

  // CN-style tagged form: { scheme: "pinyin", value: "de" }
  if (typeof obj.scheme === 'string' && typeof obj.value === 'string') {
    return { schemes: { [obj.scheme]: obj.value } };
  }

  // Already canonical: { schemes: {...}, primary?: <key> }
  if (obj.schemes && typeof obj.schemes === 'object') {
    const rawSchemes = obj.schemes as Record<string, unknown>;
    const schemes: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawSchemes)) {
      if (v === undefined || v === null) continue;
      if (typeof v !== 'string') {
        throw new Error(`transcription.schemes.${k}: expected string, got ${typeof v}`);
      }
      schemes[k] = v;
    }
    if (Object.keys(schemes).length === 0) return undefined;
    if (obj.primary === undefined) return { schemes };
    if (typeof obj.primary !== 'string') {
      throw new Error(`transcription.primary: expected string, got ${typeof obj.primary}`);
    }
    if (!(obj.primary in schemes)) {
      throw new Error(
        `transcription.primary "${obj.primary}" is not a key of schemes (${Object.keys(schemes).join(', ')})`,
      );
    }
    return { schemes, primary: obj.primary };
  }

  // Legacy peer-scheme / {primary, ...} shape: { paiboon+: "...", ipa: "...", primary?: "..." }
  const schemes: Record<string, string> = {};
  let primaryValue: string | undefined;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') {
      throw new Error(`transcription.${key}: expected string, got ${typeof value}`);
    }
    if (key === 'primary') {
      primaryValue = value;
    } else {
      schemes[key] = value;
    }
  }

  if (primaryValue !== undefined) {
    // Resolve `primary`-as-value to a scheme key. Prefer a real matching scheme;
    // otherwise materialize it under a stable synthetic key.
    let matchedKey: string | undefined;
    for (const [k, v] of Object.entries(schemes)) {
      if (v === primaryValue) {
        matchedKey = k;
        break;
      }
    }
    if (matchedKey === undefined) {
      schemes.primary = primaryValue;
      matchedKey = 'primary';
    }
    if (Object.keys(schemes).length === 0) return undefined;
    return { schemes, primary: matchedKey };
  }

  if (Object.keys(schemes).length === 0) return undefined;
  return { schemes };
}

function mergeLegacyTranscriptionFields(
  base: CanonicalTranscriptionObject | undefined,
  ipa: unknown,
  transliteration: unknown,
): CanonicalTranscriptionObject | undefined {
  if (ipa === undefined && transliteration === undefined) return base;

  const schemes: Record<string, string> = { ...(base?.schemes ?? {}) };
  if (typeof ipa === 'string') {
    if (schemes.ipa === undefined) schemes.ipa = ipa;
  } else if (ipa !== undefined) {
    throw new Error(`ipa: expected string, got ${typeof ipa}`);
  }
  if (typeof transliteration === 'string') {
    if (schemes.romanization === undefined) schemes.romanization = transliteration;
  } else if (transliteration !== undefined) {
    throw new Error(`transliteration: expected string, got ${typeof transliteration}`);
  }

  if (Object.keys(schemes).length === 0) return undefined;
  return base?.primary === undefined ? { schemes } : { schemes, primary: base.primary };
}

function parseReading(raw: unknown): Record<string, string> | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'string') return { default: raw };
  if (typeof raw !== 'object') {
    throw new Error(`reading: expected string or object, got ${typeof raw}`);
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    if (typeof v !== 'string') {
      throw new Error(`reading.${k}: expected string, got ${typeof v}`);
    }
    out[k] = v;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

type SetDefaults = {
  examGrade?: ExamGrade;
  difficulty?: WordListDifficulty;
  category?: string;
  subcategory?: string;
  partOfSpeech?: string;
};

function parseWord(raw: RawWord, defaults: SetDefaults): WordListItem {
  if (typeof raw === 'string') {
    return {
      word: raw,
      examGrade: defaults.examGrade,
      difficulty: defaults.difficulty,
      category: defaults.category,
      subcategory: defaults.subcategory,
      partOfSpeech: defaults.partOfSpeech,
    };
  }

  const obj = raw;
  const word = obj.word;
  if (typeof word !== 'string' || word.length === 0) {
    const detail = typeof word === 'string' ? 'empty string' : typeof word;
    throw new Error(`word: expected non-empty string, got ${detail}`);
  }

  let rawTranscription: unknown;
  if ('transcription' in obj) {
    rawTranscription = obj.transcription;
  } else if ('transcriptions' in obj) {
    warnOnce(
      'word.transcriptions',
      'word-list item uses deprecated `transcriptions` (plural); migrate to `transcription`',
    );
    rawTranscription = obj.transcriptions;
  }

  const transcription = mergeLegacyTranscriptionFields(
    parseTranscription(rawTranscription),
    obj.ipa,
    obj.transliteration,
  );

  const partOfSpeech = pickString(obj.partOfSpeech, obj.pos);
  if (partOfSpeech !== undefined && obj.partOfSpeech === undefined && obj.pos !== undefined) {
    warnOnce('word.pos', 'word-list item uses deprecated `pos`; migrate to `partOfSpeech`');
  }

  return {
    id: typeof obj.id === 'string' ? obj.id : undefined,
    word,
    translation: typeof obj.translation === 'string' ? obj.translation : undefined,
    transcription,
    reading: parseReading(obj.reading),
    partOfSpeech: partOfSpeech ?? defaults.partOfSpeech,
    example: typeof obj.example === 'string' ? obj.example : undefined,
    exampleSentence: typeof obj.exampleSentence === 'string' ? obj.exampleSentence : undefined,
    notes: typeof obj.notes === 'string' ? obj.notes : undefined,
    difficulty: (pickString(obj.difficulty) as WordListDifficulty | undefined) ?? defaults.difficulty,
    examGrade: (pickString(obj.examGrade, obj.level) as ExamGrade | undefined) ?? defaults.examGrade,
    category: pickString(obj.category, obj.cat) ?? defaults.category,
    subcategory: pickString(obj.subcategory) ?? defaults.subcategory,
    tags: Array.isArray(obj.tags)
      ? obj.tags.filter((t): t is string => typeof t === 'string')
      : undefined,
    ciliId: typeof obj.ciliId === 'string' ? obj.ciliId : undefined,
    synsetId: typeof obj.synsetId === 'string' ? obj.synsetId : undefined,
    usedInLessons: Array.isArray(obj.usedInLessons)
      ? obj.usedInLessons.filter((s): s is string => typeof s === 'string')
      : undefined,
    usedInStories: Array.isArray(obj.usedInStories)
      ? obj.usedInStories.filter((s): s is string => typeof s === 'string')
      : undefined,
    frequency: typeof obj.frequency === 'number' ? obj.frequency : undefined,
  };
}

export function parseWordListSet(raw: unknown): WordListSet {
  if (raw === null || typeof raw !== 'object') {
    throw new Error(
      `word list set: expected object, got ${raw === null ? 'null' : typeof raw}`,
    );
  }
  const obj = raw as RawSet;

  const id = obj.id;
  const name = obj.name;
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('word list set: missing required `id`');
  }
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error(`word list set "${id}": missing required \`name\``);
  }

  if (obj.pos !== undefined && obj.partOfSpeech === undefined) {
    warnOnce(
      'set.pos',
      `word list set "${id}" uses deprecated set-level \`pos\`; migrate to \`partOfSpeech\``,
    );
  }

  const defaults: SetDefaults = {
    examGrade: pickString(obj.examGrade, obj.level) as ExamGrade | undefined,
    difficulty: pickString(obj.difficulty) as WordListDifficulty | undefined,
    category: pickString(obj.category, obj.cat),
    subcategory: pickString(obj.subcategory),
    partOfSpeech: pickString(obj.partOfSpeech, obj.pos),
  };

  const rawWords = obj.words;
  if (!Array.isArray(rawWords)) {
    throw new Error(`word list set "${id}": missing \`words\` array`);
  }

  const words: WordListItem[] = rawWords.map((w, i) => {
    try {
      return parseWord(w, defaults);
    } catch (err) {
      throw new Error(`word list set "${id}": words[${i}]: ${(err as Error).message}`);
    }
  });

  return {
    id,
    name,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    difficulty: defaults.difficulty,
    examGrade: defaults.examGrade,
    category: defaults.category,
    subcategory: defaults.subcategory,
    partOfSpeech: defaults.partOfSpeech,
    words,
  };
}
