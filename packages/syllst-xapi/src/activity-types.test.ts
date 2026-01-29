import { describe, it, expect } from "vitest";
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_DEFINITIONS,
  ACTIVITY_TYPE_LABELS,
  getActivityTypeLabel,
} from "./activity-types.js";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

describe("ACTIVITY_TYPES", () => {
  it("has correct ADL activity type IRIs", () => {
    expect(ACTIVITY_TYPES.COURSE).toBe(
      "http://adlnet.gov/expapi/activities/course"
    );
    expect(ACTIVITY_TYPES.LESSON).toBe(
      "http://adlnet.gov/expapi/activities/lesson"
    );
    expect(ACTIVITY_TYPES.ASSESSMENT).toBe(
      "http://adlnet.gov/expapi/activities/assessment"
    );
  });

  it("has correct Activity Streams type IRIs", () => {
    expect(ACTIVITY_TYPES.VIDEO).toBe(
      "http://activitystrea.ms/schema/1.0/video"
    );
    expect(ACTIVITY_TYPES.AUDIO).toBe(
      "http://activitystrea.ms/schema/1.0/audio"
    );
  });

  it("defines new types under syllst namespace", () => {
    const newTypes = [
      "VOCABULARY_DRILL",
      "CHARACTER_RECOGNITION",
      "PRONUNCIATION_PRACTICE",
      "DIALOGUE_PRACTICE",
      "GRAMMAR_EXERCISE",
      "CLOZE_TEST",
      "TRANSLATION_EXERCISE",
      "FLASHCARD_DECK",
      "FLASHCARD",
      "LISTENING_COMPREHENSION",
      "READING_COMPREHENSION",
      "SPACED_REPETITION_SESSION",
    ] as const;

    for (const key of newTypes) {
      expect(ACTIVITY_TYPES[key]).toMatch(
        new RegExp(
          `^${SYLLST_XAPI_NAMESPACE}` +
            "activity-types/"
        )
      );
    }
  });

  it("has unique IRIs for all types", () => {
    const iris = Object.values(ACTIVITY_TYPES);
    const unique = new Set(iris);
    expect(unique.size).toBe(iris.length);
  });
});

describe("ACTIVITY_TYPE_DEFINITIONS", () => {
  it("has a definition for every type key", () => {
    for (const key of Object.keys(
      ACTIVITY_TYPES
    )) {
      const k =
        key as keyof typeof ACTIVITY_TYPES;
      const def = ACTIVITY_TYPE_DEFINITIONS[k];
      expect(def).toBeDefined();
      expect(def.id).toBe(ACTIVITY_TYPES[k]);
      expect(def.display["en-US"]).toBeDefined();
    }
  });

  it("new types have descriptions", () => {
    const def =
      ACTIVITY_TYPE_DEFINITIONS.VOCABULARY_DRILL;
    expect(
      def.description?.["en-US"]
    ).toBeDefined();
  });
});

describe("ACTIVITY_TYPE_LABELS", () => {
  it("has a label for every type IRI", () => {
    for (const iri of Object.values(
      ACTIVITY_TYPES
    )) {
      expect(
        ACTIVITY_TYPE_LABELS[iri]
      ).toBeDefined();
    }
  });
});

describe("getActivityTypeLabel", () => {
  it("returns label for known type", () => {
    expect(
      getActivityTypeLabel(
        ACTIVITY_TYPES.FLASHCARD_DECK
      )
    ).toBe("Flashcard Deck");
  });
});
