import { describe, it, expect } from "vitest";
import {
  SYLLST_XAPI_PROFILE,
} from "./profile.js";
import { SYLLST_XAPI_NAMESPACE } from "./types.js";

describe("SYLLST_XAPI_PROFILE", () => {
  it("has required JSON-LD fields", () => {
    expect(
      SYLLST_XAPI_PROFILE["@context"]
    ).toBe(
      "https://w3id.org/xapi/profiles/context"
    );
    expect(SYLLST_XAPI_PROFILE.type).toBe(
      "Profile"
    );
    expect(SYLLST_XAPI_PROFILE.conformsTo).toBe(
      "https://w3id.org/xapi/profiles#1.0"
    );
  });

  it("uses the syllst namespace for id", () => {
    expect(SYLLST_XAPI_PROFILE.id).toBe(
      `${SYLLST_XAPI_NAMESPACE}profile`
    );
  });

  it("has at least one version", () => {
    expect(
      SYLLST_XAPI_PROFILE.versions.length
    ).toBeGreaterThanOrEqual(1);
    expect(
      SYLLST_XAPI_PROFILE.versions[0]!.id
    ).toContain("v/0.1.0");
  });

  it("has author metadata", () => {
    expect(
      SYLLST_XAPI_PROFILE.author.type
    ).toBe("Organization");
    expect(
      SYLLST_XAPI_PROFILE.author.name
    ).toBe("Syllst");
  });

  it("defines concepts", () => {
    expect(
      SYLLST_XAPI_PROFILE.concepts.length
    ).toBeGreaterThan(0);
  });

  it("every concept has required fields", () => {
    for (const concept of SYLLST_XAPI_PROFILE
      .concepts) {
      expect(concept.id).toBeDefined();
      expect(concept.type).toBeDefined();
      expect(concept.inScheme).toBeDefined();
      expect(
        concept.prefLabel["en-US"]
      ).toBeDefined();
      expect(
        concept.definition["en-US"]
      ).toBeDefined();
    }
  });

  it("only defines syllst-namespace concepts", () => {
    for (const concept of SYLLST_XAPI_PROFILE
      .concepts) {
      expect(concept.id).toMatch(
        /^https:\/\/syllst\.dev\/xapi\//
      );
    }
  });

  it("defines 5 new verbs", () => {
    const verbs = SYLLST_XAPI_PROFILE.concepts
      .filter((c) => c.type === "Verb");
    expect(verbs.length).toBe(5);
  });

  it("defines 12 new activity types", () => {
    const types = SYLLST_XAPI_PROFILE.concepts
      .filter((c) => c.type === "ActivityType");
    expect(types.length).toBe(12);
  });

  it("defines context extensions", () => {
    const ctxExt = SYLLST_XAPI_PROFILE.concepts
      .filter(
        (c) => c.type === "ContextExtension"
      );
    expect(ctxExt.length).toBe(4);
  });

  it("defines result extensions", () => {
    const resExt = SYLLST_XAPI_PROFILE.concepts
      .filter(
        (c) => c.type === "ResultExtension"
      );
    expect(resExt.length).toBe(2);
  });

  it("defines activity extensions", () => {
    const actExt = SYLLST_XAPI_PROFILE.concepts
      .filter(
        (c) => c.type === "ActivityExtension"
      );
    expect(actExt.length).toBe(6);
  });
});
