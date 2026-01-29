/**
 * Vocabulary Enricher
 *
 * Enriches VocabularyItemNode with GLOST transcription data.
 */

import type { VocabularyItemNode, TranscriptionObject } from '@syllst/core/types';
import type {
  LanguageProviderConfig,
  RemarkSyllstGlostOptions,
} from '../types.js';

/**
 * Enrich a VocabularyItemNode with GLOST annotations
 *
 * Adds transcription data from the language provider to the vocabulary item.
 *
 * @param node - The vocabulary item node to enrich
 * @param provider - Language provider configuration
 * @param options - Plugin options
 */
export async function enrichVocabularyItem(
  node: VocabularyItemNode,
  provider: LanguageProviderConfig,
  options: RemarkSyllstGlostOptions
): Promise<string[]> {
  const word = node.word;
  const schemesApplied: string[] = [];

  if (!word || !provider.transcriptionProvider) {
    return schemesApplied;
  }

  const transcriptionProvider = provider.transcriptionProvider;

  // Determine which schemes to use
  const schemes =
    options.schemes ??
    (transcriptionProvider.getDefaultScheme
      ? [transcriptionProvider.getDefaultScheme()]
      : ['default']);

  if (schemes.length === 1) {
    // Single scheme - use simple string format
    const scheme = schemes[0]!;
    const transcription = transcriptionProvider.getTranscription(word, scheme);
    if (transcription) {
      node.transcription = transcription;
      schemesApplied.push(scheme);
    }
  } else {
    // Multiple schemes - use TranscriptionObject format
    const transcriptionObj: TranscriptionObject = {
      primary: '',
    };

    for (const scheme of schemes) {
      const transcription = transcriptionProvider.getTranscription(word, scheme);
      if (transcription) {
        if (!transcriptionObj.primary) {
          transcriptionObj.primary = transcription;
        }
        transcriptionObj[scheme] = transcription;
        schemesApplied.push(scheme);
      }
    }

    if (transcriptionObj.primary) {
      node.transcription = transcriptionObj;
    }
  }

  return schemesApplied;
}
