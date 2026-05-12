import { describe, expect, it, vi, beforeEach } from 'vitest';
import { parseWordListSet } from './parse-word-list';
import { parsedJsonDescriptor } from './word-list-catalog';

describe('parseWordListSet — Thai peer-scheme `transcriptions` plural', () => {
  it('normalizes to canonical `transcription.schemes`', () => {
    const set = parseWordListSet({
      id: 'th-a1-greetings',
      name: 'Basic Greetings',
      examGrade: 'A1',
      category: 'greetings',
      partOfSpeech: 'interjection',
      words: [
        {
          id: 'th:1',
          word: 'ดี',
          translation: 'good',
          transcriptions: {
            'paiboon+': 'dii',
            aua: 'dii',
            rtgs: 'di',
            ipa: '/diː˧/',
          },
          partOfSpeech: 'adjective',
        },
      ],
    });

    expect(set.id).toBe('th-a1-greetings');
    expect(set.partOfSpeech).toBe('interjection');
    expect(set.words[0].transcription).toEqual({
      schemes: { 'paiboon+': 'dii', aua: 'dii', rtgs: 'di', ipa: '/diː˧/' },
    });
    expect((set.words[0].transcription as { primary?: string }).primary).toBeUndefined();
    expect(set.words[0].partOfSpeech).toBe('adjective');
  });
});

describe('parseWordListSet — Chinese tagged `{scheme, value}`', () => {
  it('collapses to `{schemes: {[scheme]: value}}`', () => {
    const set = parseWordListSet({
      id: 'zh-a1',
      name: 'Frequency band 1',
      words: [
        {
          word: '的',
          translation: 'of',
          transcription: { scheme: 'pinyin', value: 'de' },
        },
      ],
    });
    expect(set.words[0].transcription).toEqual({ schemes: { pinyin: 'de' } });
  });
});

describe('parseWordListSet — upstream `{primary, ipa, ...}` shape', () => {
  it('resolves primary to a real scheme key when one matches', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [
        {
          word: 'khao',
          transcription: { primary: 'khâao', paiboon: 'khâao', ipa: '/kʰâːw/' },
        },
      ],
    });
    expect(set.words[0].transcription).toEqual({
      schemes: { paiboon: 'khâao', ipa: '/kʰâːw/' },
      primary: 'paiboon',
    });
  });

  it('materializes a synthetic `primary` scheme when no key matches', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [
        {
          word: 'khao',
          transcription: { primary: 'khâao', ipa: '/kʰâːw/' },
        },
      ],
    });
    expect(set.words[0].transcription).toEqual({
      schemes: { primary: 'khâao', ipa: '/kʰâːw/' },
      primary: 'primary',
    });
  });
});

describe('parseWordListSet — canonical `{schemes, primary}` input', () => {
  it('passes through unchanged when primary is a key of schemes', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [
        {
          word: 'a',
          transcription: { schemes: { paiboon: 'aa', ipa: '/a/' }, primary: 'paiboon' },
        },
      ],
    });
    expect(set.words[0].transcription).toEqual({
      schemes: { paiboon: 'aa', ipa: '/a/' },
      primary: 'paiboon',
    });
  });

  it('throws when primary is not a key of schemes', () => {
    expect(() =>
      parseWordListSet({
        id: 'x',
        name: 'x',
        words: [
          {
            word: 'a',
            transcription: { schemes: { ipa: '/a/' }, primary: 'paiboon' },
          },
        ],
      }),
    ).toThrow(/primary "paiboon" is not a key of schemes/);
  });
});

describe('parseWordListSet — bare-string `transcription`', () => {
  it('wraps as `{schemes: {default}}`', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [{ word: 'abc', transcription: 'khao' }],
    });
    expect(set.words[0].transcription).toEqual({ schemes: { default: 'khao' } });
  });
});

