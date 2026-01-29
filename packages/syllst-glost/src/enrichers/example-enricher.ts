/**
 * Example Enricher
 *
 * Enriches ExampleNode with GLOST transcription data.
 */

import type { ExampleNode, TranscriptionObject } from '@syllst/core/types';
import type {
  LanguageProviderConfig,
  RemarkSyllstGlostOptions,
} from '../types.js';

/**
 * Enrich an ExampleNode with GLOST annotations
 *
 * Adds transcription data from the language provider to the example.
 *
 * @param node - The example node to enrich
 * @param provider - Language provider configuration
 * @param options - Plugin options
 */
export async function enrichExample(
  node: ExampleNode,
  provider: LanguageProviderConfig,
  options: RemarkSyllstGlostOptions
): Promise<string[]> {
  const text = node.text;
  const schemesApplied: string[] = [];

  if (!text || !provider.transcriptionProvider) {
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
    const transcription = transcriptionProvider.getTranscription(text, scheme);
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
      const transcription = transcriptionProvider.getTranscription(text, scheme);
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
