import { describe, it, expect } from "vitest";
import {
  VerbSchema,
  ProfileVerbSchema,
  ActivityDefinitionSchema,
  ResultSchema,
  ContextSchema,
} from "./schemas.js";
import { VERBS } from "./verbs.js";
import { ACTIVITY_TYPES } from "./activity-types.js";
import { EXTENSIONS } from "./extensions.js";

describe("VerbSchema", () => {
  it("accepts a valid verb object", () => {
    const result = VerbSchema.safeParse({
      id: VERBS.ANSWERED,
      display: { "en-US": "answered" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts any URL as verb id", () => {
    const result = VerbSchema.safeParse({
      id: "https://example.com/verbs/custom",
      display: { "en-US": "custom" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-URL verb id", () => {
    const result = VerbSchema.safeParse({
      id: "not-a-url",
      display: { "en-US": "broken" },
    });
    expect(result.success).toBe(false);
  });
});

describe("ProfileVerbSchema", () => {
  it("accepts a known profile verb", () => {
    const result = ProfileVerbSchema.safeParse({
      id: VERBS.TRANSCRIBED,
      display: { "en-US": "transcribed" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown verb", () => {
    const result = ProfileVerbSchema.safeParse({
      id: "https://example.com/verbs/unknown",
      display: { "en-US": "unknown" },
    });
    expect(result.success).toBe(false);
  });
});

describe("ActivityDefinitionSchema", () => {
  it("validates a complete definition", () => {
    const result =
      ActivityDefinitionSchema.safeParse({
        type: ACTIVITY_TYPES.FLASHCARD_DECK,
        name: {
          "en-US": "Thai Consonants",
        },
        description: {
          "en-US": "Practice Thai consonants",
        },
        extensions: {
          [EXTENSIONS.DIFFICULTY]: "beginner",
        },
      });
    expect(result.success).toBe(true);
  });

  it("accepts empty definition", () => {
    expect(
      ActivityDefinitionSchema.safeParse({})
        .success
    ).toBe(true);
  });
});

describe("ResultSchema", () => {
  it("validates a complete result", () => {
    const result = ResultSchema.safeParse({
      score: { scaled: 0.85, raw: 17, max: 20 },
      success: true,
      completion: true,
      duration: "PT45S",
      extensions: {
        [EXTENSIONS.PRONUNCIATION_ACCURACY]: 0.9,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects scaled score out of range", () => {
    const result = ResultSchema.safeParse({
      score: { scaled: 2.0 },
    });
    expect(result.success).toBe(false);
  });
});

describe("ContextSchema", () => {
  it("validates a complete context", () => {
    const result = ContextSchema.safeParse({
      registration:
        "550e8400-e29b-41d4-a716-446655440000",
      language: "th",
      extensions: {
        [EXTENSIONS.TARGET_LANGUAGE]: "th",
        [EXTENSIONS.SOURCE_LANGUAGE]: "en",
        [EXTENSIONS.CEFR_LEVEL]: "A1",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid registration UUID", () => {
    const result = ContextSchema.safeParse({
      registration: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("passes through unknown context fields", () => {
    const result = ContextSchema.safeParse({
      platform: "chishiki",
    });
    expect(result.success).toBe(true);
  });
});
