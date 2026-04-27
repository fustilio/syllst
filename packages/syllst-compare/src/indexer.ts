/**
 * SyllabiIndex — one-pass AST indexer for efficient comparison.
 *
 * Traverses the AST once, building typed indices so repeated
 * comparisons don't re-walk the tree.
 */

import type { SyllabusRoot } from '@syllst/core';
import type { ComparableItem } from './types.js';

export interface IndexedNode extends ComparableItem {
  type: string;
  raw: any;
}

export class SyllabiIndex {
  private byType = new Map<string, IndexedNode[]>();
  private byId = new Map<string, IndexedNode>();

  constructor(root: SyllabusRoot) {
    this.index(root);
  }

  private index(root: any) {
    const visit = (node: any) => {
      if (node && typeof node === 'object' && node.type && node.id) {
        const indexed: IndexedNode = {
          id: node.id,
          type: node.type,
          text: this.extractText(node),
          translation: node.translation || node.explanation || node.definition,
          raw: node,
        };

        if (!this.byType.has(node.type)) {
          this.byType.set(node.type, []);
        }
        this.byType.get(node.type)!.push(indexed);
        this.byId.set(node.id, indexed);
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    };
    visit(root);
  }

  private extractText(node: any): string {
    switch (node.type) {
      case 'vocabularyItem': return node.word || '';
      case 'grammarRule': return node.title || '';
      case 'example': return node.text || '';
      case 'characterItem': return node.char || '';
      case 'content': return node.value || '';
      default: return node.title || node.text || node.value || '';
    }
  }

  get(type: string): IndexedNode[] {
    return this.byType.get(type) || [];
  }

  getById(id: string): IndexedNode | undefined {
    return this.byId.get(id);
  }

  vocab(): IndexedNode[] { return this.get('vocabularyItem'); }
  grammar(): IndexedNode[] { return this.get('grammarRule'); }
  examples(): IndexedNode[] { return this.get('example'); }
  characters(): IndexedNode[] { return this.get('characterItem'); }
  lessons(): IndexedNode[] { return this.get('lesson'); }
  chapters(): IndexedNode[] { return this.get('chapter'); }

  types(): string[] {
    return [...this.byType.keys()];
  }

  stats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, nodes] of this.byType) {
      stats[type] = nodes.length;
    }
    return stats;
  }
}
