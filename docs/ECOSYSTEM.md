# Syllst Ecosystem

This document describes the relationship between syllst and related projects in the fustilio language learning ecosystem.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    fustilio ecosystem                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    glost     │    │    syllst    │    │   chishiki   │      │
│  │  (sentence   │◄───│  (syllabus   │───►│  (learning   │      │
│  │   glossing)  │    │   structure) │    │   system)    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         │     content       │    curriculum     │               │
│         │    annotation     │    authoring      │    practice   │
│         │                   │                   │    & review   │
│         └───────────────────┴───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│                    ┌──────────────┐                            │
│                    │   Consumer   │                            │
│                    │ Applications │                            │
│                    └──────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Projects

### fustilio/glost

**GLOST** (Glossed Syntax Tree) is a framework for processing multilingual text with language learning annotations using a unified/remark-style plugin system.

**Repository:** https://github.com/fustilio/glost

**Purpose:** Rich sentence-level representation with word segmentation, glosses, and linguistic annotations.

**Key concepts:**
- `GLOSTDocument` - A document containing sentences with word-level annotations
- `GLOSTSentence` - A sentence with segmented, annotated words
- `GLOSTWord` - Individual word with transcription, translation, POS, difficulty, frequency
- Extensions for transcription, translation, frequency, difficulty, POS, gender, clause segmentation

**Packages:**
- `glost` - Main facade package
- `glost-core` - Core types and node factories
- `glost-processor` - Unified-style processor API
- `glost-registry` - Plugin discovery and validation
- `glost-presets` - Pre-configured plugin combinations
- `glost-th`, `glost-ja`, `glost-ko`, `glost-en` - Language-specific packages

**Use cases:**
- Interactive reading with word-level annotations
- Graded readers with difficulty scoring
- Transcription tools (IPA, romanization)
- Annotated corpora for research

### fustilio/syllst (this repo)

**Syllst** (Syllabus Syntax Tree) is a Unist-based AST specification for representing language learning syllabi and curriculum structure.

**Repository:** https://github.com/fustilio/syllst

**Purpose:** Course/lesson structure, curriculum organization, and content authoring in MDX.

**Key concepts:**
- `SyllabusRoot` - Course-level container
- `ChapterNode`, `SectionNode`, `LessonAstNode` - Hierarchical structure
- `VocabularySetNode`, `GrammarRuleNode`, `DialogueNode` - Learning content
- `ExerciseNode` - Practice activities
- `ContentNode` - Generic content (markdown, text, html, glost, glost-dialogue)

**Packages:**
- `@syllst/core` - Type definitions, Zod validation schemas, generic extension system
- `@syllst/processor` - MDX parsing and transformation pipeline
- `@syllst/glost` - GLOST integration plugin (remark plugin for word-level enrichment)

**Use cases:**
- Authoring language courses in MDX
- Structuring curriculum content
- Validating syllabus structure
- Generating learning materials

### fustilio/chishiki

**Chishiki** (知識, "knowledge") is a privacy-first Learning Record Store (LRS) with AI-powered activity generation.

**Repository:** https://github.com/fustilio/chishiki

**Purpose:** Learning system with spaced repetition, xAPI tracking, and activity generation. Currently a Chrome extension, with plans for platform-agnostic core.

**Key concepts:**
- Local xAPI-compliant Learning Record Store
- Content ingestion (text, YouTube transcripts)
- AI-powered flashcard and quiz generation (Chrome Built-in AI)
- Spaced repetition scheduling (SM-2 variant)
- Activity system with pluggable activity types

**Architecture:**
- `@chishiki/core` - Platform-agnostic learning engine
- `@chishiki/importer-syllst` - Syllst-to-Chishiki content adapter
- Storage adapters (OPFS, IndexedDB, better-sqlite3, Tauri)
- Shell implementations (Chrome extension, PWA, Tauri desktop)
- Activity plugins (flashcard, cloze, listening, speaking)
- Content importers (syllst, Anki, CSV, YouTube)

**Use cases:**
- Spaced repetition practice
- Learning analytics and tracking
- AI-generated study activities
- Cross-platform learning experience

## Integration Points

### Syllst → GLOST

Syllst integrates with GLOST for rich text representation at the sentence/word level:

| Syllst Feature | GLOST Integration |
|----------------|-------------------|
| `ContentNode.format` | Supports `'glost'` and `'glost-dialogue'` formats |
| `ContentNode.ref` | References GLOST document IDs |
| `DialogueTurnNode.glostSentences` | Embeds `GLOSTSentence[]` for word-level annotations |
| Reference validation | Validates GLOST document ID references |

**Example: ContentNode with GLOST reference**
```typescript
const content: ContentNode = {
  type: 'content',
  format: 'glost-dialogue',
  value: '', // Empty when using ref
  ref: 'dialogue-greeting-001', // GLOST document ID
};
```

