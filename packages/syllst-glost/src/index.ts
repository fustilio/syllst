/**
 * @syllst/glost
 *
 * GLOST word-level annotation plugin for syllst.
 *
 * @example
 * ```typescript
 * import { createMDXParser } from '@syllst/processor';
 * import { remarkSyllabusDirectives } from '@syllst/processor/plugins';
 * import { remarkSyllstGlost } from '@syllst/glost';
 *
 * const processor = createMDXParser()
 *   .use(remarkSyllabusDirectives)
 *   .use(remarkSyllstGlost, {
 *     languages: [{
 *       lang: 'th',
 *       transcriptionProvider: createThaiTranscriptionProvider(),
 *       defaultScheme: 'paiboon+'
 *     }],
 *     defaultLang: 'th'
 *   });
 * ```
 */

// Main plugin
export { remarkSyllstGlost } from './plugin.js';

// Types
export type {
  RemarkSyllstGlostOptions,
  LanguageProviderConfig,
  TranscriptionProvider,
  EnrichTarget,
  EnrichmentResult,
  SyllstGlostMeta,
} from './types.js';

// Providers (for advanced usage)
export {
  LanguageProviderRegistry,
  createProviderRegistry,
} from './providers/index.js';

// Enrichers (for advanced/custom usage)
export {
  enrichVocabularyItem,
  enrichDialogueTurn,
  enrichExample,
} from './enrichers/index.js';
