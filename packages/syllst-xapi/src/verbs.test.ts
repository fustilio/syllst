import { describe, it, expect } from "vitest";
import {
  VERBS,
  VERB_DEFINITIONS,
  VERB_LABELS,
  getVerbLabel,
} from "./verbs.js";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

describe("VERBS", () => {
  it("has correct ADL verb IRIs", () => {
    expect(VERBS.LAUNCHED).toBe(
      "http://adlnet.gov/expapi/verbs/launched"
    );
    expect(VERBS.COMPLETED).toBe(
      "http://adlnet.gov/expapi/verbs/completed"
    );
    expect(VERBS.ANSWERED).toBe(
      "http://adlnet.gov/expapi/verbs/answered"
    );
  });

  it("has correct cmi5 verb IRIs", () => {
    expect(VERBS.WAIVED).toBe(
      "https://w3id.org/xapi/adl/verbs/waived"
    );
    expect(VERBS.ABANDONED).toBe(
      "https://w3id.org/xapi/adl/verbs/abandoned"
    );
    expect(VERBS.SATISFIED).toBe(
      "https://w3id.org/xapi/adl/verbs/satisfied"
    );
  });

  it("has correct TinCan verb IRIs", () => {
    expect(VERBS.VIEWED).toBe(
      "http://id.tincanapi.com/verb/viewed"
    );
    expect(VERBS.RECALLED).toBe(
      "http://id.tincanapi.com/verb/recalled"
    );
  });

  it("has correct Activity Streams verb IRIs", () => {
    expect(VERBS.READ).toBe(
      "http://activitystrea.ms/schema/1.0/read"
    );
    expect(VERBS.WATCHED).toBe(
      "http://activitystrea.ms/schema/1.0/watch"
    );
    expect(VERBS.LISTENED).toBe(
      "http://activitystrea.ms/schema/1.0/listen"
    );
  });

  it("defines new verbs under syllst namespace", () => {
    const newVerbs = [
      "TRANSCRIBED",
      "PRONOUNCED",
      "TRANSLATED",
      "PRACTICED",
      "DRILLED",
    ] as const;

    for (const key of newVerbs) {
      expect(VERBS[key]).toMatch(
        new RegExp(
          `^${SYLLST_XAPI_NAMESPACE}verbs/`
        )
      );
    }
  });

  it("has unique IRIs for all verbs", () => {
    const iris = Object.values(VERBS);
    const unique = new Set(iris);
    expect(unique.size).toBe(iris.length);
  });
});

describe("VERB_DEFINITIONS", () => {
  it("has a definition for every VERB key", () => {
    for (const key of Object.keys(VERBS)) {
      const k = key as keyof typeof VERBS;
      const def = VERB_DEFINITIONS[k];
      expect(def).toBeDefined();
      expect(def.id).toBe(VERBS[k]);
      expect(def.display["en-US"]).toBeDefined();
    }
  });
});

describe("VERB_LABELS", () => {
  it("has a label for every verb IRI", () => {
    for (const iri of Object.values(VERBS)) {
      expect(VERB_LABELS[iri]).toBeDefined();
      expect(
        typeof VERB_LABELS[iri]
      ).toBe("string");
    }
  });
});

describe("getVerbLabel", () => {
  it("returns label for known verb", () => {
    expect(getVerbLabel(VERBS.TRANSCRIBED)).toBe(
      "Transcribed"
    );
    expect(getVerbLabel(VERBS.LAUNCHED)).toBe(
      "Launched"
    );
  });
});
