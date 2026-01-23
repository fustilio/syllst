# Thai Food Course Example

This is a complete, real-world example of a syllst course structure, showcasing:

- **SyllabusRoot** (`meta.mdx`) - Complete course metadata and overview
- **Multiple Lessons** (`lessons/*.mdx`) - Individual lesson files
- **Course Organization** - How lessons relate to the course

## Structure

```
thai-food-course/
├── meta.mdx              # Course/syllabus root definition
├── lessons/
│   ├── lesson-01.mdx     # Essential Food Words
│   ├── lesson-02.mdx     # Tastes & Flavors
│   └── ...               # Additional lessons
├── index.ts              # Course configuration and paths
└── README.md             # This file
```

## Course Metadata

The `meta.mdx` file defines:
- Course ID, title, language
- Version and extraction timestamp
- Source information
- Course objectives and prerequisites
- Course overview and key concepts
- Lesson structure outline

## Lessons

Each lesson (`lesson-*.mdx`) contains:
- Lesson metadata (id, title, order, parentId)
- Difficulty and CEFR level
- Categories and objectives
- Vocabulary sets
- Grammar rules
- Examples and exercises
- Cultural notes

## Usage

```typescript
import { buildLessonFromMDX } from '@syllst/processor';
import { readFileSync } from 'fs';
import { THAI_FOOD_META_PATH, THAI_FOOD_LESSON_PATHS } from './index';

// Load course metadata
const metaContent = readFileSync(THAI_FOOD_META_PATH, 'utf-8');
// Note: Would need a buildSyllabusRootFromMDX function

// Load a lesson
const lessonContent = readFileSync(THAI_FOOD_LESSON_PATHS.lesson01, 'utf-8');
const lesson = await buildLessonFromMDX(lessonContent);
```

## Features Demonstrated

- ✅ Complete course structure
- ✅ Rich metadata at course and lesson levels
- ✅ Vocabulary sets with transliteration
- ✅ Cultural context and notes
- ✅ Progressive lesson ordering
- ✅ Prerequisites and objectives
- ✅ Real-world Thai language content