**Example: DialogueTurn with GLOST sentences**
```typescript
const turn: DialogueTurnNode = {
  type: 'dialogueTurn',
  speakerId: 'speaker-a',
  text: 'สวัสดีครับ',
  transcription: 'sawatdee khrap',
  translation: 'Hello (male speaker)',
  value: 'สวัสดีครับ',
  glostSentences: [
    // GLOSTSentence with word-level glossing
    {
      words: [
        { text: 'สวัสดี', transcription: 'sawatdee', translation: 'hello' },
        { text: 'ครับ', transcription: 'khrap', translation: 'POLITE.M' },
      ],
    },
  ],
};
```

### Syllst → Chishiki

Chishiki imports syllst content for practice and review via `@chishiki/importer-syllst`
(lives in the chishiki repo — the consumer owns the adapter).

| Integration | Description |
|-------------|-------------|
| `@chishiki/importer-syllst` | Converts syllst AST nodes into Chishiki learning content |
| Content types | Syllst `vocabulary-set`, `dialogue`, `lesson` → `SyllstLearningContent` |
| Activity generation | Generate flashcards, cloze, quizzes from imported content |
| CMI5 extensions | Type-safe readers for CMI5/xAPI data from syllst's generic `ExtensionsMap` |

**Example: Converting syllst AST to Chishiki content**
```typescript
import { buildLessonFromMDX } from '@syllst/processor';
import { lessonToContentBundle, toContent } from '@chishiki/importer-syllst';

// Parse MDX into syllst AST
const lesson = await buildLessonFromMDX(mdxContent);

// Convert lesson + all children to learning content
const contents = lessonToContentBundle(lesson);

// Or convert a single node
const singleContent = toContent(lesson);
```

### GLOST → Chishiki

GLOST documents can be used in Chishiki for rich practice activities:

| Integration | Description |
|-------------|-------------|
| Word-level flashcards | Generate cards from GLOST word annotations |
| Listening practice | Use GLOST sentences with audio for listening activities |
| Cloze exercises | Generate fill-in-blank from GLOST sentences |
| Reading practice | Display GLOST-annotated text with progressive disclosure |

## Data Flow

```
┌─────────────────┐
│   MDX Content   │  (authored by course creators)
│  (syllst format)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    @syllst/     │  (parse and validate)
│   processor     │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│     GLOST       │    │    Chishiki     │
│  (word-level    │    │  (learning      │
│   annotation)   │    │   & practice)   │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
           ┌─────────────────┐
           │    Learner      │
           │   Application   │
           └─────────────────┘
```

## Separation of Concerns

| Project | Responsibility | Does NOT Handle |
|---------|---------------|-----------------|
| **GLOST** | Word/sentence annotation, linguistic processing, transcription | Curriculum structure, spaced repetition, xAPI |
| **Syllst** | Course/lesson structure, MDX authoring, content organization | Word-level analysis, learning analytics, practice sessions |
| **Chishiki** | Learning system, spaced repetition, xAPI tracking, activities | Content authoring, linguistic annotation |

## Design Principles

1. **Loose coupling** - Each project can be used independently
2. **Optional integration** - GLOST/Chishiki features are opt-in for syllst users
3. **Reference-based linking** - Projects link via IDs, not embedded data
4. **Validation at boundaries** - Reference validation ensures consistency
5. **No circular dependencies** - syllst-core has no runtime deps on glost/chishiki
6. **Platform agnostic** - Core packages work in any JavaScript environment

## Package Naming Conventions

| Ecosystem | Pattern | Examples |
|-----------|---------|----------|
| GLOST | `glost-{feature}` | `glost-th`, `glost-processor` |
| Syllst | `@syllst/{package}` | `@syllst/core`, `@syllst/processor` |
| Chishiki | `@chishiki/{package}` | `@chishiki/core`, `@chishiki/importer-syllst` |

## Package Architecture

```
@syllst/core           - Type definitions, Zod schemas, generic extension system
                         (no external deps, glostSentences typed as unknown[])

@syllst/processor      - MDX processing pipeline
  └── types/glost.ts       - GLOST type definitions and type guards
  └── builders/           - Lesson/course building from MDX

@syllst/glost          - GLOST integration plugin (remark plugin)
                         Enriches syllst nodes with word-level annotations

@chishiki/importer-syllst  - Syllst → Chishiki adapter (lives in chishiki repo)
                              Converts AST nodes to learning content, typed CMI5/xAPI readers
```

**Adapter placement rule:** The adapter lives with whoever is doing the consuming.
- `@syllst/glost` → in syllst (syllst consumes glost annotations)
- `@chishiki/importer-syllst` → in chishiki (chishiki consumes syllst content)
