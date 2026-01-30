# @syllst/core

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
