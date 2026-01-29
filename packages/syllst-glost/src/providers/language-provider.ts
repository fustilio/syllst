/**
 * Language Provider Registry
 *
 * Registry for managing language-specific transcription providers.
 */

import type { LanguageProviderConfig } from '../types.js';

/**
 * Registry for language-specific providers
 */
export class LanguageProviderRegistry {
  private providers = new Map<string, LanguageProviderConfig>();

  /**
   * Register a language provider
   */
  register(config: LanguageProviderConfig): this {
    this.providers.set(config.lang, config);
    return this;
  }

  /**
   * Get provider for a language code
   */
  get(lang: string): LanguageProviderConfig | undefined {
    // Try exact match first
    if (this.providers.has(lang)) {
      return this.providers.get(lang);
    }

    // Try base language (e.g., 'th' for 'th-TH')
    const baseLang = lang.split('-')[0];
    if (baseLang && this.providers.has(baseLang)) {
      return this.providers.get(baseLang);
    }

    return undefined;
  }

  /**
   * Check if a language is supported
   */
  has(lang: string): boolean {
    return this.get(lang) !== undefined;
  }

  /**
   * Get all registered language codes
   */
  getLanguages(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear();
  }
}

/**
 * Create a provider registry from configs
 */
export function createProviderRegistry(
  configs: LanguageProviderConfig[]
): LanguageProviderRegistry {
  const registry = new LanguageProviderRegistry();
  for (const config of configs) {
    registry.register(config);
  }
  return registry;
}
