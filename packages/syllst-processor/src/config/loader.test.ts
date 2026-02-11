/**
 * Configuration Loader Tests
 *
 * Tests for loading and validating syllst.config.json files.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig, findConfigFile, loadConfigAuto, CONFIG_FILE_NAME } from './loader';
import { DEFAULT_CONFIG } from './schema';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

// Mock path.resolve to return predictable paths
vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path');
  return {
    ...actual,
    resolve: vi.fn((...args: string[]) => {
      // Simple path resolution for tests
      if (args.length === 1) return args[0];
      return args.filter(Boolean).join('/').replace(/\/+/g, '/');
    }),
    join: vi.fn((...args: string[]) => args.filter(Boolean).join('/')),
  };
});

const mockFs = fs as unknown as {
  readFileSync: ReturnType<typeof vi.fn>;
  existsSync: ReturnType<typeof vi.fn>;
};

const mockPath = path as unknown as {
  resolve: ReturnType<typeof vi.fn>;
  join: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// loadConfig
// ============================================================================

describe('loadConfig', () => {
  describe('when config file does not exist', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
    });

    it('should return DEFAULT_CONFIG when mergeWithDefaults is true', () => {
      const result = loadConfig({ mergeWithDefaults: true });

      expect(result).toEqual(DEFAULT_CONFIG);
    });

    it('should return DEFAULT_CONFIG by default (mergeWithDefaults defaults to true)', () => {
      const result = loadConfig();

      expect(result).toEqual(DEFAULT_CONFIG);
    });

    it('should throw error when mergeWithDefaults is false', () => {
      expect(() => loadConfig({ mergeWithDefaults: false })).toThrow(
        /Configuration file not found/
      );
    });

    it('should include file path in error message', () => {
      mockPath.join.mockReturnValue('/test/dir/syllst.config.json');
      mockPath.resolve.mockReturnValue('/test/dir/syllst.config.json');

      expect(() => loadConfig({ cwd: '/test/dir', mergeWithDefaults: false })).toThrow(
        /syllst\.config\.json/
      );
    });
  });

  describe('when config file exists with valid JSON', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
    });

    it('should parse valid minimal config', () => {
      const validConfig = { syllst: { defaultLanguage: 'th' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));

      const result = loadConfig();

      expect(result.syllst?.defaultLanguage).toBe('th');
    });

    it('should merge with defaults when mergeWithDefaults is true', () => {
      const partialConfig = { syllst: { defaultLanguage: 'th' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(partialConfig));

      const result = loadConfig({ mergeWithDefaults: true });

      // Should have merged AI config from defaults
      expect(result.ai?.provider).toBe('openai');
      expect(result.ai?.cache?.enabled).toBe(true);
      expect(result.syllst?.defaultLanguage).toBe('th');
    });

    it('should not merge with defaults when mergeWithDefaults is false', () => {
      const partialConfig = { syllst: { defaultLanguage: 'th' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(partialConfig));

      const result = loadConfig({ mergeWithDefaults: false });

      expect(result.syllst?.defaultLanguage).toBe('th');
      // AI config should not be filled from defaults
      expect(result.ai).toBeUndefined();
    });

    it('should handle full config with all sections', () => {
      const fullConfig = {
        syllst: { defaultLanguage: 'th', version: '0.2.0' },
        ai: {
          provider: 'anthropic',
          model: 'claude-3',
          cache: { enabled: false, location: 'online', ttl: 3600 },
        },
        externalFormats: {
          xapi: { enabled: true, endpoint: 'https://lrs.example.com' },
        },
      };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(fullConfig));

      const result = loadConfig();

      expect(result.syllst?.defaultLanguage).toBe('th');
      expect(result.ai?.provider).toBe('anthropic');
      expect(result.ai?.model).toBe('claude-3');
      expect(result.ai?.cache?.enabled).toBe(false);
      expect(result.ai?.cache?.ttl).toBe(3600);
      expect(result.externalFormats?.xapi?.enabled).toBe(true);
    });

    it('should use custom config path when provided', () => {
      const config = { syllst: { defaultLanguage: 'ja' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockPath.resolve.mockReturnValue('/custom/path/my-config.json');

      const result = loadConfig({ configPath: 'my-config.json' });

      expect(result.syllst?.defaultLanguage).toBe('ja');
    });
  });

  describe('when config file has invalid JSON', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
    });

    it('should throw error with helpful message for invalid JSON', () => {
      mockFs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => loadConfig()).toThrow(/Invalid JSON in configuration file/);
    });

    it('should include original SyntaxError message', () => {
      mockFs.readFileSync.mockReturnValue('{ "unclosed": ');

      expect(() => loadConfig()).toThrow(/JSON/);
    });
  });

  describe('when config file fails Zod validation', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
    });

    it('should throw error for invalid AI provider', () => {
      const invalidConfig = { ai: { provider: 'invalid-provider' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => loadConfig()).toThrow(/Invalid configuration file/);
    });

    it('should throw error for invalid cache location', () => {
      const invalidConfig = { ai: { cache: { location: 'cloud' } } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => loadConfig()).toThrow(/Invalid configuration file/);
    });

    it('should include field path in error message', () => {
      const invalidConfig = { ai: { provider: 'invalid' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => loadConfig()).toThrow(/ai\.provider/);
    });

    it('should throw error for invalid xapi endpoint URL', () => {
      const invalidConfig = {
        externalFormats: { xapi: { enabled: true, endpoint: 'not-a-url' } },
      };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => loadConfig()).toThrow(/Invalid configuration file/);
    });
  });

  describe('default merging edge cases', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
    });

    it('should preserve user AI provider over default', () => {
      const config = { ai: { provider: 'anthropic' } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig({ mergeWithDefaults: true });

      expect(result.ai?.provider).toBe('anthropic');
    });

    it('should merge cache settings with defaults', () => {
      const config = { ai: { cache: { ttl: 7200 } } };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig({ mergeWithDefaults: true });

      // Should have ttl from config
      expect(result.ai?.cache?.ttl).toBe(7200);
      // Should have enabled from default
      expect(result.ai?.cache?.enabled).toBe(true);
    });

    it('should handle empty config object', () => {
      mockFs.readFileSync.mockReturnValue('{}');

      const result = loadConfig({ mergeWithDefaults: true });

      expect(result).toEqual(DEFAULT_CONFIG);
    });
  });
});

// ============================================================================
// findConfigFile
// ============================================================================

describe('findConfigFile', () => {
  beforeEach(() => {
    // Reset mock implementations
    mockPath.resolve.mockImplementation((...args: string[]) => {
      if (args.length === 1) return args[0];
      // Handle parent directory resolution
      if (args[1] === '..') {
        const parts = args[0].split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      return args.filter(Boolean).join('/').replace(/\/+/g, '/');
    });
    mockPath.join.mockImplementation((...args: string[]) => args.filter(Boolean).join('/'));
  });

  it('should return config path when found in current directory', () => {
    mockFs.existsSync.mockReturnValue(true);

    const result = findConfigFile('/project');

    expect(result).toContain(CONFIG_FILE_NAME);
  });

  it('should search parent directories until config is found', () => {
    // Config only exists in grandparent
    mockFs.existsSync.mockImplementation((path: string) => {
      return path === '/project/syllst.config.json';
    });
    mockPath.resolve.mockImplementation((...args: string[]) => {
      if (args.length === 1) return args[0];
      if (args[1] === '..') {
        const parts = args[0].split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      return args.filter(Boolean).join('/');
    });

    const result = findConfigFile('/project/packages/core');

    // Should have checked multiple directories
    expect(mockFs.existsSync).toHaveBeenCalled();
    // Eventually finds the config
    expect(result).not.toBeNull();
  });

  it('should return null when config not found up to root', () => {
    mockFs.existsSync.mockReturnValue(false);
    mockPath.resolve.mockImplementation((...args: string[]) => {
      if (args[0] === '/') return '/';
      if (args.length === 1) return args[0];
      if (args[1] === '..') {
        const parts = args[0].split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      return args.filter(Boolean).join('/');
    });

    const result = findConfigFile('/project/deep/nested/dir');

    expect(result).toBeNull();
  });

  it('should stop at filesystem root', () => {
    mockFs.existsSync.mockReturnValue(false);
    let resolveCount = 0;
    mockPath.resolve.mockImplementation((...args: string[]) => {
      resolveCount++;
      if (resolveCount > 20) throw new Error('Infinite loop detected');
      if (args[0] === '/' || args[0] === '') return '/';
      if (args.length === 1) return args[0];
      if (args[1] === '..') {
        const parts = args[0].split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      return args.filter(Boolean).join('/');
    });

    const result = findConfigFile('/a/b/c/d');

    expect(result).toBeNull();
    expect(resolveCount).toBeLessThan(20); // Should not loop infinitely
  });
});

// ============================================================================
// loadConfigAuto
// ============================================================================

describe('loadConfigAuto', () => {
  beforeEach(() => {
    mockPath.resolve.mockImplementation((...args: string[]) => {
      if (args.length === 1) return args[0];
      if (args[1] === '..') {
        const parts = args[0].split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      return args.filter(Boolean).join('/');
    });
    mockPath.join.mockImplementation((...args: string[]) => args.filter(Boolean).join('/'));
  });

  it('should return DEFAULT_CONFIG when no config file found', () => {
    mockFs.existsSync.mockReturnValue(false);

    const result = loadConfigAuto();

    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('should throw when no config found and mergeWithDefaults is false', () => {
    mockFs.existsSync.mockReturnValue(false);

    expect(() => loadConfigAuto({ mergeWithDefaults: false })).toThrow(
      /Configuration file not found/
    );
  });

  it('should load config when found via auto-discovery', () => {
    const config = { syllst: { defaultLanguage: 'ko' } };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

    const result = loadConfigAuto();

    expect(result.syllst?.defaultLanguage).toBe('ko');
  });

  it('should pass cwd option to findConfigFile', () => {
    const config = { syllst: { defaultLanguage: 'zh' } };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

    const result = loadConfigAuto({ cwd: '/custom/start/dir' });

    expect(result.syllst?.defaultLanguage).toBe('zh');
  });

  it('should include start directory in error message when not found', () => {
    mockFs.existsSync.mockReturnValue(false);

    expect(() => loadConfigAuto({ cwd: '/my/project', mergeWithDefaults: false })).toThrow(
      /\/my\/project/
    );
  });
});

// ============================================================================
// CONFIG_FILE_NAME constant
// ============================================================================

describe('CONFIG_FILE_NAME', () => {
  it('should be syllst.config.json', () => {
    expect(CONFIG_FILE_NAME).toBe('syllst.config.json');
  });
});

// ============================================================================
// Integration scenarios
// ============================================================================

describe('Integration scenarios', () => {
  beforeEach(() => {
    mockPath.resolve.mockImplementation((...args: string[]) => {
      if (args.length === 1) return args[0];
      return args.filter(Boolean).join('/').replace(/\/+/g, '/');
    });
    mockPath.join.mockImplementation((...args: string[]) => args.filter(Boolean).join('/'));
  });

  it('should handle typical project config with Thai language settings', () => {
    const thaiConfig = {
      syllst: {
        defaultLanguage: 'th',
        version: '0.2.0',
      },
      ai: {
        provider: 'anthropic',
        cache: {
          enabled: true,
          location: 'local',
        },
      },
      externalFormats: {
        xapi: {
          enabled: true,
          endpoint: 'https://lrs.example.com/xapi',
        },
        cmi5: {
          enabled: true,
          courseId: 'thai-basics-101',
        },
      },
    };

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(thaiConfig));

    const result = loadConfig();

    expect(result.syllst?.defaultLanguage).toBe('th');
    expect(result.ai?.provider).toBe('anthropic');
    expect(result.externalFormats?.xapi?.enabled).toBe(true);
    expect(result.externalFormats?.cmi5?.courseId).toBe('thai-basics-101');
  });

  it('should work with minimal config file', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{"syllst":{}}');

    const result = loadConfig();

    // Should get defaults for AI
    expect(result.ai?.provider).toBe('openai');
    expect(result.ai?.cache?.enabled).toBe(true);
  });
});
