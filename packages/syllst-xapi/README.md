# @syllst/xapi

**xAPI vocabulary profile for language learning** — verbs, activity types, extensions, and Zod validation schemas extending cmi5.

## Overview

This package defines an xAPI vocabulary profile for language learning activities, providing:

- **Verb constants** — Standard ADL verbs + 5 new language-learning verbs
- **Activity type constants** — Standard types + 12 new language-learning activity types
- **Extension IRIs & schemas** — 12 extensions across context, result, and activity categories
- **Zod validation schemas** — Type-safe statement fragment validation
- **JSON-LD profile document** — Conforming to xAPI Profile spec v1.0

**Namespace:** `https://syllst.dev/xapi/`

## Installation

```bash
pnpm add @syllst/xapi
```

## Usage

### Full Import

```typescript
import {
  VERBS,
  ACTIVITY_TYPES,
  EXTENSIONS,
} from '@syllst/xapi';

const statement = {
  verb: {
    id: VERBS.TRANSCRIBED,
    display: { 'en-US': 'transcribed' },
  },
  object: {
    definition: {
      type: ACTIVITY_TYPES.VOCABULARY_DRILL,
    },
  },
  context: {
    extensions: {
      [EXTENSIONS.TARGET_LANGUAGE]: 'th',
      [EXTENSIONS.CEFR_LEVEL]: 'A1',
    },
  },
};
```

### Subpath Imports (tree-shaking)

```typescript
import { VERBS } from '@syllst/xapi/verbs';
import { ACTIVITY_TYPES } from '@syllst/xapi/activity-types';
import { EXTENSIONS, ContextExtensionsSchema } from '@syllst/xapi/extensions';
import { VerbSchema, ActivityDefinitionSchema } from '@syllst/xapi/schemas';
import { SYLLST_XAPI_PROFILE } from '@syllst/xapi/profile';
```

### Validation

```typescript
import {
  ContextExtensionsSchema,
  ResultExtensionsSchema,
  ProfileVerbSchema,
} from '@syllst/xapi';

// Validate context extensions
const ctx = ContextExtensionsSchema.parse({
  targetLanguage: 'th',
  cefrLevel: 'A1',
});

// Validate a verb object
const verb = ProfileVerbSchema.parse({
  id: 'https://syllst.dev/xapi/verbs/transcribed',
  display: { 'en-US': 'transcribed' },
});
```

## Verbs

| Verb | IRI | Description |
|------|-----|-------------|
| `TRANSCRIBED` | `syllst:verbs/transcribed` | Wrote a transcription/transliteration |
| `PRONOUNCED` | `syllst:verbs/pronounced` | Spoke or attempted pronunciation |
| `TRANSLATED` | `syllst:verbs/translated` | Provided a translation |
| `PRACTICED` | `syllst:verbs/practiced` | Completed a practice session |
| `DRILLED` | `syllst:verbs/drilled` | Completed a focused drill exercise |

Plus standard ADL verbs: `LAUNCHED`, `INITIALIZED`, `COMPLETED`, `PASSED`, `FAILED`, `TERMINATED`, `ATTEMPTED`, `ANSWERED`, `EXPERIENCED`, `MASTERED`.

## Activity Types

| Type | Description |
|------|-------------|
| `VOCABULARY_DRILL` | Vocabulary practice activity |
| `CHARACTER_RECOGNITION` | Script/character learning |
| `FLASHCARD_DECK` | Flashcard-based review |
| `TONE_DRILL` | Tonal language practice |
| `TRANSLATION_EXERCISE` | Translation task |
| `LISTENING_COMPREHENSION` | Listening activity |
| `PRONUNCIATION_EXERCISE` | Speaking/pronunciation |
| `READING_COMPREHENSION` | Reading activity |
| `DIALOGUE_PRACTICE` | Conversation practice |
| `GRAMMAR_EXERCISE` | Grammar rule application |
| `WRITING_EXERCISE` | Writing/composition |
| `CULTURAL_NOTE` | Cultural context content |

Plus standard ADL types: `COURSE`, `MODULE`, `LESSON`, `OBJECTIVE`, `ASSESSMENT`, `QUESTION`, `INTERACTION`, `CONTENT`.

## Extensions

### Context Extensions

| Extension | Schema | Description |
|-----------|--------|-------------|
| `TARGET_LANGUAGE` | BCP 47 string | Language being learned |
| `SOURCE_LANGUAGE` | BCP 47 string | Learner's native language |
| `CEFR_LEVEL` | A1-C2 enum | Proficiency level |
| `TRANSCRIPTION_SYSTEM` | string | Romanization scheme used |

### Result Extensions

| Extension | Schema | Description |
|-----------|--------|-------------|
| `PRONUNCIATION_ACCURACY` | 0-100 number | Pronunciation score |
| `TRANSCRIPTION_ACCURACY` | 0-100 number | Transcription score |

### Activity Extensions

| Extension | Schema | Description |
|-----------|--------|-------------|
| `SKILL_CATEGORY` | string | Skill being practiced |
| `DIFFICULTY_LEVEL` | string | Difficulty rating |
| `CHARACTER_SET` | string | Script/writing system |
| `WORD_COUNT` | positive integer | Number of words |
| `TIME_LIMIT` | positive integer | Time limit in seconds |
| `REPETITION_COUNT` | positive integer | Number of repetitions |

## Complements (does not replace)

- `@xapi/xapi` — HTTP client for sending statements to an LRS
- `@xapi/cmi5` — cmi5 AU launch lifecycle runtime

This package provides the **vocabulary** (IRIs, types, schemas). Use it alongside an xAPI client to construct and send statements.

## Development

```bash
pnpm test        # Run tests (99 tests)
pnpm build       # Build TypeScript
pnpm typecheck   # Type check
```

## License

MIT
