/**
 * Configuration Loader for syllst Ecosystem
 *
 * Loads and validates syllst.config.json configuration file.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import {
  SyllstConfigFileSchema,
  DEFAULT_CONFIG,
  type SyllstConfigFile,
} from './schema';

/**
 * Options for loading configuration
 */
export interface LoadConfigOptions {
  /** Working directory to search for config file */
  cwd?: string;
  /** Custom config file path (overrides default search) */
  configPath?: string;
  /** Whether to merge with defaults */
  mergeWithDefaults?: boolean;
}

/**
 * Default config file name
 */
export const CONFIG_FILE_NAME = 'syllst.config.json';

/**
 * Load configuration from file system
 */
export function loadConfig(
  options: LoadConfigOptions = {}
): SyllstConfigFile {
  const {
    cwd = process.cwd(),
    configPath,
    mergeWithDefaults = true,
  } = options;

  // Determine config file path
  const filePath = configPath
    ? resolve(cwd, configPath)
    : join(cwd, CONFIG_FILE_NAME);

  // Check if file exists
  if (!existsSync(filePath)) {
    if (mergeWithDefaults) {
      return DEFAULT_CONFIG;
    }
    throw new Error(`Configuration file not found: ${filePath}`);
  }

  // Read and parse JSON
  let rawConfig: unknown;
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    rawConfig = JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${filePath}\n${error.message}`);
    }
    throw error;
  }

  // Validate and parse with Zod
  const parseResult = SyllstConfigFileSchema.safeParse(rawConfig);
  if (!parseResult.success) {
    const errors = parseResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid configuration file: ${filePath}\n${errors}`);
  }

  const config = parseResult.data;

  // Merge with defaults if requested
  if (mergeWithDefaults) {
    return {
      syllst: { ...(DEFAULT_CONFIG.syllst || {}), ...(config.syllst || {}) },
      ai: { 
        ...(DEFAULT_CONFIG.ai || {}), 
        ...(config.ai || {}),
        provider: config.ai?.provider ?? (DEFAULT_CONFIG.ai?.provider || 'openai'),
        cache: { 
          enabled: config.ai?.cache?.enabled ?? (DEFAULT_CONFIG.ai?.cache?.enabled ?? true),
          location: config.ai?.cache?.location ?? (DEFAULT_CONFIG.ai?.cache?.location ?? 'local'),
          ttl: config.ai?.cache?.ttl ?? DEFAULT_CONFIG.ai?.cache?.ttl,
        },
      },
      externalFormats: { ...(DEFAULT_CONFIG.externalFormats || {}), ...(config.externalFormats || {}) },
    };
  }

  return config;
}

/**
 * Find configuration file in directory tree
 *
 * Searches upward from the given directory until a config file is found.
 */
export function findConfigFile(startDir: string = process.cwd()): string | null {
  let currentDir = resolve(startDir);
  const root = resolve('/');

  while (currentDir !== root) {
    const configPath = join(currentDir, CONFIG_FILE_NAME);
    if (existsSync(configPath)) {
      return configPath;
    }
    currentDir = resolve(currentDir, '..');
  }

  return null;
}

/**
 * Load configuration with automatic file discovery
 */
export function loadConfigAuto(
  options: Omit<LoadConfigOptions, 'configPath'> = {}
): SyllstConfigFile {
  const configPath = findConfigFile(options.cwd);
  if (!configPath) {
    if (options.mergeWithDefaults !== false) {
      return DEFAULT_CONFIG;
    }
    throw new Error(`Configuration file not found. Searched from: ${options.cwd || process.cwd()}`);
  }

  return loadConfig({
    ...options,
    configPath,
  });
}
