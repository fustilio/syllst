# @syllst/validator

CLI tool for validating Syllst MDX content.

## Installation

```bash
pnpm add @syllst/validator
```

Or install globally:

```bash
pnpm add -g @syllst/validator
```

## CLI Usage

### Basic Validation

```bash
# Validate a single file
syllst-validate lesson.mdx

# Validate a directory
syllst-validate lessons/

# Validate current directory recursively
syllst-validate . -r
```

### Options

```
Usage:
  syllst-validate <file|directory> [options]

Arguments:
  <file>        Validate a single MDX file
  <directory>   Batch validate all MDX files in directory

Options:
  --strict              Enable strict validation mode
  --format=<format>     Output format: human (default), json
  --output=<file>       Write output to file instead of stdout
  --recursive, -r       Recursively search directories
  --quiet, -q           Only output errors (no warnings)
  --verbose, -v         Show detailed validation info
  --help, -h            Show help message
  --version             Show version
```

### Examples

```bash
# Strict validation with verbose output
syllst-validate content/ --strict --verbose

# Generate JSON report
syllst-validate . -r --format=json --output=validation-report.json

# CI-friendly: quiet mode, exit code indicates success/failure
syllst-validate src/lessons/ -r -q
```

## Output Formats

### Human-Readable (Default)

```
Syllst Validation Report
========================================
Files: 3 | Valid: 2 | Invalid: 1

✓ lessons/lesson-01.mdx

✓ lessons/lesson-02.mdx

✗ lessons/lesson-03.mdx
  ✗ Lesson must have an id
  ✗ Grammar rule at index 0 must have a title
  ⚠ Missing recommended description field

✗ Validation failed: 1 file(s) with errors
```

### Verbose Mode

```
✓ lessons/lesson-01.mdx
  Stages:
    Syntax:      ✓
    Structure:   ✓
    References:  ✓
    GLOST:       ✓
    External:    ✓
  Duration: 45ms
```

### JSON Format

```json
{
  "summary": {
    "total": 3,
    "valid": 2,
    "invalid": 1,
    "timestamp": "2026-01-27T10:30:00.000Z"
  },
  "results": [
    {
      "file": "lessons/lesson-01.mdx",
      "valid": true,
      "errors": [],
      "warnings": [],
      "stages": {
        "syntax": true,
        "structure": true,
        "references": true,
        "glost": true,
        "externalFormats": true
      },
      "duration": 45
    }
  ]
}
```

## Validation Stages

The validator runs a multi-stage validation pipeline:

| Stage | Description |
|-------|-------------|
| **Syntax** | Zod schema validation of node structure |
| **Structure** | Validates node relationships and hierarchy |
| **References** | Validates internal references and IDs |
| **GLOST** | Validates GLOST document references (if present) |
| **External Formats** | Validates SCORM, xAPI, CMI5 extensions |

## Programmatic API

```typescript
import { validateCommand, formatHumanOutput, formatJsonOutput } from '@syllst/validator';
import type { ValidateOptions, FileValidationResult } from '@syllst/validator';

// Run validation programmatically
const options: ValidateOptions = {
  strict: true,
  format: 'human',
  recursive: true,
  quiet: false,
  verbose: false,
};

const exitCode = await validateCommand(['./content'], options);
```

### Types

```typescript
interface ValidateOptions {
  strict: boolean;           // Enable strict validation
  format: 'human' | 'json';  // Output format
  output?: string;           // Output file path
  recursive: boolean;        // Recursive directory search
  quiet: boolean;            // Suppress warnings
  verbose: boolean;          // Show detailed info
}

interface FileValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stages: {
    syntax: boolean;
    structure: boolean;
    references: boolean;
    glost: boolean;
    externalFormats: boolean;
  };
  duration: number;
}
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All files valid |
| 1 | One or more files invalid |

## CI Integration

### GitHub Actions

```yaml
- name: Validate Syllst content
  run: |
    pnpm exec syllst-validate content/ -r --strict -q
```

### Pre-commit Hook

```bash
#!/bin/sh
pnpm exec syllst-validate content/ -r -q || exit 1
```

## License

MIT
