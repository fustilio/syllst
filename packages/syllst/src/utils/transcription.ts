import type {
  CanonicalTranscriptionObject,
  LegacyTranscriptionObject,
  Transcription,
  TranscriptionObject,
} from '../types/nodes.js';

export function isCanonicalTranscriptionObject(
  t: TranscriptionObject,
): t is CanonicalTranscriptionObject {
  return typeof (t as CanonicalTranscriptionObject).schemes === 'object'
    && (t as CanonicalTranscriptionObject).schemes !== null;
}

export function isLegacyTranscriptionObject(
  t: TranscriptionObject,
): t is LegacyTranscriptionObject {
  return !isCanonicalTranscriptionObject(t)
    && typeof (t as LegacyTranscriptionObject).primary === 'string';
}

export function isValidTranscription(t: unknown): t is Transcription {
  if (typeof t === 'string') return true;
  if (t === null || typeof t !== 'object') return false;
  const obj = t as Record<string, unknown>;

  if (obj.schemes && typeof obj.schemes === 'object') {
    const schemes = obj.schemes as Record<string, unknown>;
    for (const v of Object.values(schemes)) {
      if (typeof v !== 'string') return false;
    }
    if (obj.primary !== undefined) {
      if (typeof obj.primary !== 'string') return false;
      if (!(obj.primary in schemes)) return false;
    }
    return true;
  }

  if (typeof obj.primary === 'string') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'primary') continue;
      if (v !== undefined && typeof v !== 'string') return false;
    }
    return true;
  }

  return false;
}

/**
 * Collapse any {@link Transcription} to canonical form.
 *
 * Bare strings pass through unchanged. Legacy objects are rewritten as
 * `{ schemes, primary }` where the legacy `primary` value is hoisted into
 * `schemes` under a synthetic `primary` key (preserving round-trip read
 * compatibility — see ADR-0001).
 *
 * @throws if `t` is structurally invalid or if a canonical input has `primary`
 *   pointing at a key not in `schemes`.
 */
export function normalizeTranscription(
  t: Transcription,
): string | CanonicalTranscriptionObject {
  if (typeof t === 'string') return t;

  if (isCanonicalTranscriptionObject(t)) {
    if (t.primary !== undefined && !(t.primary in t.schemes)) {
      throw new Error(
        `Transcription.primary "${t.primary}" is not a key of schemes (${Object.keys(t.schemes).join(', ')})`,
      );
    }
    return { schemes: { ...t.schemes }, ...(t.primary !== undefined ? { primary: t.primary } : {}) };
  }

  if (!isLegacyTranscriptionObject(t)) {
    throw new Error('Invalid Transcription: not a string, canonical, or legacy object');
  }

  const schemes: Record<string, string> = {};
  for (const [k, v] of Object.entries(t)) {
    if (k === 'primary') continue;
    if (typeof v === 'string') schemes[k] = v;
  }
  schemes.primary = t.primary;
  return { schemes, primary: 'primary' };
}
