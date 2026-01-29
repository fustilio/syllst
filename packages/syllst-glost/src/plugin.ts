/**
 * remarkSyllstGlost
 *
 * Remark plugin that enriches syllst nodes with GLOST word-level annotations.
 */

import { visit } from 'unist-util-visit';
import type { Root as MdastRoot } from 'mdast';
import type { Plugin, Transformer } from 'unified';
import type { VFile } from 'vfile';
import type {
  RemarkSyllstGlostOptions,
  SyllstGlostMeta,
  EnrichmentResult,
  EnrichTarget,
} from './types.js';
import { createProviderRegistry } from './providers/language-provider.js';
import { enrichVocabularyItem } from './enrichers/vocabulary-enricher.js';
import { enrichDialogueTurn } from './enrichers/dialogue-enricher.js';
import { enrichExample } from './enrichers/example-enricher.js';

/**
 * Node with syllst properties
 */
interface SyllstNode {
  type: string;
  id?: string;
  lang?: string;
  transcription?: unknown;
  word?: string;
  text?: string;
  data?: { lang?: string };
}

/**
 * Parent node interface
 */
interface ParentNode {
  type: string;
  lang?: string;
}

/**
 * Default options for the plugin
 */
const DEFAULT_OPTIONS: Required<
  Pick<RemarkSyllstGlostOptions, 'targets' | 'skipExisting'>
> = {
  targets: ['all'],
  skipExisting: true,
};

/**
 * Check if a node type is a target for enrichment
 */
function isTarget(nodeType: string, targets: EnrichTarget[]): boolean {
  if (targets.includes('all')) {
    return ['vocabularyItem', 'dialogueTurn', 'example'].includes(nodeType);
  }
  return targets.includes(nodeType as EnrichTarget);
}

/**
 * Detect language for a node by checking node properties and walking up the tree
 */
function detectLanguage(
  node: SyllstNode,
  parent: ParentNode | null,
  defaultLang?: string
): string {
  // Check node's own lang attribute
  if (node.lang) return node.lang;

  // Check data.lang
  if (node.data?.lang) return node.data.lang;

  // Check parent's lang (for dialogue -> dialogueTurn relationship)
  if (parent?.type === 'dialogue' && parent.lang) {
    return parent.lang;
  }

  // Default fallback
  return defaultLang ?? 'en';
}

/**
 * Remark plugin that enriches syllst nodes with GLOST word-level annotations
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
 *     defaultLang: 'th',
 *     targets: ['vocabularyItem', 'dialogueTurn']
 *   });
 * ```
 */
export const remarkSyllstGlost: Plugin<[RemarkSyllstGlostOptions?], MdastRoot> =
  function (
    options: RemarkSyllstGlostOptions = { languages: [] }
  ): Transformer<MdastRoot> {
    const registry = createProviderRegistry(options.languages);
    const targets = options.targets ?? DEFAULT_OPTIONS.targets;
    const skipExisting = options.skipExisting ?? DEFAULT_OPTIONS.skipExisting;

    return async (tree: MdastRoot, file: VFile) => {
      const startTime = Date.now();
      const results: EnrichmentResult[] = [];

      // Collect nodes to enrich
      const nodesToEnrich: Array<{
        node: SyllstNode;
        parent: ParentNode | null;
      }> = [];

      visit(tree, (node, _index, parent) => {
        const syllstNode = node as unknown as SyllstNode;

        // Check if node type is a target
        if (!isTarget(syllstNode.type, targets)) {
          return;
        }

        // Skip if already has transcription and skipExisting is true
        if (skipExisting && syllstNode.transcription) {
          return;
        }

        nodesToEnrich.push({
          node: syllstNode,
          parent: parent as ParentNode | null,
        });
      });

      // Process nodes
      for (const { node, parent } of nodesToEnrich) {
        try {
          // Determine language for this node
          const lang = detectLanguage(node, parent, options.defaultLang);
          const provider = registry.get(lang);

          if (!provider) {
            results.push({
              nodeId: node.id ?? 'unknown',
              nodeType: node.type,
              success: false,
              error: `No provider for language: ${lang}`,
            });
            continue;
          }

          let schemesApplied: string[] = [];

          // Enrich based on node type
          if (node.type === 'vocabularyItem') {
            schemesApplied = await enrichVocabularyItem(
              node as any,
              provider,
              options
            );
          } else if (node.type === 'dialogueTurn') {
            schemesApplied = await enrichDialogueTurn(
              node as any,
              provider,
              options
            );
          } else if (node.type === 'example') {
            schemesApplied = await enrichExample(node as any, provider, options);
          }

          results.push({
            nodeId: node.id ?? 'unknown',
            nodeType: node.type,
            success: schemesApplied.length > 0,
            schemesApplied:
              schemesApplied.length > 0 ? schemesApplied : undefined,
          });
        } catch (error) {
          results.push({
            nodeId: node.id ?? 'unknown',
            nodeType: node.type,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Attach metadata to file
      const meta: SyllstGlostMeta = {
        nodesEnriched: results.filter((r) => r.success).length,
        results,
        processingTime: Date.now() - startTime,
      };

      (file.data as Record<string, unknown>).syllstGlost = meta;
    };
  };
