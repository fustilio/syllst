# @syllst/{{LANG}}

**{{DESCRIPTION}}** — MDX-authored curriculum content for {{LANGUAGE}} language learning.

## Installation

```bash
pnpm add @syllst/{{LANG}}
```

## Exports

This package provides subpath exports for each syllabus module:

| Subpath | Description | Lesson Count |
|---------|-------------|-------------|
{{EXPORTS_TABLE}}

## Quick Start

```typescript
import {
  hiraganaLessons,
  katakanaLessons,
  essentialsLessons,
  numbersLessons,
} from '@syllst/{{LANG}}';

// Use a specific syllabus
for (const lesson of hiraganaLessons) {
  console.log(lesson.title);
}
```

### With @syllst/processor

```typescript
import { buildLessonFromMDX } from '@syllst/processor';
import { essentialsLessons } from '@syllst/{{LANG}}';

const lesson = await buildLessonFromMDX(essentialsLessons[0].content);
// Returns a validated LessonAstNode
```

## Syllabi Structure

Each syllabus is organized as a directory of `.mdx` lesson files:

```
syllst-{{LANG}}/
└── src/syllabi/
    ├── {MODULE-1}/
    │   └── lessons/
    │       ├── lesson-01.mdx
    │       ├── lesson-02.mdx
    │       └── ...
    └── ...
```

## Dependencies

| Package | Version | Role |
|---------|---------|------|
| `@syllst/core` | ^0.6.0 | Unist types and Zod schemas |
| `@syllst/processor` | ^0.5.0 | MDX parsing pipeline |
| `@polyglot-bundles/{{LANG}}-lang` | varies | Language-specific reference data |

## Version History

| Version | Date | Notes |
|---------|------|-------|
| {{VERSION}} | {{DATE}} | Current |

## License

MIT