# @syllst/processor

**MDX parsing and transformation pipeline for syllst**

This package provides MDX parsing, transformation, and validation capabilities for syllst.

> **Status**: Coming soon

## Installation

```bash
pnpm add @syllst/processor
```

## Usage

```typescript
import { buildLessonFromMDX } from '@syllst/processor';
import type { LessonAstNode } from '@syllst/core';

const mdxContent = `...`;
const lesson: LessonAstNode = await buildLessonFromMDX(mdxContent);
```

## License

MIT
