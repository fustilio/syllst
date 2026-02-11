/**
 * @module @syllst/processor/plugins/transformers
 *
 * Pluggable directive transformer architecture.
 *
 * Provides the DirectiveTransformer interface, a registry
 * for managing transformers, and built-in transformers for
 * all standard syllst directive types.
 *
 * @example Consumer-defined custom transformer:
 * ```typescript
 * import {
 *   DirectiveTransformer,
 *   remarkSyllabusDirectives,
 * } from '@syllst/processor';
 *
 * const myTransformer: DirectiveTransformer = {
 *   name: 'my-custom',
 *   directives: ['my-widget'],
 *   canHandle(name) { return name === 'my-widget'; },
 *   transform(directive) {
 *     return { type: 'myWidget', id: directive.attributes?.id };
 *   },
 * };
 *
 * createMDXParser().use(remarkSyllabusDirectives, {
 *   transformers: [myTransformer],
 * });
 * ```
 */

// Core interfaces
export type { DirectiveTransformer } from "./directive-transformer.js";
export { DirectiveTransformerRegistry } from "./transformer-registry.js";

// Shared types and helpers
export type {
  DirectiveNode,
  TransformContext,
} from "./shared/types.js";
export {
  parseTranscription,
  extractDataAttributes,
  parseTags,
  parseListItems,
  extractListText,
  parseGenderVariants,
  collectSiblingContent,
} from "./shared/helpers.js";

// Built-in transformers
export { grammarTransformer } from "./grammar-transformer.js";
export { vocabularyTransformer } from "./vocabulary-transformer.js";
export { characterTransformer } from "./character-transformer.js";
export { exampleTransformer } from "./example-transformer.js";
export { exerciseTransformer } from "./exercise-transformer.js";
export { dialogueTransformer } from "./dialogue-transformer.js";
export { phonologicalTransformer } from "./phonological-transformer.js";
export { syllableTransformer } from "./syllable-transformer.js";
export { writingTransformer } from "./writing-transformer.js";

import { grammarTransformer } from "./grammar-transformer.js";
import { vocabularyTransformer } from "./vocabulary-transformer.js";
import { characterTransformer } from "./character-transformer.js";
import { exampleTransformer } from "./example-transformer.js";
import { exerciseTransformer } from "./exercise-transformer.js";
import { dialogueTransformer } from "./dialogue-transformer.js";
import { phonologicalTransformer } from "./phonological-transformer.js";
import { syllableTransformer } from "./syllable-transformer.js";
import { writingTransformer } from "./writing-transformer.js";
import type { DirectiveTransformer } from "./directive-transformer.js";

/**
 * All built-in transformers in registration order.
 *
 * Consumer code can import this to get the default set,
 * then append or prepend custom transformers.
 */
export const builtInTransformers: DirectiveTransformer[] = [
  grammarTransformer,
  vocabularyTransformer,
  characterTransformer,
  exampleTransformer,
  exerciseTransformer,
  dialogueTransformer,
  phonologicalTransformer,
  syllableTransformer,
  writingTransformer,
];
