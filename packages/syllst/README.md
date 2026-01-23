# @syllst/core

**Syllabus Syntax Tree** - Unist-based type definitions for language learning syllabi.

A framework-agnostic syntax tree schema for representing structured learning content, similar to other Unist-based formats like MDX AST or text syntax trees.

## Overview

This package provides **type definitions and validation schemas** for representing language learning syllabi as structured data. It is designed to be language-agnostic and framework-independent.

- **Unist-based schema** for language-agnostic syllabus representation
- **TypeScript types** for all syllabus node types
- **Zod schemas** for runtime validation
- **Type guards** for runtime type checking
- **Lightweight** - only depends on `@types/unist` and `zod`

## Installation

```bash
pnpm add @syllst/core
```

or with npm:

```bash
npm install @syllst/core
```

or with yarn:

```bash
yarn add @syllst/core
```

## Usage

### Types Only

```typescript
import type {
  LessonAstNode,
  GrammarRuleNode,
  VocabularySetNode,
  VocabularyItemNode,
  ExampleNode,
  ExampleSetNode,
  ExerciseNode,
} from '@syllst/core/types';

// Use types for your own data structures
const lesson: LessonAstNode = {
  type: 'lesson',
  id: 'lesson-01',
  title: 'Basic Greetings',
  order: 1,
  children: [],
};
```

### With Validation

```typescript
import { validateLesson, LessonAstNodeSchema } from '@syllst/core/schemas';
import type { LessonAstNode } from '@syllst/core/types';

const lesson: LessonAstNode = {
  type: 'lesson',
  id: 'lesson-01-greetings',
  title: 'Basic Greetings',
  difficulty: 'beginner',
  cefrLevel: 'A1',
  children: [],
};

const result = validateLesson(lesson);
if (!result.valid) {
  console.error(result.errors);
}
```

## Unist Schema

All nodes follow the [Unist specification](https://github.com/syntax-tree/unist):

```typescript
import type {
  SyllabusRoot,
  LessonAstNode,
  GrammarRuleNode,
  VocabularySetNode,
  VocabularyItemNode,
  ExampleNode,
  ExampleSetNode,
  ExerciseNode,
  CharacterSetNode,
  CharacterItemNode,
  DialogueNode,
  DialogueTurnNode,
  DialogueParticipant,
} from '@syllst/core/types';
```

### Node Types

| Type | Description |
|------|-------------|
| `SyllabusRoot` | Root node with meta and chapters |
| `ChapterNode` | Chapter containing sections/lessons |
| `SectionNode` | Section containing lessons |
| `LessonAstNode` | Complete lesson with content |
| `GrammarRuleNode` | Grammar explanation with examples |
| `VocabularySetNode` | Set of vocabulary items |
| `VocabularyItemNode` | Single vocabulary word |
| `ExampleSetNode` | Set of example sentences |
| `ExampleNode` | Single example sentence |
| `ExerciseNode` | Practice exercise |
| `CharacterSetNode` | Alphabet/character set |
| `CharacterItemNode` | Single character |
| `DialogueNode` | Conversation with turns |
| `DialogueTurnNode` | Single dialogue turn |
| `ContentNode` | Markdown/text content |
| `MetadataNode` | Key-value metadata |

### Enums and Types

| Type | Values |
|------|--------|
| `CEFRLevel` | A1, A2, B1, B2, C1, C2 |
| `GrammarDifficulty` | beginner, intermediate, advanced |
| `CharacterType` | vowel, consonant |
| `ExerciseType` | fill-in-blank, multiple-choice, translation, etc. |
| `ContentFormat` | markdown, text, html |
| `GrammaticalGender` | masculine, feminine, neuter |

## Type Guards

```typescript
import {
  isLessonNode,
  isGrammarRuleNode,
  isVocabularySetNode,
  isSyllabusRoot,
} from '@syllst/core/types';

if (isLessonNode(node)) {
  // TypeScript knows node is LessonAstNode
  console.log(node.title);
}
```

## Zod Schemas

Runtime validation schemas for all node types:

```typescript
import {
  validateNode,
  validateLesson,
  validateDialogue,
  formatValidationErrors,
} from '@syllst/core/schemas';

// Validate any node
const result = validateNode(someNode);
if (!result.valid) {
  console.log(formatValidationErrors(result.errors));
}

// Validate specific types
const lessonResult = validateLesson(lesson);
const dialogueResult = validateDialogue(dialogue);

// Strict mode throws on error
validateLesson(lesson, { strict: true });
```

### Available Schemas

**Base Schemas:**

| Schema | Description |
|--------|-------------|
| `PointSchema` | Unist position point (line, column, offset) |
| `PositionSchema` | Unist position (start, end) |
| `CEFRLevelSchema` | CEFR levels (A1-C2) |
| `GrammarDifficultySchema` | beginner, intermediate, advanced |
| `ExerciseTypeSchema` | fill-in-blank, multiple-choice, etc. |

**Node Schemas:**

| Schema | Description |
|--------|-------------|
| `LessonAstNodeSchema` | Complete lesson validation |
| `GrammarRuleNodeSchema` | Grammar rule with examples |
| `VocabularySetNodeSchema` | Vocabulary set with items |
| `VocabularyItemNodeSchema` | Single vocabulary item |
| `DialogueNodeSchema` | Dialogue with turns |
| `DialogueTurnNodeSchema` | Single dialogue turn |
| `ExerciseNodeSchema` | Exercise with questions/answers |
| `ExampleNodeSchema` | Example sentence |
| `CharacterSetNodeSchema` | Character/alphabet set |
| `CharacterItemNodeSchema` | Single character |

### Validation Functions

```typescript
import {
  getSchemaForNodeType,
  validateNode,
  validateLesson,
  validateSyllabus,
  validateDialogue,
  validateBeforeContentLayer,
  formatValidationErrors,
} from '@syllst/core/schemas';

// Get schema by node type
const schema = getSchemaForNodeType('lesson');

// Validate for ContentLayer generation
const { valid, errors } = validateBeforeContentLayer(lesson);
```

## Package Structure

```
src/
├── types/
│   ├── nodes.ts           # Unist node type definitions
│   ├── extensions.ts      # Extension types (CMI5, SCORM, etc.)
│   └── index.ts           # Re-exports
├── schemas/
│   ├── base.ts            # Base Zod schemas (Point, enums)
│   ├── nodes.ts           # Node Zod schemas
│   ├── extensions.ts      # Extension Zod schemas
│   └── index.ts           # Validation utilities
└── index.ts               # Main exports
```

## Related Packages

This package is designed to work with various processing and content packages:

- **Processor packages** - MDX parsing, transformation pipelines (separate packages)
- **Content packages** - Language-specific syllabi using this syntax (separate packages)
- **Extension packages** - CMI5, SCORM, xAPI integrations (separate packages)

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

**Test Coverage:**

| Test Suite | Tests | Description |
|------------|-------|-------------|
| `base.test.ts` | 82 | Base schemas (Point, Position, enums) |
| `nodes.test.ts` | 46 | Node schemas (lesson, dialogue, vocab, etc.) |
| `index.test.ts` | 41 | Validation functions and error formatting |

**Total: 169 tests**

### Type Check

```bash
npm run typecheck
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
