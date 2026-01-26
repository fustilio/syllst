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
- `@syllst/core` - Type definitions and Zod validation schemas
- `@syllst/processor` - MDX parsing and transformation pipeline

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

**Architecture (planned):**
- `@chishiki/core` - Platform-agnostic learning engine
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

Chishiki imports syllst content for practice and review:

| Integration | Description |
|-------------|-------------|
| `@chishiki/importer-syllst` | Import syllst MDX courses into Chishiki |
| Content types | Syllst `vocabulary-set`, `dialogue`, `lesson` → Chishiki `LearningContent` |
| Activity generation | Generate flashcards, cloze, quizzes from syllst content |
| Reference linking | Chishiki activities can reference syllst content IDs |

**Example: Importing syllst content**
```typescript
import { syllstImporter } from '@chishiki/importer-syllst';

// Register the importer
chishiki.importers.register(syllstImporter);

// Import a syllst lesson
const content = await chishiki.content.import({
  type: 'file',
  file: lessonFile, // .mdx file
});

// Generate flashcards from vocabulary sets
const activities = await chishiki.activities.create(
  content.id,
  'flashcard'
);
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

## Package Architecture (Planned)

The current implementation has Chishiki integration in `@syllst/processor`, but the target architecture is:

```
@syllst/core           - Type definitions and Zod schemas (no external deps)
  └── GLOST types      - Optional GLOST sentence types (type-only, no runtime dep)

@syllst/processor      - Base MDX processing pipeline
  └── No integration code (pure parsing/transformation)

@syllst/glost          - GLOST integration adapter (future)
  └── Depends on glost-core
  └── Provides syllst-to-GLOST conversion

@syllst/chishiki       - Chishiki integration adapter (future)
  └── Provides syllst-to-Chishiki export
  └── Provides activity hints
```

## Future Integrations

- **@syllst/glost** - Convert syllst nodes to GLOST documents, process with glost-processor
- **@syllst/chishiki** - Export syllst content to Chishiki, generate activity hints
- **Unified content pipeline** - Single pipeline from MDX to annotated, reviewable content
- **Cross-project validation** - Validate references across all three projects
