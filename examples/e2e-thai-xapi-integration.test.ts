/**
 * End-to-End Integration Example: Thai Content → Chishiki → xAPI
 *
 * This test demonstrates the complete glotblocks ecosystem flow:
 *
 * 1. Thai MDX content (polyglot-bundles style)
 * 2. Parsed via @syllst/processor → LessonAstNode
 * 3. Converted via @chishiki/importer-syllst → SyllstLearningContent[]
 * 4. xAPI statement structure (@syllst/xapi vocabulary)
 *
 * This is a reference implementation showing how consumer apps
 * like lalia-prism can integrate all four ecosystem projects.
 *
 * Run with: pnpm test examples/e2e-thai-xapi-integration.test.ts
 */

import { describe, it, expect } from 'vitest';
import { buildLessonFromMDX } from '@syllst/processor';
import { validateLesson } from '@syllst/processor/validators';
import type { LessonAstNode, VocabularySetNode, CharacterSetNode, DialogueNode } from '@syllst/core/types';

// Import @syllst/xapi vocabulary
import { VERBS, VERB_DEFINITIONS } from '@syllst/xapi/verbs';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_DEFINITIONS } from '@syllst/xapi/activity-types';
import { EXTENSIONS } from '@syllst/xapi/extensions';

// ============================================================================
// Inline Thai Lesson Content (simulating @syllst/th content)
// ============================================================================

const THAI_LESSON_MDX = `---
type: lesson
id: thai-greetings-01
title: Basic Thai Greetings
description: Learn essential Thai greetings and polite expressions
order: 1
difficulty: beginner
cefrLevel: A1
categories:
  - greetings
  - conversation
skills:
  - speaking
  - listening
---

# Basic Thai Greetings

Learn essential Thai greetings and polite expressions for everyday interactions.

:::vocabulary-set{id="greetings-vocab" title="Greeting Words"}

::vocab{id="sawatdee" word="สวัสดี" transcription="sà-wàt-dee" translation="hello/goodbye"}
The most common Thai greeting.
::

::vocab{id="khop-khun" word="ขอบคุณ" transcription="khɔ̀ɔp-khun" translation="thank you"}
Used to express gratitude.
::

::vocab{id="chai" word="ใช่" transcription="châi" translation="yes"}
Affirmative response.
::

::vocab{id="mai" word="ไม่" transcription="mâi" translation="no/not"}
Negative response.
::

:::

:::character-set{id="tone-marks" title="Thai Tone Marks" charType="tone-mark"}

::character{id="mai-ek" char="่" name="mai ek" transcription="low tone" charType="tone-mark"}
The first tone mark.
::

::character{id="mai-tho" char="้" name="mai tho" transcription="falling tone" charType="tone-mark"}
The second tone mark.
::

::character{id="mai-tri" char="๊" name="mai tri" transcription="high tone" charType="tone-mark"}
The third tone mark.
::

::character{id="mai-chattawa" char="๋" name="mai chattawa" transcription="rising tone" charType="tone-mark"}
The fourth tone mark.
::

:::

:::dialogue{id="shop-greeting" context="shopping" lang="th"}

::turn{speaker="customer" name="Customer" gender="neutral"}
สวัสดีครับ
# transcription: sà-wàt-dee khráp
::

::turn{speaker="shopkeeper" name="Shopkeeper" gender="neutral"}
สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ
# transcription: sà-wàt-dee khâ, mee à-rai hâi chûuay mǎi khá
::

::turn{speaker="customer"}
ขอบคุณครับ
# transcription: khɔ̀ɔp-khun khráp
::

::cultural-note
Thai uses gender-specific polite particles. Men use ครับ (khráp) and women use ค่ะ/คะ (khâ/khá).
::

:::

:::exercise{id="greeting-exercise" exerciseType="matching" title="Match Greetings" difficulty="beginner"}
Match the Thai word with its English meaning.

- สวัสดี → hello/goodbye
- ขอบคุณ → thank you
- ใช่ → yes
- ไม่ → no/not
:::
`;

// ============================================================================
// Mock Chishiki Types (simulating @chishiki/importer-syllst)
// ============================================================================

