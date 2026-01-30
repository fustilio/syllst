import { describe, it, expect } from "vitest";
import {
  EXTENSIONS,
  Bcp47Schema,
  CEFRLevelSchema,
  DifficultyLevelSchema,
  AccuracyScoreSchema,
  DifficultySchema,
  CharacterTypeSchema,
  XapiCharacterTypeSchema,
  TranscriptionSystemSchema,
  ContextExtensionsSchema,
  ResultExtensionsSchema,
  ActivityExtensionsSchema,
} from "./extensions.js";
import {
  Bcp47Schema as CoreBcp47Schema,
  CEFRLevelSchema as CoreCEFRLevelSchema,
  DifficultyLevelSchema as CoreDifficultyLevelSchema,
} from "@syllst/core/schemas";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

// ============================================================
// Extension IRIs
// ============================================================

describe("EXTENSIONS", () => {
  const ctxBase =
    `${SYLLST_XAPI_NAMESPACE}extensions/context/`;
  const resBase =
    `${SYLLST_XAPI_NAMESPACE}extensions/result/`;
  const actBase =
    `${SYLLST_XAPI_NAMESPACE}extensions/activity/`;

  it("context extensions use correct prefix", () => {
    expect(EXTENSIONS.TARGET_LANGUAGE).toBe(
      `${ctxBase}target-language`
    );
    expect(EXTENSIONS.SOURCE_LANGUAGE).toBe(
      `${ctxBase}source-language`
    );
    expect(EXTENSIONS.CEFR_LEVEL).toBe(
      `${ctxBase}cefr-level`
    );
    expect(EXTENSIONS.TRANSCRIPTION_SYSTEM).toBe(
      `${ctxBase}transcription-system`
    );
  });

  it("result extensions use correct prefix", () => {
    expect(
      EXTENSIONS.PRONUNCIATION_ACCURACY
    ).toBe(`${resBase}pronunciation-accuracy`);
    expect(
      EXTENSIONS.TRANSCRIPTION_ACCURACY
    ).toBe(`${resBase}transcription-accuracy`);
  });

  it("activity extensions use correct prefix", () => {
    expect(EXTENSIONS.TARGET_WORD).toBe(
      `${actBase}target-word`
    );
    expect(EXTENSIONS.TRANSCRIPTION).toBe(
      `${actBase}transcription`
    );
    expect(EXTENSIONS.TRANSLATION).toBe(
      `${actBase}translation`
    );
    expect(EXTENSIONS.WORD_CLASS).toBe(
      `${actBase}word-class`
    );
    expect(EXTENSIONS.CHARACTER_TYPE).toBe(
      `${actBase}character-type`
    );
    expect(EXTENSIONS.DIFFICULTY).toBe(
      `${actBase}difficulty`
    );
  });

  it("has unique IRIs", () => {
    const iris = Object.values(EXTENSIONS);
    const unique = new Set(iris);
    expect(unique.size).toBe(iris.length);
  });
});

// ============================================================
// Value Schemas
// ============================================================

describe("Bcp47Schema", () => {
  it.each(["en", "th", "ja", "ko", "en-US", "th-TH"])(
    "accepts valid tag: %s",
    (tag) => {
      expect(
        Bcp47Schema.safeParse(tag).success
      ).toBe(true);
    }
  );

  it.each(["", "x", "english", "EN", "en_US"])(
    "rejects invalid tag: %s",
    (tag) => {
      expect(
        Bcp47Schema.safeParse(tag).success
      ).toBe(false);
    }
  );
});

describe("CEFRLevelSchema", () => {
  it.each(["A1", "A2", "B1", "B2", "C1", "C2"])(
    "accepts valid level: %s",
    (level) => {
      expect(
        CEFRLevelSchema.safeParse(level).success
      ).toBe(true);
    }
  );

  it.each(["A3", "D1", "a1", "", "X"])(
    "rejects invalid level: %s",
    (level) => {
      expect(
        CEFRLevelSchema.safeParse(level).success
      ).toBe(false);
    }
  );
});

describe("AccuracyScoreSchema", () => {
  it.each([0, 0.5, 1])(
    "accepts valid score: %s",
    (score) => {
      expect(
        AccuracyScoreSchema.safeParse(score)
          .success
      ).toBe(true);
    }
  );

  it.each([-0.1, 1.1, -1])(
    "rejects out-of-range score: %s",
    (score) => {
      expect(
        AccuracyScoreSchema.safeParse(score)
          .success
      ).toBe(false);
    }
  );
});

describe("DifficultySchema", () => {
  it.each([
    "beginner",
    "intermediate",
    "advanced",
  ])("accepts: %s", (d) => {
    expect(
      DifficultySchema.safeParse(d).success
    ).toBe(true);
  });

  it("rejects unknown value", () => {
    expect(
      DifficultySchema.safeParse("expert").success
    ).toBe(false);
  });
});

describe("CharacterTypeSchema", () => {
  it.each(["consonant", "vowel", "tone-mark"])(
    "accepts: %s",
    (t) => {
      expect(
        CharacterTypeSchema.safeParse(t).success
      ).toBe(true);
    }
  );

  it("rejects unknown value", () => {
    expect(
      CharacterTypeSchema.safeParse("number")
        .success
    ).toBe(false);
  });
});

