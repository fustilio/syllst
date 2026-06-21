# ADR-0001: Transcription object shape — schemes-as-record with pointer primary

**Status:** Accepted
**Date:** 2026-05-12
**Context window:** `@syllst/core`, downstream `@syllst/word-lists`, polyglot-bundles

## Context

`TranscriptionObject` was originally `{ primary: string; ipa?: string; [system]: string | undefined }`. Two problems surfaced from real data:

1. `primary` is *required* but not always meaningful. Thai authoring uses four peer schemes (`paiboon+`, `aua`, `rtgs`, `ipa`) with no canonical default; forcing `primary` requires inventing a synthetic value or duplicating one of the four.
2. `primary` holds a *value* not declared in any other field, so consumers can't tell which scheme produced it. Enumerating "all schemes" requires the `Object.keys(...).filter(k => k !== 'primary')` dance.

polyglot-bundles shipped a local canonical layer `{ schemes: Record<string, string>; primary?: string }` where `primary` is a key into `schemes`, and asked upstream to mirror.

## Decision

Adopt the canonical shape upstream as `CanonicalTranscriptionObject`. Ship it via a **transitional union**:

```ts
export type TranscriptionObject = LegacyTranscriptionObject | CanonicalTranscriptionObject;
```

This keeps the change additive (no required-field removal), so it ships as a **minor** on `@syllst/core`. Legacy is `@deprecated`. Provide `normalizeTranscription(t): string | CanonicalTranscriptionObject` so consumers can collapse legacy objects to canonical in one call (bare strings pass through unchanged). Drop the legacy arm in the next major.

## Alternatives considered

- **Major bump, hard replace.** Cleanest types, but a `@syllst/core` major ripples through every downstream package and was rejected on cost grounds.
- **Just make `primary` optional, keep the open index signature.** Unblocks Thai authoring but preserves the "primary holds a mystery value" footgun and the unenumerable schemes problem. Rejected — the footgun was the main reason for the RFC.

## Consequences

- Consumers must narrow the union or call `normalizeTranscription`. Code that does `Object.keys(t).filter(k => k !== 'primary')` to enumerate schemes will *silently* work on legacy data and break on canonical data — must be flagged in release notes.
- `primary` is a pointer; if present, it MUST be a key of `schemes`. **Runtime-enforced** in the parser/validator: a transcription with `primary` not in `schemes` is rejected as a data error. The constraint is not expressed in the TypeScript type (would require making `TranscriptionObject` generic over its schemes record, which is hostile to ergonomics) — it lives at the validation boundary instead.
- New producers should emit only the canonical shape. Legacy is a read-compat path, not an authoring target.
- **Drop trigger:** the legacy union arm is removed in `@syllst/core` 2.0, scheduled when polyglot-bundles (the canonical author) confirms a release cycle with zero legacy emissions. No fixed date — coupled to the producer's migration progress.
- **Validation home:** `@syllst/core` ships `normalizeTranscription` and the strict-primary predicate. `@syllst/word-lists` parser invokes them at the JSON boundary. Other downstream consumers may call them as needed. Rule lives with the type; enforcement point is policy.
