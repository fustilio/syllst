# Syllst Examples

This directory contains example syllabi and usage patterns for syllst.

## Contents

- **[TRANSFORMATION_EXAMPLES.md](./TRANSFORMATION_EXAMPLES.md)** - Examples of MDX to syllst AST transformations
- **[pipeline-demo.test.ts](./pipeline-demo.test.ts)** - Comprehensive test suite demonstrating the full pipeline

## Example MDX Files

### Complete Course Example

#### Thai Food Course (`thai-food-course/`)
A **complete, real-world course structure** demonstrating:
- **`meta.mdx`** - Full SyllabusRoot with rich metadata
  - Course overview and objectives
  - Key concepts and cultural context
  - Lesson structure outline
  - Prerequisites and metadata
- **`lessons/lesson-*.mdx`** - Multiple lesson files
  - Progressive lesson ordering
  - Vocabulary sets with transliteration
  - Exercises and examples
  - Cultural notes
- **`index.ts`** - Course configuration and paths
- **`README.md`** - Course documentation

This is the most comprehensive example, showing how a real course is structured.

### Simple Course Structure

#### Course Syllabus (`course-syllabus.mdx`)
A basic course/syllabus root demonstrating:
- SyllabusRoot structure with metadata
- Course-level information (language, source, version)
- Course overview and description

#### Chapter (`chapter-foundation.mdx`)
A chapter/module structure showing:
- ChapterNode with metadata
- Chapter organization and ordering
- Difficulty and CEFR level assignment

### Lesson Examples

#### Basic Lesson (`basic-lesson.mdx`)
A simple lesson demonstrating:
- Grammar rules with nested examples
- Vocabulary sets with multiple items
- Fill-in-blank and translation exercises

#### Dialogue Lesson (`dialogue-lesson.mdx`)
A lesson showcasing:
- Dialogue nodes with multiple turns
- Speaker participants
- Cultural notes
- Shopping context

#### Character Lesson (`character-lesson.mdx`)
An alphabet learning lesson with:
- Character sets (vowels and consonants)
- Character items with transliteration
- Example sets

#### Complex Lesson (`complex-lesson.mdx`)
An advanced lesson featuring:
- Complex grammar rules with multiple examples
- Advanced vocabulary
- Multiple exercise types (transformation, multiple-choice)
- Nested structures

## Running the Examples

### Run the Pipeline Demo Tests

```bash
# From the repository root
pnpm test examples/pipeline-demo.test.ts

# Or run all tests
pnpm test
```

### Use Examples in Your Code

```typescript
import { readFileSync } from 'fs';
import { buildLessonFromMDX } from '@syllst/processor';
import { validateLesson } from '@syllst/processor/validators';

// Load an example
const mdx = readFileSync('examples/basic-lesson.mdx', 'utf-8');

// Parse and transform
const lesson = await buildLessonFromMDX(mdx);

// Validate
const validation = validateLesson(lesson);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## Course Structure Hierarchy

The syllst structure follows this hierarchy:

```
SyllabusRoot (Course)
  └── ChapterNode (Module/Chapter)
      └── LessonAstNode (Lesson/Unit)
          └── Content Nodes (Grammar, Vocabulary, Exercises, etc.)
```

### Structure Levels

1. **SyllabusRoot** - Top-level course structure
   - Contains course metadata (language, source, version)
   - Contains chapters as children
   - Example: `course-syllabus.mdx`

2. **ChapterNode** - Organizational unit
   - Groups related lessons
   - Contains lessons as children
   - Example: `chapter-foundation.mdx`

3. **LessonAstNode** - Individual lesson
   - Contains learning content
   - Grammar, vocabulary, exercises, dialogues
   - Example: `basic-lesson.mdx`

## Pipeline Overview

The syllst processing pipeline follows these steps:

1. **MDX Parsing** - Parse MDX string into MDAST (Markdown AST)
2. **Directive Transformation** - Transform custom directives into Unist nodes
3. **Tree Building** - Convert MDAST to Syllabus Unist Tree
4. **Validation** - Validate structure and required fields

```
MDX String → MDAST → Syllabus Unist Tree → Validated Nodes
```

## Adding Examples

To add a new example:

1. Create a new `.mdx` file in this directory
2. Follow the syllst MDX syntax (see [TRANSFORMATION_EXAMPLES.md](./TRANSFORMATION_EXAMPLES.md))
3. Add a test case in `pipeline-demo.test.ts` if needed
4. Update this README with a description

## License

MIT
