# @syllst/processor

**MDX parsing and transformation pipeline for syllst** — converts MDX-authored curriculum content into structured, validated syntax trees.

## Overview

This is where the transformation happens. The processor takes MDX content with custom directives and produces a validated syllst Unist tree.

```
MDX Content → remark-parse → MDAST → remark-syllabus-directives → Syllst Unist Tree → Zod Validation
```

## Installation

```bash
pnpm add @syllst/processor
```

## Usage

### Build a Lesson from MDX

```typescript
import { buildLessonFromMDX } from '@syllst/processor';

const mdx = `
---
type: lesson
id: lesson-01
title: "Basic Greetings"
order: 1
difficulty: beginner
cefrLevel: A1
---

:::vocabulary-set{id="greetings" title="Basic Greetings"}
::vocab{word="สวัสดี" transcription="sawatdee" translation="Hello"}
::
:::

:::grammar-rule{id="particles" title="Polite Particles"}
Thai uses gender-specific polite particles.
:::

:::phonological-rule{id="tone-mid" title="Middle-Class Tones" ruleType="tone"}
Middle-class consonants produce all 5 tones.
::rule-condition{condition='{"consonantClass":"middle","toneMark":"none"}' result="mid" example="กา"}
::
:::
`;

const lesson = await buildLessonFromMDX(mdx);
// Returns a validated LessonAstNode
```

### Use the Remark Plugin Directly

```typescript
import { createMDXParser } from '@syllst/processor/builders';
import { remarkSyllabusDirectives } from '@syllst/processor/plugins';

const parser = createMDXParser()
  .use(remarkSyllabusDirectives);

const tree = await parser.run(parser.parse(mdxContent));
```

### Validation

```typescript
import { validateLesson } from '@syllst/processor/validators';

const result = validateLesson(lesson);
if (!result.valid) {
  console.error(result.errors);
}
```

## Supported Directives

### Container Directives (`:::`)

| Directive | Produces | Children |
|-----------|----------|----------|
| `:::grammar-rule` | `GrammarRuleNode` | Examples, content |
| `:::vocabulary-set` | `VocabularySetNode` | Vocabulary items |
| `:::character-set` | `CharacterSetNode` | Character items |
| `:::example-set` | `ExampleSetNode` | Examples |
| `:::dialogue` | `DialogueNode` | Dialogue turns |
| `:::exercise` | `ExerciseNode` | Content |
| `:::phonological-rule` | `PhonologicalRuleNode` | Rule conditions, examples |
| `:::syllable-pattern` | `SyllablePatternNode` | Pattern examples, content |
| `:::writing-pattern` | `WritingPatternNode` | Examples, content |

### Leaf Directives (`::`)

| Directive | Produces |
|-----------|----------|
| `::vocab` | `VocabularyItemNode` |
| `::character` | `CharacterItemNode` |
| `::example` | `ExampleNode` |
| `::dialogue-turn` | `DialogueTurnNode` |
| `::rule-condition` | `RuleConditionNode` |
| `::pattern-example` | `PatternExampleNode` |

## Subpath Exports

| Import | Contents |
|--------|----------|
| `@syllst/processor` | Everything (types, builders, plugins, validators, utils) |
| `@syllst/processor/builders` | `buildLessonFromMDX`, `createMDXParser`, `extractFrontmatter` |
| `@syllst/processor/plugins` | `remarkSyllabusDirectives` remark plugin |
| `@syllst/processor/validators` | `validateLesson`, Zod-based validation |
| `@syllst/processor/utils` | Tree traversal and text extraction utilities |
| `@syllst/processor/config` | Pipeline configuration |

## Pipeline Steps

1. **MDX Parsing** — Parse MDX string into MDAST using remark
2. **Frontmatter Extraction** — Extract YAML frontmatter as lesson metadata
3. **Directive Transformation** — `remarkSyllabusDirectives` converts custom directives (:::, ::) into syllst node types
4. **Tree Building** — MDAST transformed into syllst Unist tree
5. **Validation** — Optional Zod schema validation

## Development

```bash
pnpm test        # Run tests (37 tests)
pnpm build       # Build TypeScript
pnpm typecheck   # Type check
```

## License

MIT
