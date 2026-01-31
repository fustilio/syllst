/**
 * Plugin Protocol Tests
 *
 * Verifies the syllst plugin protocol interface works as expected.
 */

import { describe, it, expect } from "vitest";
import type { Root as MdastRoot } from "mdast";
import type { VFile } from "vfile";
import {
  type SyllstPlugin,
  type SyllstPluginOptions,
  type SyllstPluginMeta,
  type SyllstPluginResult,
  type PluginPhase,
  isSyllstPluginMeta,
  isSyllstPluginOptions,
} from "./plugin-protocol.js";

describe("Plugin Protocol", () => {
  describe("Type Exports", () => {
    it("should export PluginPhase type", () => {
      const phases: PluginPhase[] = ["parse", "transform", "validate", "enrich"];
      expect(phases).toHaveLength(4);
    });

    it("should export SyllstPluginMeta interface", () => {
      const meta: SyllstPluginMeta = {
        name: "test-plugin",
        version: "1.0.0",
        phase: "enrich",
        provides: ["test:capability"],
        requires: ["core:validated"],
        conflicts: ["old-test-plugin"],
        description: "Test plugin for protocol validation",
      };

      expect(meta.name).toBe("test-plugin");
      expect(meta.phase).toBe("enrich");
    });

    it("should export SyllstPluginOptions interface", () => {
      const options: SyllstPluginOptions = {
        enabled: true,
        _meta: {
          name: "test",
          version: "1.0.0",
          phase: "transform",
        },
      };

      expect(options.enabled).toBe(true);
      expect(options._meta?.name).toBe("test");
    });
  });

  describe("Type Guards", () => {
    describe("isSyllstPluginMeta", () => {
      it("should return true for valid plugin metadata", () => {
        const meta: SyllstPluginMeta = {
          name: "valid-plugin",
          version: "1.0.0",
          phase: "enrich",
        };

        expect(isSyllstPluginMeta(meta)).toBe(true);
      });

      it("should return true for metadata with all optional fields", () => {
        const meta: SyllstPluginMeta = {
          name: "complete-plugin",
          version: "2.0.0",
          phase: "transform",
          provides: ["test:a", "test:b"],
          requires: ["core:validated"],
          conflicts: ["old-plugin"],
          description: "A complete plugin",
        };

        expect(isSyllstPluginMeta(meta)).toBe(true);
      });

      it("should return false for invalid phase", () => {
        const meta = {
          name: "invalid-plugin",
          version: "1.0.0",
          phase: "invalid-phase",
        };

        expect(isSyllstPluginMeta(meta)).toBe(false);
      });

      it("should return false for missing required fields", () => {
        expect(isSyllstPluginMeta({ name: "test" })).toBe(false);
        expect(isSyllstPluginMeta({ version: "1.0.0" })).toBe(false);
        expect(isSyllstPluginMeta(null)).toBe(false);
        expect(isSyllstPluginMeta(undefined)).toBe(false);
      });

      it("should return false for non-object types", () => {
        expect(isSyllstPluginMeta("string")).toBe(false);
        expect(isSyllstPluginMeta(123)).toBe(false);
        expect(isSyllstPluginMeta(true)).toBe(false);
      });
    });

    describe("isSyllstPluginOptions", () => {
      it("should return true for valid plugin options", () => {
        const options: SyllstPluginOptions = {
          enabled: true,
        };

        expect(isSyllstPluginOptions(options)).toBe(true);
      });

      it("should return true for empty options object", () => {
        expect(isSyllstPluginOptions({})).toBe(true);
      });

      it("should return true for options with valid _meta", () => {
        const options: SyllstPluginOptions = {
          enabled: false,
          _meta: {
            name: "test",
            version: "1.0.0",
            phase: "enrich",
          },
        };

        expect(isSyllstPluginOptions(options)).toBe(true);
      });

      it("should return false for invalid enabled type", () => {
        const options = {
          enabled: "true", // Should be boolean
        };

        expect(isSyllstPluginOptions(options)).toBe(false);
      });

      it("should return false for invalid _meta", () => {
        const options = {
          enabled: true,
          _meta: {
            name: "test",
            // Missing version and phase
          },
        };

        expect(isSyllstPluginOptions(options)).toBe(false);
      });

      it("should return false for non-object types", () => {
        expect(isSyllstPluginOptions(null)).toBe(false);
        expect(isSyllstPluginOptions("options")).toBe(false);
        expect(isSyllstPluginOptions(123)).toBe(false);
      });
    });
  });

  describe("Mock Plugin Conformance", () => {
    it("should allow creating a plugin conforming to the protocol", () => {
      // Mock plugin options extending base interface
      interface MockPluginOptions extends SyllstPluginOptions {
        myConfig: string;
        threshold?: number;
      }

      // Mock plugin following the protocol
      const mockPlugin: SyllstPlugin<MockPluginOptions> = function (options) {
        const config = options?.myConfig ?? "default";
        const enabled = options?.enabled ?? true;

        return (tree: MdastRoot, file: VFile) => {
          if (!enabled) return;

          // Mock transformation
          const result: SyllstPluginResult = {
            pluginName: "mock-plugin",
            pluginVersion: "1.0.0",
            processingTime: 10,
            nodesProcessed: 5,
            success: true,
            data: {
              config,
            },
          };

          // Attach to file.data
          (file.data as Record<string, unknown>).mockPlugin = result;
        };
      };

      // Verify plugin is callable
      expect(typeof mockPlugin).toBe("function");

      // Verify plugin returns a transformer
      const transformer = mockPlugin({ myConfig: "test-value" });
      expect(typeof transformer).toBe("function");
    });

    it("should support plugin metadata declaration", () => {
      interface TestPluginOptions extends SyllstPluginOptions {
        testParam: string;
      }

      const testPluginMeta: SyllstPluginMeta = {
        name: "test-enricher",
        version: "1.2.3",
        phase: "enrich",
        provides: ["test:enrichment"],
        requires: ["syllst-core:directives"],
        description: "Test enrichment plugin",
      };

      const testPlugin: SyllstPlugin<TestPluginOptions> = function (options) {
        return (tree: MdastRoot, file: VFile) => {
          const result: SyllstPluginResult = {
            pluginName: testPluginMeta.name,
            pluginVersion: testPluginMeta.version,
            success: true,
            nodesProcessed: 0,
          };

          (file.data as Record<string, unknown>)[testPluginMeta.name] = result;
        };
      };

      // Verify metadata is valid
      expect(isSyllstPluginMeta(testPluginMeta)).toBe(true);
      expect(testPluginMeta.provides).toContain("test:enrichment");
      expect(testPluginMeta.requires).toContain("syllst-core:directives");
    });

    it("should support async plugin transformers", async () => {
      interface AsyncPluginOptions extends SyllstPluginOptions {
        delay: number;
      }

      const asyncPlugin: SyllstPlugin<AsyncPluginOptions> = function (options) {
        return async (tree: MdastRoot, file: VFile) => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, options?.delay ?? 1));

          const result: SyllstPluginResult = {
            pluginName: "async-plugin",
            pluginVersion: "1.0.0",
            success: true,
            processingTime: options?.delay ?? 1,
          };

          (file.data as Record<string, unknown>).asyncPlugin = result;
        };
      };

      const transformer = asyncPlugin({ delay: 10 });

      // Create mock tree and file
      const mockTree: MdastRoot = { type: "root", children: [] };
      const mockFile = { data: {} } as VFile;

      // Execute transformer
      await transformer(mockTree, mockFile);

      // Verify result
      const result = (mockFile.data as any).asyncPlugin as SyllstPluginResult;
      expect(result.success).toBe(true);
      expect(result.processingTime).toBe(10);
    });
  });

  describe("SyllstPluginResult", () => {
    it("should support basic result structure", () => {
      const result: SyllstPluginResult = {
        pluginName: "test-plugin",
        pluginVersion: "1.0.0",
        success: true,
        nodesProcessed: 10,
      };

      expect(result.success).toBe(true);
      expect(result.nodesProcessed).toBe(10);
    });

    it("should support warnings and errors", () => {
      const result: SyllstPluginResult = {
        pluginName: "validator-plugin",
        pluginVersion: "2.0.0",
        success: false,
        warnings: ["Missing optional field 'description'"],
        errors: ["Required field 'id' is missing"],
      };

      expect(result.warnings).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });

    it("should support custom data attachment", () => {
      const result: SyllstPluginResult = {
        pluginName: "enricher-plugin",
        pluginVersion: "1.5.0",
        success: true,
        data: {
          transcriptionsAdded: 15,
          translationsAdded: 12,
          schemesUsed: ["paiboon+", "ipa"],
        },
      };

      expect(result.data?.transcriptionsAdded).toBe(15);
      expect(result.data?.schemesUsed).toEqual(["paiboon+", "ipa"]);
    });
  });
});
