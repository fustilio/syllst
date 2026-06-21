# syllst — Domain Glossary

Terms used across `@syllst/*` packages. Keep entries domain-meaningful — no implementation details.

## Transcription

A rendering of a word's pronunciation in some script or notation. Distinct from **reading** (see below).

- A **transcription scheme** is a named notation system: `ipa`, `paiboon+`, `rtgs`, `aua`, `pinyin`, `hepburn`, etc. Schemes are peers — none is universally canonical.
- A **transcription** carries one or more scheme renderings of the same word. The simple form is a bare string (scheme implicit / not declared); the rich form is `{ schemes: Record<scheme, value>, primary?: scheme }` where `primary` (optional) is a *pointer* into `schemes` identifying which rendering to display by default.
- `primary` is a key, not a value. It never holds a string that isn't also in `schemes`.

Legacy shape `{ primary: string, ipa?: string, [scheme]: string }` (where `primary` held a value, not a key) is deprecated — see [ADR-0001](docs/adr/0001-transcription-object-shape.md).

## Reading

A script-internal rendering of how a word is read in its own writing system — distinct from a phonetic transcription. Used for CJK languages where a word in one script (e.g. kanji `頭`) needs to be presented in another script of the same language (hiragana `あたま`, romaji `atama`).

**Status.** Implemented in `@syllst/word-lists` as the `WordListItem.reading` field (`string | Record<scheme, value>`), normalized by `parseWordListSet`. Not yet carried on `@syllst/core` syllabus nodes (`VocabularyItemNode` / `CharacterItemNode`).

**Overlap with transcription.** Romanizations (romaji, pinyin, revised romanization) are dual-use: they function as *readings* when the author treats them as a script the language owns (signage, input methods, native usage) and as *transcriptions* when they're meant as a phonetic approximation for learners. The discriminator is authoring intent, not the string value. A field's name (`reading` vs `transcription`) records that intent.

## Word list

A flat, JSON-authored collection of vocabulary items. Distinct from the **word list AST** (`WordListSetNode` / `WordListItemNode` in `@syllst/core`), which is the unist-tree representation used by the processor pipeline. The flat JSON shape is the authoring surface; the AST is the processing surface.

## Part of speech

Grammatical category of a word (noun, verb, …). May be set per-item or, when a set is homogeneous, per-set.

**Resolution rule.** When an item has no `partOfSpeech`, it inherits the set's `partOfSpeech` if present. Inheritance happens at *resolution time*, not at parse time — parsed JSON faithfully reflects the source. Use `resolveItemPartOfSpeech(set, item)` rather than reading `item.partOfSpeech` directly when the resolved value matters.
