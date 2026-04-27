/**
 * Japanese text normalization utilities.
 *
 * Normalizes whitespace, full-width characters, and common
 * orthographic variants before comparison.
 */

/**
 * Normalize Japanese text for comparison.
 *
 * - Collapses whitespace
 * - Trims leading/trailing whitespace
 * - Converts full-width Latin and digits to half-width
 */
export function normalizeJapanese(text: string): string {
  return text
    .replace(/[\s\n\r\t]+/g, ' ')
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/**
 * Convert to a canonical form for exact matching.
 *
 * Also strips common particle/auxiliary variations.
 */
export function toCanonical(text: string): string {
  return normalizeJapanese(text)
    .replace(/[はがをにでへもと]/g, '') // naive: strip particles for looser matching
    .trim();
}
