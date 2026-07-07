# @syllst/glost

Remark plugin that enriches Syllst nodes with GLOST word-level annotations.

## Installation

```bash
pnpm add @syllst/glost
```

### Peer Dependencies

For full GLOST integration, install the glost packages:

```bash
pnpm add @glotblocks/glost-core @glotblocks/glost-processor
```

## Usage

### Basic Usage

```typescript
import { createMDXParser } from '@syllst/processor';
import { remarkSyllabusDirectives } from '@syllst/processor/plugins';
import { remarkSyllstGlost } from '@syllst/glost';

// Create a transcription provider (example)
const thaiProvider = {
  getTranscription: (word: string, scheme: string) => {
    // Return transcription for the word
    return transcriptions[word]?.[scheme];
  },
  getDefaultScheme: () => 'paiboon+',
};

// Configure the processor
const processor = createMDXParser()
  .use(remarkSyllabusDirectives)
  .use(remarkSyllstGlost, {
    languages: [
      {
        lang: 'th',
        transcriptionProvider: thaiProvider,
        defaultScheme: 'paiboon+',
      },
    ],
    defaultLang: 'th',
    targets: ['vocabularyItem', 'dialogueTurn'],
  });

// Process MDX content
const result = await processor.process(mdxContent);
```

### With polyglot-bundles Language Packages

```typescript
import { remarkSyllstGlost } from '@syllst/glost';
import { createThaiTranscriptionProvider } from '@polyglot-bundles/th-lang';

const processor = createMDXParser()
  .use(remarkSyllabusDirectives)
  .use(remarkSyllstGlost, {
    languages: [
      {
        lang: 'th',
        transcriptionProvider: createThaiTranscriptionProvider(),
        defaultScheme: 'paiboon+',
      },
    ],
    defaultLang: 'th',
  });
```

## API

### `remarkSyllstGlost(options?)`

Remark plugin that enriches syllst nodes with transcription data.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `languages` | `LanguageProviderConfig[]` | `[]` | Language provider configurations |
| `defaultLang` | `string` | `'en'` | Default language for content without explicit lang |
| `targets` | `EnrichTarget[]` | `['all']` | Node types to enrich: `'vocabularyItem'`, `'dialogueTurn'`, `'example'`, `'all'` |
| `skipExisting` | `boolean` | `true` | Skip nodes that already have transcription |
| `schemes` | `string[]` | Provider default | Transcription schemes to generate |
| `wordLevelDialogue` | `boolean` | `false` | Enable word-level GLOST annotations for dialogue |
| `sentenceLevelDialogue` | `boolean` | `false` | Enable sentence-level GLOST annotations for dialogue |

#### LanguageProviderConfig

```typescript
interface LanguageProviderConfig {
  lang: string;                              // Language code (e.g., 'th', 'ja')
  transcriptionProvider?: TranscriptionProvider;
  defaultScheme?: string;                    // Default transcription scheme
}
```

#### TranscriptionProvider

```typescript
interface TranscriptionProvider {
  getTranscription(word: string, scheme: string): string | undefined;
  getTranscriptions?(word: string): Record<string, string> | undefined;
  getDefaultScheme?(): string;
}
```

### `createProviderRegistry(configs)`

Creates a language provider registry from an array of configurations.

```typescript
import { createProviderRegistry } from '@syllst/glost/providers';

const registry = createProviderRegistry([
  { lang: 'th', transcriptionProvider: thaiProvider },
  { lang: 'ja', transcriptionProvider: japaneseProvider },
]);

registry.get('th');      // Returns Thai provider config
registry.has('ja');      // true
registry.getLanguages(); // ['th', 'ja']
```

### `LanguageProviderRegistry`

Class for managing language providers.

```typescript
import { LanguageProviderRegistry } from '@syllst/glost/providers';

const registry = new LanguageProviderRegistry();
registry.register({ lang: 'th', transcriptionProvider });
registry.get('th-TH'); // Falls back to 'th' if 'th-TH' not found
```

### Enrichers

For advanced usage, individual enrichers are available:

```typescript
import {
  enrichVocabularyItem,
  enrichDialogueTurn,
  enrichExample,
} from '@syllst/glost/enrichers';
```

## How It Works

1. The plugin runs after `remarkSyllabusDirectives` in the unified pipeline
2. It visits all nodes matching the configured targets
3. For each node, it:
   - Detects the language (from node, parent, or default)
   - Looks up the appropriate language provider
   - Calls the transcription provider to get transcription data
   - Enriches the node's `transcription` field

### Transcription Output

Single scheme:
```typescript
node.transcription = "sawatdee";
```

Multiple schemes:
```typescript
node.transcription = {
  primary: "sawatdee",
  paiboon: "sà-wàt-dee",
  ipa: "/sà.wàt.diː/",
  rtgs: "sawatdi"
};
```

## Metadata

After processing, metadata is attached to the vfile:

```typescript
const result = await processor.process(content);
const meta = result.data.syllstGlost;

console.log(meta.nodesEnriched);   // Number of nodes enriched
console.log(meta.processingTime);  // Time in ms
console.log(meta.results);         // Detailed per-node results
```

## License

MIT
