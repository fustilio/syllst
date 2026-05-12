# @syllst/core

## 0.7.0

### Minor Changes

- Add canonical `TranscriptionObject` shape `{ schemes: Record<string, string>, primary?: string }` where `primary` is a key into `schemes`. Ships as a transitional union alongside the legacy shape — existing producers keep working, new producers should emit the canonical form. Adds `normalizeTranscription`, `isValidTranscription`, `isCanonicalTranscriptionObject`, and `isLegacyTranscriptionObject` helpers. The strict-primary rule (`primary` must be a key of `schemes`) is enforced at runtime by the helpers and by the Zod schema, not in the TypeScript type.

  See `docs/adr/0001-transcription-object-shape.md`. Legacy union arm will be removed in 2.0.

## 0.6.1

### Patch Changes

- update config

## 0.5.2

### Patch Changes

- Patch version bump for republishing

## 0.5.1

### Patch Changes

- Patch version bump for republishing

## 0.4.2

### Patch Changes

- update build config add JS extensions for syllst-processor

## 0.4.1

### Patch Changes

- fix: add .js extensions to ESM imports in @syllst/core

## 0.4.0

### Minor Changes

- **Discriminated union exercise types**: `ExerciseNode` is now a discriminated union on `exerciseType`, enforcing per-type structural requirements at both TypeScript and Zod validation levels
- Per-type interfaces: `MultipleChoiceExercise`, `MatchingExercise`, `FillInBlankExercise`, `TrueFalseExercise`, `TranslationExercise`, `TransformationExercise`, `PatternPracticeExercise`, `DialogueExercise`, `OpenEndedExercise`
- Per-type Zod schemas with structural constraints (required options, minimum items, answer format)
- Per-type type guards: `isMultipleChoiceExercise()`, `isMatchingExercise()`, `isFillInBlankExercise()`, `isTrueFalseExercise()`, `isTranslationExercise()`, `isTransformationExercise()`, `isPatternPracticeExercise()`, `isDialogueExercise()`, `isOpenEndedExercise()`
- `open-ended` exercise `answer` field is now optional
- `true-false` exercise `answer` is validated to be `"true"` or `"false"`
- `multiple-choice` requires `options` with at least 2 entries
- `matching` requires `items` with at least 2 pairs
- `transformation`, `pattern-practice`, `dialogue` require `items` with at least 1 entry

## 0.3.0

### Minor Changes

- use consolidated definitions from core

## 0.2.1

### Patch Changes

- remove unused imports

## 0.2.0

### Minor Changes

- Add extensible transcription field supporting multiple systems
- Move language-specific fields to data extension object
- Add CourseBundle type and buildCourseBundle() function
- Add GLOST type alignment and Chishiki export interface
- Add course statistics and indices
- Remove deprecated transliteration and language-specific fields
- Add migration codemod and ecosystem documentation