describe("TranscriptionSystemSchema", () => {
  it.each([
    "ipa",
    "paiboon",
    "paiboon+",
    "rtgs",
    "pinyin",
    "hepburn",
  ])("accepts known system: %s", (s) => {
    expect(
      TranscriptionSystemSchema.safeParse(s)
        .success
    ).toBe(true);
  });

  it("accepts custom string", () => {
    expect(
      TranscriptionSystemSchema.safeParse(
        "my-custom-system"
      ).success
    ).toBe(true);
  });

  it("rejects empty string", () => {
    expect(
      TranscriptionSystemSchema.safeParse("")
        .success
    ).toBe(false);
  });
});

// ============================================================
// Composite Extension Schemas
// ============================================================

describe("ContextExtensionsSchema", () => {
  it("validates full context extensions", () => {
    const result =
      ContextExtensionsSchema.safeParse({
        [EXTENSIONS.TARGET_LANGUAGE]: "th",
        [EXTENSIONS.SOURCE_LANGUAGE]: "en",
        [EXTENSIONS.CEFR_LEVEL]: "A1",
        [EXTENSIONS.TRANSCRIPTION_SYSTEM]:
          "paiboon",
      });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    expect(
      ContextExtensionsSchema.safeParse({}).success
    ).toBe(true);
  });

  it("passes through unknown keys", () => {
    const result =
      ContextExtensionsSchema.safeParse({
        "https://example.com/custom": "value",
      });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(
        result.data["https://example.com/custom"]
      ).toBe("value");
    }
  });

  it("rejects invalid CEFR level", () => {
    const result =
      ContextExtensionsSchema.safeParse({
        [EXTENSIONS.CEFR_LEVEL]: "D1",
      });
    expect(result.success).toBe(false);
  });

  it("rejects invalid language tag", () => {
    const result =
      ContextExtensionsSchema.safeParse({
        [EXTENSIONS.TARGET_LANGUAGE]: "ENGLISH",
      });
    expect(result.success).toBe(false);
  });
});

describe("ResultExtensionsSchema", () => {
  it("validates valid result extensions", () => {
    const result =
      ResultExtensionsSchema.safeParse({
        [EXTENSIONS.PRONUNCIATION_ACCURACY]: 0.85,
        [EXTENSIONS.TRANSCRIPTION_ACCURACY]: 0.9,
      });
    expect(result.success).toBe(true);
  });

  it("rejects score > 1", () => {
    const result =
      ResultExtensionsSchema.safeParse({
        [EXTENSIONS.PRONUNCIATION_ACCURACY]: 1.5,
      });
    expect(result.success).toBe(false);
  });
});

describe("ActivityExtensionsSchema", () => {
  it("validates full activity extensions", () => {
    const result =
      ActivityExtensionsSchema.safeParse({
        [EXTENSIONS.TARGET_WORD]: "ก",
        [EXTENSIONS.TRANSCRIPTION]: "ko kai",
        [EXTENSIONS.TRANSLATION]: "chicken",
        [EXTENSIONS.WORD_CLASS]: "noun",
        [EXTENSIONS.CHARACTER_TYPE]: "consonant",
        [EXTENSIONS.DIFFICULTY]: "beginner",
      });
    expect(result.success).toBe(true);
  });

  it("rejects invalid character type", () => {
    const result =
      ActivityExtensionsSchema.safeParse({
        [EXTENSIONS.CHARACTER_TYPE]: "number",
      });
    expect(result.success).toBe(false);
  });

  it("rejects empty target word", () => {
    const result =
      ActivityExtensionsSchema.safeParse({
        [EXTENSIONS.TARGET_WORD]: "",
      });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// Canonical Names & Deprecated Alias Equivalence
// ============================================================

describe("XapiCharacterTypeSchema (canonical)", () => {
  it.each(["consonant", "vowel", "tone-mark"])(
    "accepts: %s",
    (t) => {
      expect(
        XapiCharacterTypeSchema.safeParse(t).success
      ).toBe(true);
    }
  );

  it.each(["number", "diacritic", "radical"])(
    "rejects core-only type: %s",
    (t) => {
      expect(
        XapiCharacterTypeSchema.safeParse(t).success
      ).toBe(false);
    }
  );
});

describe("Deprecated alias equivalence", () => {
  it("CharacterTypeSchema === XapiCharacterTypeSchema", () => {
    expect(CharacterTypeSchema).toBe(
      XapiCharacterTypeSchema
    );
  });

  it("DifficultySchema === DifficultyLevelSchema", () => {
    expect(DifficultySchema).toBe(
      DifficultyLevelSchema
    );
  });
});

describe("Core schema re-exports", () => {
  it("Bcp47Schema is the core schema", () => {
    expect(Bcp47Schema).toBe(CoreBcp47Schema);
  });

  it("CEFRLevelSchema is the core schema", () => {
    expect(CEFRLevelSchema).toBe(
      CoreCEFRLevelSchema
    );
  });

  it("DifficultyLevelSchema is the core schema", () => {
    expect(DifficultyLevelSchema).toBe(
      CoreDifficultyLevelSchema
    );
  });
});
