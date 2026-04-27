/**
 * Ollama embedding provider with batch support and disk cache.
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { EmbeddingProvider } from './types.js';

interface CacheEntry {
  embedding: number[];
  model: string;
}

export class OllamaEmbedder implements EmbeddingProvider {
  batchSize = 64;
  private baseUrl: string;
  private model: string;
  private cachePath?: string;
  private cache = new Map<string, number[]>();

  constructor(options: { baseUrl?: string; model: string; cachePath?: string }) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:11434';
    this.model = options.model;
    this.cachePath = options.cachePath;
  }

  async embed(texts: string[]): Promise<number[][]> {
    await this.loadCache();
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchResults = await this.embedBatch(batch);
      results.push(...batchResults);
    }

    await this.saveCache();
    return results;
  }

  private async embedBatch(texts: string[]): Promise<number[][]> {
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const toFetch: { index: number; text: string; hash: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text) continue;
      const hash = this.hash(text);
      if (this.cache.has(hash)) {
        results[i] = this.cache.get(hash)!;
      } else {
        toFetch.push({ index: i, text, hash });
      }
    }

    if (toFetch.length > 0) {
      const res = await fetch(`${this.baseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, input: toFetch.map((f) => f.text) }),
      });
      if (!res.ok) {
        throw new Error(`Ollama embed failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      for (let i = 0; i < toFetch.length; i++) {
        const item = toFetch[i];
        if (!item) continue;
        results[item.index] = data.embeddings[i];
        this.cache.set(item.hash, data.embeddings[i]);
      }
    }

    return results as number[][];
  }

  private hash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  private async loadCache(): Promise<void> {
    if (!this.cachePath) return;
    try {
      const raw = await readFile(this.cachePath, 'utf-8');
      const entries: Record<string, CacheEntry> = JSON.parse(raw);
      for (const [key, entry] of Object.entries(entries)) {
        if (entry.model === this.model) {
          this.cache.set(key, entry.embedding);
        }
      }
    } catch {
      // cache missing or corrupt — start fresh
    }
  }

  private async saveCache(): Promise<void> {
    if (!this.cachePath) return;
    const entries: Record<string, CacheEntry> = {};
    for (const [key, embedding] of this.cache) {
      entries[key] = { embedding, model: this.model };
    }
    await mkdir(dirname(this.cachePath), { recursive: true });
    await writeFile(this.cachePath, JSON.stringify(entries), 'utf-8');
  }
}