describe('parseWordListSet — legacy flat `ipa` and `transliteration`', () => {
  it('merges them into schemes when transcription is absent', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [{ word: 'abc', ipa: '/abc/', transliteration: 'abc' }],
    });
    expect(set.words[0].transcription).toEqual({
      schemes: { ipa: '/abc/', romanization: 'abc' },
    });
  });

  it('does not overwrite an explicit transcription.ipa', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [
        {
          word: 'abc',
          transcription: { ipa: '/canonical/' },
          ipa: '/legacy/',
        },
      ],
    });
    const t = set.words[0].transcription as { schemes: Record<string, string> };
    expect(t.schemes.ipa).toBe('/canonical/');
  });
});

describe('parseWordListSet — CJK `reading`', () => {
  it('wraps bare string as `{default}`', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [{ word: '頭', reading: 'atama' }],
    });
    expect(set.words[0].reading).toEqual({ default: 'atama' });
  });

  it('passes object form through', () => {
    const set = parseWordListSet({
      id: 'x',
      name: 'x',
      words: [{ word: '頭', reading: { hiragana: 'あたま', romaji: 'atama' } }],
    });
    expect(set.words[0].reading).toEqual({ hiragana: 'あたま', romaji: 'atama' });
  });
});

describe('parseWordListSet — set-level `pos` / `cat` / `level` aliases', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('normalizes to `partOfSpeech`, `category`, `examGrade`', () => {
    const set = parseWordListSet({
      id: 'x-pos',
      name: 'x',
      pos: 'verb',
      cat: 'actions',
      level: 'B1',
      words: ['walk', 'run'],
    });
    expect(set.partOfSpeech).toBe('verb');
    expect(set.category).toBe('actions');
    expect(set.examGrade).toBe('B1');
    expect(set.words[0]).toMatchObject({
      word: 'walk',
      partOfSpeech: 'verb',
      category: 'actions',
      examGrade: 'B1',
    });
  });

  it('warns once when set-level `pos` is used', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    parseWordListSet({ id: 'x-pos-warn', name: 'x', pos: 'noun', words: [] });
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/deprecated set-level `pos`/));
  });
});

describe('parseWordListSet — bare-string words inherit set defaults', () => {
  it('expands with set partOfSpeech and examGrade', () => {
    const set = parseWordListSet({
      id: 'th-greetings',
      name: 'Greetings',
      examGrade: 'A1',
      partOfSpeech: 'interjection',
      words: ['สวัสดี', 'ขอบคุณ'],
    });
    expect(set.words).toHaveLength(2);
    expect(set.words[0]).toMatchObject({
      word: 'สวัสดี',
      partOfSpeech: 'interjection',
      examGrade: 'A1',
    });
  });
});

describe('parseWordListSet — malformed input throws', () => {
  it('throws on missing id', () => {
    expect(() => parseWordListSet({ name: 'x', words: [] })).toThrow(/missing required `id`/);
  });
  it('throws on missing name', () => {
    expect(() => parseWordListSet({ id: 'x', words: [] })).toThrow(/missing required `name`/);
  });
  it('throws on missing words array', () => {
    expect(() => parseWordListSet({ id: 'x', name: 'x' })).toThrow(/missing `words` array/);
  });
  it('throws on word with no `word` field, locating the index', () => {
    expect(() =>
      parseWordListSet({
        id: 'x',
        name: 'x',
        words: [{ translation: 'no word here' }],
      }),
    ).toThrow(/words\[0\]/);
  });
  it('throws on non-string transcription value', () => {
    expect(() =>
      parseWordListSet({
        id: 'x',
        name: 'x',
        words: [{ word: 'a', transcription: { ipa: 123 } }],
      }),
    ).toThrow(/transcription\.ipa/);
  });
});

describe('parsedJsonDescriptor', () => {
  it('wraps a JSON loader so `load()` returns a canonical set', async () => {
    const desc = parsedJsonDescriptor(
      {
        id: 'x-desc',
        name: 'X',
        examGrade: 'A1',
      },
      async () => ({
        default: {
          id: 'x-desc',
          name: 'X',
          words: [{ word: 'ดี', transcriptions: { ipa: '/diː/' } }],
        },
      }),
    );
    expect(desc.id).toBe('x-desc');
    expect(desc.examGrade).toBe('A1');
    const set = await desc.load();
    expect(set.words[0].transcription).toEqual({ schemes: { ipa: '/diː/' } });
  });
});