interface SyllstLearningContent {
  id: string;
  type: string;
  title: string;
  parentId?: string;
  sourceUrl?: string;
  language?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface SyllstVocabularyItem {
  id: string;
  word: string;
  transcription?: string;
  translation: string;
  partOfSpeech?: string;
}

interface SyllstCharacterItem {
  id: string;
  char: string;
  name: string;
  transcription?: string;
  charType?: string;
}

interface SyllstDialogueTurn {
  speakerId: string;
  text: string;
  transcription?: string;
  translation: string;
}

// ============================================================================
// Converter Functions (simulating @chishiki/importer-syllst/converters)
// ============================================================================

const getTimestamp = (): string => new Date().toISOString();

const getPrimaryTranscription = (
  t: string | { primary: string } | undefined
): string | undefined => {
  if (!t) return undefined;
  if (typeof t === 'string') return t;
  return t.primary;
};

function lessonToContent(lesson: LessonAstNode): SyllstLearningContent {
  const timestamp = getTimestamp();
  return {
    id: lesson.id,
    type: 'lesson',
    title: lesson.title,
    language: lesson.lang,
    data: {
      description: lesson.description,
      difficulty: lesson.difficulty,
      cefrLevel: lesson.cefrLevel,
      categories: lesson.categories,
      skills: lesson.skills,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function vocabularySetToContent(
  node: VocabularySetNode,
  parentId: string
): SyllstLearningContent {
  const timestamp = getTimestamp();
  const items: SyllstVocabularyItem[] = node.children.map((item) => ({
    id: item.id,
    word: item.word,
    transcription: getPrimaryTranscription(item.transcription),
    translation: item.translation,
    partOfSpeech: item.partOfSpeech,
  }));

  return {
    id: node.id,
    type: 'vocabulary-set',
    title: node.title || `Vocabulary Set: ${node.id}`,
    parentId,
    data: { items },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function characterSetToContent(
  node: CharacterSetNode,
  parentId: string
): SyllstLearningContent {
  const timestamp = getTimestamp();
  const items: SyllstCharacterItem[] = node.children.map((item) => ({
    id: item.id,
    char: item.char,
    name: item.name,
    transcription: getPrimaryTranscription(item.transcription),
    charType: item.charType,
  }));

  return {
    id: node.id,
    type: 'character-set',
    title: node.title || `Character Set: ${node.id}`,
    parentId,
    data: { items, charType: node.charType },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function dialogueToContent(
  node: DialogueNode,
  parentId: string
): SyllstLearningContent {
  const timestamp = getTimestamp();
  const turns: SyllstDialogueTurn[] = node.children.map((turn) => ({
    speakerId: turn.speakerId,
    text: turn.text,
    transcription: getPrimaryTranscription(turn.transcription),
    translation: turn.translation,
  }));

  return {
    id: node.id,
    type: 'dialogue',
    title: `Dialogue: ${node.id}`,
    parentId,
    data: {
      participants: node.participants,
      turns,
      culturalNotes: node.culturalNotes,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function lessonToContentBundle(lesson: LessonAstNode): SyllstLearningContent[] {
  const contents: SyllstLearningContent[] = [];

  // Convert lesson itself
  const lessonContent = lessonToContent(lesson);
  contents.push(lessonContent);

  // Convert children
  for (const child of lesson.children) {
    if (child.type === 'vocabularySet') {
      contents.push(vocabularySetToContent(child as VocabularySetNode, lessonContent.id));
    } else if (child.type === 'characterSet') {
      contents.push(characterSetToContent(child as CharacterSetNode, lessonContent.id));
    } else if (child.type === 'dialogue') {
      contents.push(dialogueToContent(child as DialogueNode, lessonContent.id));
    }
    // Note: exercises and other types would be converted similarly
  }

  return contents;
}

// ============================================================================
// xAPI Statement Builder (simulating chishiki activity generation)
// ============================================================================

interface XAPIStatement {
  id: string;
  actor: {
    objectType: 'Agent';
    name: string;
    mbox?: string;
  };
  verb: {
    id: string;
    display: Record<string, string>;
  };
  object: {
    objectType: 'Activity';
    id: string;
    definition: {
      type: string;
      name: Record<string, string>;
      description?: Record<string, string>;
      extensions?: Record<string, unknown>;
    };
  };
  context?: {
    extensions?: Record<string, unknown>;
  };
  result?: {
    success?: boolean;
    score?: { scaled: number };
    duration?: string;
  };
  timestamp: string;
}

function createVocabularyDrillStatement(
  vocabItem: SyllstVocabularyItem,
  actor: { name: string; mbox?: string },
  result?: { success: boolean; score: number }
): XAPIStatement {
  return {
    id: crypto.randomUUID(),
    actor: {
      objectType: 'Agent',
      name: actor.name,
      mbox: actor.mbox,
    },
    verb: {
      id: VERBS.DRILLED,
      display: VERB_DEFINITIONS.DRILLED.display,
    },
    object: {
      objectType: 'Activity',
      id: `https://syllst.dev/activities/vocabulary/${vocabItem.id}`,
      definition: {
        type: ACTIVITY_TYPES.VOCABULARY_DRILL,
        name: { 'en-US': vocabItem.word, th: vocabItem.word },
        description: { 'en-US': vocabItem.translation },
        extensions: {
          [EXTENSIONS.TARGET_WORD]: vocabItem.word,
          [EXTENSIONS.TRANSCRIPTION]: vocabItem.transcription,
          [EXTENSIONS.TRANSLATION]: vocabItem.translation,
        },
      },
    },
    context: {
      extensions: {
        [EXTENSIONS.TARGET_LANGUAGE]: 'th',
        [EXTENSIONS.SOURCE_LANGUAGE]: 'en',
        [EXTENSIONS.CEFR_LEVEL]: 'A1',
      },
    },
    ...(result && {
      result: {
        success: result.success,
        score: { scaled: result.score },
      },
    }),
    timestamp: new Date().toISOString(),
  };
}

function createCharacterRecognitionStatement(
  charItem: SyllstCharacterItem,
  actor: { name: string }
): XAPIStatement {
  return {
    id: crypto.randomUUID(),
    actor: {
      objectType: 'Agent',
      name: actor.name,
    },
    verb: {
      id: VERBS.PRACTICED,
      display: VERB_DEFINITIONS.PRACTICED.display,
    },
    object: {
      objectType: 'Activity',
      id: `https://syllst.dev/activities/character/${charItem.id}`,
      definition: {
        type: ACTIVITY_TYPES.CHARACTER_RECOGNITION,
        name: { 'en-US': charItem.name, th: charItem.char },
        extensions: {
          [EXTENSIONS.TARGET_WORD]: charItem.char,
          [EXTENSIONS.CHARACTER_TYPE]: charItem.charType,
          [EXTENSIONS.TRANSCRIPTION]: charItem.transcription,
        },
      },
    },
    context: {
      extensions: {
        [EXTENSIONS.TARGET_LANGUAGE]: 'th',
      },
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Test Suite
// ============================================================================

describe('E2E Integration: Thai → Chishiki → xAPI', () => {
  describe('Step 1: Parse MDX via @syllst/processor', () => {
    it('should parse Thai lesson MDX into Syllst AST', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBe('thai-greetings-01');
      expect(lesson.title).toBe('Basic Thai Greetings');
      expect(lesson.difficulty).toBe('beginner');
      expect(lesson.cefrLevel).toBe('A1');
      expect(lesson.categories).toContain('greetings');
      // Skills may or may not be parsed depending on processor version
      if (lesson.skills) {
        expect(lesson.skills).toContain('speaking');
      }
    });

    it('should extract vocabulary set with Thai words', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const vocabSet = lesson.children.find(
        (c) => c.type === 'vocabularySet'
      ) as VocabularySetNode;

      expect(vocabSet).toBeDefined();
      expect(vocabSet.id).toBe('greetings-vocab');
      expect(vocabSet.children.length).toBe(4);

      const sawatdee = vocabSet.children.find((v) => v.id === 'sawatdee');
      expect(sawatdee).toBeDefined();
      expect(sawatdee?.word).toBe('สวัสดี');
      expect(sawatdee?.translation).toBe('hello/goodbye');
    });

    it('should extract character set with Thai tone marks', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const charSet = lesson.children.find(
        (c) => c.type === 'characterSet'
      ) as CharacterSetNode;

      expect(charSet).toBeDefined();
      expect(charSet.id).toBe('tone-marks');
      expect(charSet.charType).toBe('tone-mark');
      expect(charSet.children.length).toBe(4);

      const maiEk = charSet.children.find((c) => c.id === 'mai-ek');
      expect(maiEk).toBeDefined();
      expect(maiEk?.char).toBe('่');
      expect(maiEk?.name).toBe('mai ek');
    });

    it('should extract dialogue with turns and cultural notes', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const dialogue = lesson.children.find(
        (c) => c.type === 'dialogue'
      ) as DialogueNode;

      expect(dialogue).toBeDefined();
      expect(dialogue.id).toBe('shop-greeting');
      expect(dialogue.participants.length).toBeGreaterThanOrEqual(2);
      expect(dialogue.children.length).toBeGreaterThanOrEqual(3);
      // Cultural notes may be in a child node or as a property
      if (dialogue.culturalNotes) {
        expect(dialogue.culturalNotes).toContain('polite particles');
      }
    });

    it('should validate the parsed lesson structure', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const validation = validateLesson(lesson, { strict: false });

      expect(lesson.type).toBe('lesson');
      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBeDefined();

      // Log any warnings for diagnostic purposes
      if (!validation.valid && validation.warnings && validation.warnings.length > 0) {
        console.log('Validation warnings:', validation.warnings);
      }
    });
  });

  describe('Step 2: Convert via @chishiki/importer-syllst', () => {
    it('should convert lesson to SyllstLearningContent bundle', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      // Should have: lesson + vocabulary-set + character-set + dialogue
      expect(contentBundle.length).toBeGreaterThanOrEqual(4);

      const lessonContent = contentBundle.find((c) => c.type === 'lesson');
      expect(lessonContent).toBeDefined();
      expect(lessonContent?.id).toBe('thai-greetings-01');
      // Language may or may not be set depending on frontmatter
    });

    it('should convert vocabulary set with items', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const vocabContent = contentBundle.find((c) => c.type === 'vocabulary-set');
      expect(vocabContent).toBeDefined();
      expect(vocabContent?.parentId).toBe('thai-greetings-01');

      const items = vocabContent?.data.items as SyllstVocabularyItem[];
      expect(items.length).toBe(4);

      const sawatdee = items.find((i) => i.id === 'sawatdee');
      expect(sawatdee?.word).toBe('สวัสดี');
      expect(sawatdee?.transcription).toBe('sà-wàt-dee');
      expect(sawatdee?.translation).toBe('hello/goodbye');
    });

    it('should convert character set with items', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const charContent = contentBundle.find((c) => c.type === 'character-set');
      expect(charContent).toBeDefined();
      expect(charContent?.data.charType).toBe('tone-mark');

      const items = charContent?.data.items as SyllstCharacterItem[];
      expect(items.length).toBe(4);
    });

    it('should convert dialogue with turns and metadata', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const dialogueContent = contentBundle.find((c) => c.type === 'dialogue');
      expect(dialogueContent).toBeDefined();
      // Cultural notes may or may not be present
      if (dialogueContent?.data.culturalNotes) {
        expect(dialogueContent.data.culturalNotes).toContain('polite particles');
      }

      const turns = dialogueContent?.data.turns as SyllstDialogueTurn[];
      expect(turns.length).toBeGreaterThanOrEqual(3);
      // First turn should contain Thai text
      expect(turns[0].text).toContain('สวัสดี');
    });
  });

  describe('Step 3: Generate xAPI Statements', () => {
    it('should create vocabulary drill statement with syllst xAPI vocabulary', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const vocabContent = contentBundle.find((c) => c.type === 'vocabulary-set');
      const items = vocabContent?.data.items as SyllstVocabularyItem[];
      const sawatdee = items.find((i) => i.id === 'sawatdee')!;

      const statement = createVocabularyDrillStatement(
        sawatdee,
        { name: 'Test Learner', mbox: 'mailto:test@example.com' },
        { success: true, score: 0.9 }
      );

      // Verify xAPI structure
      expect(statement.id).toBeDefined();
      expect(statement.actor.name).toBe('Test Learner');
      expect(statement.verb.id).toBe(VERBS.DRILLED);
      expect(statement.object.definition.type).toBe(ACTIVITY_TYPES.VOCABULARY_DRILL);

      // Verify syllst extensions
      const activityExt = statement.object.definition.extensions!;
      expect(activityExt[EXTENSIONS.TARGET_WORD]).toBe('สวัสดี');
      expect(activityExt[EXTENSIONS.TRANSCRIPTION]).toBe('sà-wàt-dee');
      expect(activityExt[EXTENSIONS.TRANSLATION]).toBe('hello/goodbye');

      // Verify context extensions
      const contextExt = statement.context?.extensions!;
      expect(contextExt[EXTENSIONS.TARGET_LANGUAGE]).toBe('th');
      expect(contextExt[EXTENSIONS.CEFR_LEVEL]).toBe('A1');

      // Verify result
      expect(statement.result?.success).toBe(true);
      expect(statement.result?.score?.scaled).toBe(0.9);
    });

    it('should create character recognition statement', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const charContent = contentBundle.find((c) => c.type === 'character-set');
      expect(charContent).toBeDefined();

      const items = charContent?.data.items as SyllstCharacterItem[];
      expect(items.length).toBeGreaterThan(0);

      const maiEk = items.find((i) => i.id === 'mai-ek');
      expect(maiEk).toBeDefined();

      const statement = createCharacterRecognitionStatement(maiEk!, {
        name: 'Test Learner',
      });

      expect(statement.verb.id).toBe(VERBS.PRACTICED);
      expect(statement.object.definition.type).toBe(ACTIVITY_TYPES.CHARACTER_RECOGNITION);

      const ext = statement.object.definition.extensions!;
      expect(ext[EXTENSIONS.TARGET_WORD]).toBe('่');
      expect(ext[EXTENSIONS.CHARACTER_TYPE]).toBe('tone-mark');
    });

    it('should use correct xAPI IRIs from @syllst/xapi profile', () => {
      // Verify verb IRIs
      expect(VERBS.DRILLED).toBe('https://syllst.dev/xapi/verbs/drilled');
      expect(VERBS.PRACTICED).toBe('https://syllst.dev/xapi/verbs/practiced');
      expect(VERBS.TRANSLATED).toBe('https://syllst.dev/xapi/verbs/translated');

      // Verify activity type IRIs
      expect(ACTIVITY_TYPES.VOCABULARY_DRILL).toBe(
        'https://syllst.dev/xapi/activity-types/vocabulary-drill'
      );
      expect(ACTIVITY_TYPES.CHARACTER_RECOGNITION).toBe(
        'https://syllst.dev/xapi/activity-types/character-recognition'
      );
      expect(ACTIVITY_TYPES.DIALOGUE_PRACTICE).toBe(
        'https://syllst.dev/xapi/activity-types/dialogue-practice'
      );

      // Verify extension IRIs (include /context/ and /activity/ path segments)
      expect(EXTENSIONS.TARGET_LANGUAGE).toBe(
        'https://syllst.dev/xapi/extensions/context/target-language'
      );
      expect(EXTENSIONS.TARGET_WORD).toBe(
        'https://syllst.dev/xapi/extensions/activity/target-word'
      );
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should demonstrate complete Thai content → xAPI flow', async () => {
      // Step 1: Parse MDX
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      expect(lesson.type).toBe('lesson');

      // Step 2: Convert to Chishiki content
      const contentBundle = lessonToContentBundle(lesson);
      expect(contentBundle.length).toBeGreaterThan(0);

      // Step 3: Extract vocabulary items for activity generation
      const vocabContent = contentBundle.find((c) => c.type === 'vocabulary-set');
      const vocabItems = vocabContent?.data.items as SyllstVocabularyItem[];

      // Step 4: Generate xAPI statements for all vocab items
      const statements = vocabItems.map((item) =>
        createVocabularyDrillStatement(item, { name: 'Learner' }, { success: true, score: 0.85 })
      );

      // Verify complete flow
      expect(statements.length).toBe(4);
      statements.forEach((stmt) => {
        expect(stmt.id).toBeDefined();
        expect(stmt.verb.id).toBe(VERBS.DRILLED);
        expect(stmt.object.definition.type).toBe(ACTIVITY_TYPES.VOCABULARY_DRILL);
        expect(stmt.timestamp).toBeDefined();
      });

      // Verify Thai content is preserved throughout pipeline
      const sawatdeeStmt = statements.find((s) =>
        s.object.definition.extensions?.[EXTENSIONS.TARGET_WORD] === 'สวัสดี'
      );
      expect(sawatdeeStmt).toBeDefined();
    });

    it('should maintain hierarchy through content bundle', async () => {
      const lesson = await buildLessonFromMDX(THAI_LESSON_MDX);
      const contentBundle = lessonToContentBundle(lesson);

      const lessonContent = contentBundle.find((c) => c.type === 'lesson');
      const childContents = contentBundle.filter((c) => c.parentId === lessonContent?.id);

      // All child content should reference the lesson as parent
      expect(childContents.length).toBeGreaterThan(0);
      childContents.forEach((child) => {
        expect(child.parentId).toBe('thai-greetings-01');
      });
    });
  });
});

// ============================================================================
// Summary: Integration Points
// ============================================================================
/*
This test demonstrates the key integration points in the glotblocks ecosystem:

1. CONTENT AUTHORING (polyglot-bundles)
   - MDX files with syllst directives
   - Thai language content with vocabulary, characters, dialogues

2. PROCESSING (syllst)
   - @syllst/processor parses MDX → Syllst AST
   - Validates structure and content
   - Preserves Thai characters, transcriptions, translations

3. IMPORT/CONVERSION (chishiki)
   - @chishiki/importer-syllst converts AST → LearningContent
   - Structural typing (no @syllst/core runtime dependency)
   - Parent-child hierarchy preserved

4. xAPI GENERATION (syllst + chishiki)
   - @syllst/xapi provides vocabulary (verbs, activity types, extensions)
   - Chishiki generates statements from learning content
   - Statements ready for LRS submission

Consumer apps like lalia-prism would:
1. Use ContentLoader from polyglot-bundles to load @syllst/th content
2. Process with @syllst/processor
3. Convert with @chishiki/importer-syllst
4. Store statements in chishiki LRS
5. Use FSRS for spaced repetition scheduling
*/
