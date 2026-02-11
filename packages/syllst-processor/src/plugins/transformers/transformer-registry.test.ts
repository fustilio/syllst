import { describe, it, expect } from "vitest";
import { DirectiveTransformerRegistry } from "./transformer-registry.js";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import { builtInTransformers } from "./index.js";

// Test helpers
function createTransformer(
  name: string,
  directives: string[]
): DirectiveTransformer {
  return {
    name,
    directives,
    canHandle: (n: string) => directives.includes(n),
    transform: (d: DirectiveNode) => ({
      type: `${name}Node`,
      id: d.attributes?.id,
    }),
  };
}

function createDirective(
  name: string,
  attrs: Record<string, string> = {}
): DirectiveNode {
  return {
    type: "containerDirective",
    name,
    attributes: attrs,
  };
}

describe("DirectiveTransformerRegistry", () => {
  describe("register", () => {
    it("should register a transformer", () => {
      const registry = new DirectiveTransformerRegistry();
      const t = createTransformer("test", ["test-dir"]);

      registry.register(t);

      expect(registry.getRegisteredNames()).toEqual([
        "test",
      ]);
    });

    it("should support chaining", () => {
      const registry = new DirectiveTransformerRegistry();
      const t1 = createTransformer("a", ["a-dir"]);
      const t2 = createTransformer("b", ["b-dir"]);

      const result = registry.register(t1).register(t2);

      expect(result).toBe(registry);
      expect(registry.getRegisteredNames()).toEqual([
        "a",
        "b",
      ]);
    });
  });

  describe("registerAll", () => {
    it("should register multiple transformers", () => {
      const registry = new DirectiveTransformerRegistry();
      const transformers = [
        createTransformer("a", ["a-dir"]),
        createTransformer("b", ["b-dir"]),
      ];

      registry.registerAll(transformers);

      expect(registry.getRegisteredNames()).toEqual([
        "a",
        "b",
      ]);
    });

    it("should support chaining", () => {
      const registry = new DirectiveTransformerRegistry();

      const result = registry.registerAll([
        createTransformer("a", ["a-dir"]),
      ]);

      expect(result).toBe(registry);
    });
  });

  describe("getTransformer", () => {
    it("should find a transformer by directive name", () => {
      const registry = new DirectiveTransformerRegistry();
      const t = createTransformer("vocab", [
        "vocabulary-set",
        "vocab",
      ]);
      registry.register(t);

      expect(registry.getTransformer("vocab")).toBe(t);
      expect(
        registry.getTransformer("vocabulary-set")
      ).toBe(t);
    });

    it("should return undefined for unknown directives", () => {
      const registry = new DirectiveTransformerRegistry();

      expect(
        registry.getTransformer("unknown")
      ).toBeUndefined();
    });

    it("should give priority to later registrations (last wins)", () => {
      const registry = new DirectiveTransformerRegistry();
      const original = createTransformer("original", [
        "my-dir",
      ]);
      const override = createTransformer("override", [
        "my-dir",
      ]);

      registry.register(original);
      registry.register(override);

      expect(registry.getTransformer("my-dir")).toBe(
        override
      );
    });
  });

  describe("transform", () => {
    it("should transform a directive using the matching transformer", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.register(
        createTransformer("test", ["test-dir"])
      );

      const result = registry.transform(
        createDirective("test-dir", { id: "abc" })
      );

      expect(result).toEqual({
        type: "testNode",
        id: "abc",
      });
    });

    it("should return null for unhandled directives", () => {
      const registry = new DirectiveTransformerRegistry();

      const result = registry.transform(
        createDirective("unknown")
      );

      expect(result).toBeNull();
    });

    it("should pass context to transformer", () => {
      const registry = new DirectiveTransformerRegistry();
      let receivedContext: any = null;

      registry.register({
        name: "ctx-test",
        directives: ["ctx-dir"],
        canHandle: (n) => n === "ctx-dir",
        transform: (_d, ctx) => {
          receivedContext = ctx;
          return { type: "ctxNode" };
        },
      });

      const ctx = { index: 3, parent: { children: [] } };
      registry.transform(createDirective("ctx-dir"), ctx);

      expect(receivedContext).toEqual(ctx);
    });

    it("should allow overriding built-in transformers", () => {
      const registry = new DirectiveTransformerRegistry();

      // Register built-ins
      registry.register(
        createTransformer("builtin-grammar", [
          "grammar-rule",
        ])
      );

      // Override with custom
      const customGrammar: DirectiveTransformer = {
        name: "custom-grammar",
        directives: ["grammar-rule"],
        canHandle: (n) => n === "grammar-rule",
        transform: () => ({
          type: "customGrammarRule",
          custom: true,
        }),
      };
      registry.register(customGrammar);

      const result = registry.transform(
        createDirective("grammar-rule", {
          id: "r1",
          title: "Test",
        })
      );

      expect(result).toEqual({
        type: "customGrammarRule",
        custom: true,
      });
    });
  });

  describe("getHandledDirectives", () => {
    it("should list all handled directive names", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.register(
        createTransformer("a", ["dir-1", "dir-2"])
      );
      registry.register(
        createTransformer("b", ["dir-3"])
      );

      const handled = registry.getHandledDirectives();

      expect(handled).toContain("dir-1");
      expect(handled).toContain("dir-2");
      expect(handled).toContain("dir-3");
      expect(handled).toHaveLength(3);
    });

    it("should deduplicate directives", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.register(
        createTransformer("a", ["shared-dir"])
      );
      registry.register(
        createTransformer("b", ["shared-dir"])
      );

      expect(
        registry.getHandledDirectives()
      ).toHaveLength(1);
    });
  });

  describe("hasTransformer", () => {
    it("should return true for handled directives", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.register(
        createTransformer("t", ["my-dir"])
      );

      expect(registry.hasTransformer("my-dir")).toBe(true);
      expect(registry.hasTransformer("other")).toBe(false);
    });
  });

  describe("built-in transformers", () => {
    it("should have 9 built-in transformers", () => {
      expect(builtInTransformers).toHaveLength(9);
    });

    it("should handle all standard directive types", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.registerAll(builtInTransformers);

      const standardDirectives = [
        "grammar-rule",
        "vocabulary-set",
        "vocab",
        "character-set",
        "character",
        "example-set",
        "example",
        "exercise",
        "dialogue",
        "turn",
        "cultural-note",
        "phonological-rule",
        "rule-condition",
        "syllable-pattern",
        "pattern-example",
        "writing-pattern",
      ];

      for (const dir of standardDirectives) {
        expect(registry.hasTransformer(dir)).toBe(true);
      }
    });

    it("should transform vocabulary-set directive", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.registerAll(builtInTransformers);

      const directive: DirectiveNode = {
        type: "containerDirective",
        name: "vocabulary-set",
        attributes: {
          id: "greetings",
          title: "Basic Greetings",
        },
        children: [
          {
            type: "leafDirective",
            name: "vocab",
            attributes: {
              id: "hello",
              word: "สวัสดี",
              translation: "hello",
              transcription: "sawatdee",
            },
          },
        ],
      };

      const result = registry.transform(directive);

      expect(result).toBeTruthy();
      expect(result!.type).toBe("vocabularySet");
      expect(result!.id).toBe("greetings");
      expect(result!.title).toBe("Basic Greetings");
      const children = result!.children as any[];
      expect(children).toHaveLength(1);
      expect(children[0].type).toBe("vocabularyItem");
      expect(children[0].word).toBe("สวัสดี");
    });

    it("should transform exercise directive", () => {
      const registry = new DirectiveTransformerRegistry();
      registry.registerAll(builtInTransformers);

      const directive: DirectiveNode = {
        type: "containerDirective",
        name: "exercise",
        attributes: {
          id: "quiz-1",
          type: "matching",
          title: "Match Words",
          skill: "word-recognition",
        },
        children: [],
      };

      const result = registry.transform(directive);

      expect(result).toBeTruthy();
      expect(result!.type).toBe("exercise");
      expect(result!.exerciseType).toBe("matching");
      expect(result!.skill).toBe("word-recognition");
    });
  });
});
