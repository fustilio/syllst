/**
 * Plugin Protocol Integration Tests
 *
 * Verifies the protocol can be imported and used through the public API.
 */

import { describe, it, expect } from "vitest";
import type { Root as MdastRoot } from "mdast";
import type { VFile } from "vfile";

// Import from the public package API (through subpath export)
import {
  type SyllstPlugin,
  type SyllstPluginOptions,
  type SyllstPluginMeta,
  type SyllstPluginResult,
  type PluginPhase,
  isSyllstPluginMeta,
  isSyllstPluginOptions,
} from "../plugins/index.js";

describe("Plugin Protocol Integration", () => {
  it("should export protocol types from @syllst/processor/plugins", () => {
    // Verify type guards are available
    expect(typeof isSyllstPluginMeta).toBe("function");
    expect(typeof isSyllstPluginOptions).toBe("function");
  });

  it("should support creating a conforming plugin using exported types", () => {
    interface MyPluginOptions extends SyllstPluginOptions {
      targetNodes: string[];
      threshold?: number;
    }

    const myPluginMeta: SyllstPluginMeta = {
      name: "integration-test-plugin",
      version: "1.0.0",
      phase: "enrich",
      provides: ["test:integration"],
      description: "Integration test plugin",
    };

    const myPlugin: SyllstPlugin<MyPluginOptions> = function (options) {
      const targetNodes = options?.targetNodes ?? [];
      const threshold = options?.threshold ?? 10;

      return (tree: MdastRoot, file: VFile) => {
        // Simulate enrichment
        const result: SyllstPluginResult = {
          pluginName: myPluginMeta.name,
          pluginVersion: myPluginMeta.version,
          success: true,
          nodesProcessed: targetNodes.length,
          data: {
            threshold,
            targetNodes,
          },
        };

        (file.data as Record<string, unknown>)[myPluginMeta.name] = result;
      };
    };

    // Verify plugin creation
    expect(typeof myPlugin).toBe("function");
    expect(isSyllstPluginMeta(myPluginMeta)).toBe(true);

    // Verify plugin execution
    const transformer = myPlugin({ targetNodes: ["vocabularyItem", "example"] });
    const mockTree: MdastRoot = { type: "root", children: [] };
    const mockFile = { data: {} } as VFile;

    transformer(mockTree, mockFile);

    const result = (mockFile.data as any)[myPluginMeta.name] as SyllstPluginResult;
    expect(result.success).toBe(true);
    expect(result.nodesProcessed).toBe(2);
  });

  it("should validate plugin lifecycle phases", () => {
    const validPhases: PluginPhase[] = ["parse", "transform", "validate", "enrich"];

    for (const phase of validPhases) {
      const meta: SyllstPluginMeta = {
        name: `test-${phase}`,
        version: "1.0.0",
        phase,
      };

      expect(isSyllstPluginMeta(meta)).toBe(true);
    }
  });

  it("should support plugin capability declarations", () => {
    const enricherMeta: SyllstPluginMeta = {
      name: "transcription-enricher",
      version: "2.0.0",
      phase: "enrich",
      provides: ["transcription:th", "transcription:ja", "transcription:ko"],
      requires: ["syllst-core:parsed"],
    };

    expect(isSyllstPluginMeta(enricherMeta)).toBe(true);
    expect(enricherMeta.provides).toHaveLength(3);
    expect(enricherMeta.requires).toContain("syllst-core:parsed");
  });

  it("should support plugin conflict declarations", () => {
    const newPluginMeta: SyllstPluginMeta = {
      name: "new-validator",
      version: "3.0.0",
      phase: "validate",
      conflicts: ["old-validator", "legacy-validator-v2"],
      description: "New validation plugin that replaces legacy validators",
    };

    expect(isSyllstPluginMeta(newPluginMeta)).toBe(true);
    expect(newPluginMeta.conflicts).toHaveLength(2);
  });
});
