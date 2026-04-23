export type {
  SrsCard,
  SrsPrompt,
  SrsAnswer,
  ActivityType,
  SourceNodeType,
  GeneratorOptions,
  DeckBuildOptions,
  SrsGenerator,
} from './types.js';

export {
  generateVocabularyCards,
  generateGrammarCards,
  generateExampleCards,
  generateCharacterCards,
  generateExerciseCards,
} from './generators/index.js';

export {
  buildSrsDeckFromLesson,
  buildSrsDeckFromSyllabus,
  buildSrsDeckFromLessons,
} from './builder.js';

export type {
  FidelityOptions,
  FidelityReport,
  FieldFidelity,
  AnkiCardForComparison,
  CardPair,
} from './fidelity/index.js';

export {
  compareCardSets,
  calculateSimilarity,
  normalizeText,
  compareSingleCard,
  computeFieldFidelity,
} from './fidelity/compare.js';

export { runFidelityTest } from './fidelity/harness.js';
