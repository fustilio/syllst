import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { remarkSyllabusDirectives } from './remark-syllabus-directives';
import { visit } from 'unist-util-visit';

describe('Remark Syllabus Directives Plugin', () => {
  const createParser = () =>
    unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkSyllabusDirectives);

  it('should transform grammar-rule directive', async () => {
    const content = `
:::grammar-rule{id="rule-001" title="Basic Pattern"}
The pattern **यह (X) है** means "This is (X)".
:::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundGrammarRule = false;
    visit(tree, (node: any) => {
      if (node.type === 'grammarRule') {
        foundGrammarRule = true;
        expect(node.id).toBe('rule-001');
        expect(node.title).toBe('Basic Pattern');
        expect(node.explanation).toContain('यह (X) है');
      }
    });

    expect(foundGrammarRule).toBe(true);
  });

  it('should transform vocabulary-set with vocab items', async () => {
    const content = `
:::vocabulary-set{id="vocab-set-1" title="Basic Words"}

::vocab{id="vocab-yah" word="यह" translation="this" partOfSpeech="pronoun"}
::

::vocab{id="vocab-hai" word="है" translation="is" partOfSpeech="verb"}
::

:::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundVocabSet = false;
    let vocabCount = 0;

    visit(tree, (node: any) => {
      if (node.type === 'vocabularySet') {
        foundVocabSet = true;
        expect(node.id).toBe('vocab-set-1');
        expect(node.title).toBe('Basic Words');
        expect(node.children).toBeDefined();
        vocabCount = node.children.filter((child: any) => child.type === 'vocabularyItem').length;
      }
    });

    expect(foundVocabSet).toBe(true);
    expect(vocabCount).toBe(2);
  });

  it('should transform vocab item with all attributes', async () => {
    const content = `
::vocab{id="vocab-test" word="देश" transcription="desh" translation="country" partOfSpeech="noun" notes="Common word" category="geography"}
::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundVocab = false;
    visit(tree, (node: any) => {
      if (node.type === 'vocabularyItem') {
        foundVocab = true;
        expect(node.id).toBe('vocab-test');
        expect(node.word).toBe('देश');
        expect(node.transcription).toBe('desh');
        expect(node.translation).toBe('country');
        expect(node.partOfSpeech).toBe('noun');
        expect(node.notes).toBe('Common word');
        expect(node.category).toBe('geography');
        expect(node.value).toBe('देश'); // Literal compatibility
      }
    });

    expect(foundVocab).toBe(true);
  });

  it('should transform example directive', async () => {
    const content = `
::example{id="ex-001" text="यह चीन है ।" translation="This is China." illustrates="rule-basic-pattern"}
::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundExample = false;
    visit(tree, (node: any) => {
      if (node.type === 'example') {
        foundExample = true;
        expect(node.id).toBe('ex-001');
        expect(node.text).toBe('यह चीन है ।');
        expect(node.translation).toBe('This is China.');
        expect(node.illustrates).toContain('rule-basic-pattern');
        expect(node.value).toBe('यह चीन है ।');
      }
    });

    expect(foundExample).toBe(true);
  });

  it('should transform example-set with examples', async () => {
    const content = `
:::example-set{id="examples-1" title="Common Expressions"}

::example{id="ex-1" text="मालूम नहीं ।" translation="I don't know."}
::

::example{id="ex-2" text="याद नहीं ।" translation="I don't remember."}
::

:::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundExampleSet = false;
    let exampleCount = 0;

    visit(tree, (node: any) => {
      if (node.type === 'exampleSet') {
        foundExampleSet = true;
        expect(node.id).toBe('examples-1');
        expect(node.title).toBe('Common Expressions');
        exampleCount = node.children.filter((child: any) => child.type === 'example').length;
      }
    });

    expect(foundExampleSet).toBe(true);
    expect(exampleCount).toBe(2);
  });

  it('should transform exercise directive', async () => {
    const content = `
:::exercise{id="ex-fill-1" type="fill-in-blank" difficulty="beginner"}
**Question:** यह _____ है। (This is China)

**Answer:** चीन

**Explanation:** चीन means China in Hindi.
:::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundExercise = false;
    visit(tree, (node: any) => {
      if (node.type === 'exercise') {
        foundExercise = true;
        expect(node.id).toBe('ex-fill-1');
        expect(node.exerciseType).toBe('fill-in-blank');
        expect(node.difficulty).toBe('beginner');
        expect(node.question).toContain('यह _____ है');
        expect(node.answer).toContain('चीन');
        expect(node.explanation).toContain('चीन means China');
      }
    });

    expect(foundExercise).toBe(true);
  });

  it('should handle nested grammar rule with examples', async () => {
    const content = `
:::grammar-rule{id="rule-pattern" title="Basic Pattern"}

The pattern **यह (X) है** means "This is (X)".

:::example{id="ex-1" text="यह चीन है ।" translation="This is China."}
:::

:::example{id="ex-2" text="यह रूस है ।" translation="This is Russia."}
:::

:::
`;

    const parser = createParser();
    const tree = await parser.run(parser.parse(content));

    let foundGrammarRule = false;
    let exampleCount = 0;

    visit(tree, (node: any) => {
      if (node.type === 'grammarRule') {
        foundGrammarRule = true;
        expect(node.id).toBe('rule-pattern');
        expect(node.title).toBe('Basic Pattern');
        expect(node.children).toBeDefined();
        exampleCount = node.children.filter((child: any) => child.type === 'example').length;
      }
    });

    expect(foundGrammarRule).toBe(true);
    expect(exampleCount).toBeGreaterThan(0);
  });

  describe('Dialogue Directives', () => {
    it('should transform dialogue with turns', async () => {
      const content = `
:::dialogue{id="dialog-1" context="greeting" lang="hi-IN"}

::turn{speaker="A"}
यह क्या है ?
# en-US: What's this?
::

::turn{speaker="B"}
यह नेपाल है ।
# en-US: This is Nepal.
::

:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundDialogue = false;
      let turnCount = 0;

      visit(tree, (node: any) => {
        if (node.type === 'dialogue') {
          foundDialogue = true;
          expect(node.id).toBe('dialog-1');
          expect(node.context).toBe('greeting');
          expect(node.lang).toBe('hi-IN');
          expect(node.children).toBeDefined();
          turnCount = node.children.filter((child: any) => child.type === 'dialogueTurn').length;
        }
      });

      expect(foundDialogue).toBe(true);
      expect(turnCount).toBe(2);
    });

    it('should extract translation from turn comment', async () => {
      const content = `
::turn{speaker="me"}
สวัสดีครับ
# en-US: Hello
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundTurn = false;
      visit(tree, (node: any) => {
        if (node.type === 'dialogueTurn') {
          foundTurn = true;
          expect(node.speakerId).toBe('me');
          expect(node.text).toBe('สวัสดีครับ');
          expect(node.translation).toBe('Hello');
        }
      });

      expect(foundTurn).toBe(true);
    });

    it('should parse gender variants in turn text', async () => {
      const content = `
::turn{speaker="me" gender="masculine"}
สวัสดี{ครับ|ค่ะ}
# en-US: Hello
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundTurn = false;
      visit(tree, (node: any) => {
        if (node.type === 'dialogueTurn') {
          foundTurn = true;
          expect(node.text).toBe('สวัสดี{ครับ|ค่ะ}');
          expect(node.genderVariants).toBeDefined();
          expect(node.genderVariants.masculine).toBe('สวัสดีครับ');
          expect(node.genderVariants.feminine).toBe('สวัสดีค่ะ');
        }
      });

      expect(foundTurn).toBe(true);
    });

    it('should transform cultural-note within dialogue', async () => {
      const content = `
:::dialogue{id="dialog-2" context="greeting" lang="th-TH"}

::turn{speaker="A"}
สวัสดีครับ
# en-US: Hello
::

::cultural-note
ครับ is used by male speakers, ค่ะ by female speakers.
::

:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundDialogue = false;
      let hasCulturalNotes = false;

      visit(tree, (node: any) => {
        if (node.type === 'dialogue') {
          foundDialogue = true;
          hasCulturalNotes = !!node.culturalNotes;
          if (hasCulturalNotes) {
            expect(node.culturalNotes).toContain('ครับ is used by male speakers');
          }
        }
      });

      expect(foundDialogue).toBe(true);
      expect(hasCulturalNotes).toBe(true);
    });

    it('should handle dialogue with named speaker', async () => {
      const content = `
::turn{speaker="shopkeeper" name="Somchai" gender="masculine"}
ยินดีต้อนรับครับ
# en-US: Welcome!
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundTurn = false;
      visit(tree, (node: any) => {
        if (node.type === 'dialogueTurn') {
          foundTurn = true;
          expect(node.speakerId).toBe('shopkeeper');
          expect(node.text).toBe('ยินดีต้อนรับครับ');
          expect(node.translation).toBe('Welcome!');
        }
      });

      expect(foundTurn).toBe(true);
    });
  });

  describe('Phonological Rule Directives', () => {
    it('should transform phonological-rule with rule-conditions', async () => {
      const content = `
:::phonological-rule{id="tone-mid" title="Middle-Class Tone Rules" ruleType="tone"}
Middle-class consonants produce all 5 tones.

::rule-condition{condition='{"consonantClass":"middle","toneMark":"none"}' result="mid" example="กา" exampleTranscription="gaa" exampleTranslation="crow"}
::

::rule-condition{condition='{"consonantClass":"middle","toneMark":"mai-ek"}' result="low" example="ไก่" exampleTranscription="gài" exampleTranslation="chicken"}
::

:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundRule = false;
      let conditionCount = 0;

      visit(tree, (node: any) => {
        if (node.type === 'phonologicalRule') {
          foundRule = true;
          expect(node.id).toBe('tone-mid');
          expect(node.title).toBe('Middle-Class Tone Rules');
          expect(node.ruleType).toBe('tone');
          expect(node.description).toContain('Middle-class');
          expect(node.children).toBeDefined();
          conditionCount = node.children.filter(
            (c: any) => c.type === 'ruleCondition'
          ).length;
        }
      });

      expect(foundRule).toBe(true);
      expect(conditionCount).toBe(2);
    });

    it('should transform standalone rule-condition', async () => {
      const content = `
::rule-condition{condition='{"consonantClass":"middle","toneMark":"mai-ek"}' result="low" example="ไก่" exampleTranscription="gài" exampleTranslation="chicken"}
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundCondition = false;
      visit(tree, (node: any) => {
        if (node.type === 'ruleCondition') {
          foundCondition = true;
          expect(node.result).toBe('low');
          expect(node.condition).toEqual({
            consonantClass: 'middle',
            toneMark: 'mai-ek',
          });
          expect(node.example).toBe('ไก่');
          expect(node.exampleTranscription).toBe('gài');
          expect(node.exampleTranslation).toBe('chicken');
          expect(node.value).toContain('→ low');
        }
      });

      expect(foundCondition).toBe(true);
    });

    it('should transform phonological-rule with relatedRules', async () => {
      const content = `
:::phonological-rule{id="tone-high" title="High-Class Tone Rules" ruleType="tone" relatedRules="tone-mid,tone-low"}
High-class consonants produce only 3 tones.
:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundRule = false;
      visit(tree, (node: any) => {
        if (node.type === 'phonologicalRule') {
          foundRule = true;
          expect(node.relatedRules).toEqual(['tone-mid', 'tone-low']);
        }
      });

      expect(foundRule).toBe(true);
    });
  });

  describe('Syllable Pattern Directives', () => {
    it('should transform syllable-pattern with pattern-examples', async () => {
      const content = `
:::syllable-pattern{id="live-syllables" title="Live Syllables" patternType="live" structure="CV"}
Live syllables end in a long vowel or a sonorant consonant.

::pattern-example{text="กา" transcription="gaa" translation="crow"}
::

::pattern-example{text="มา" transcription="maa" translation="come"}
::

:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundPattern = false;
      let exampleCount = 0;

      visit(tree, (node: any) => {
        if (node.type === 'syllablePattern') {
          foundPattern = true;
          expect(node.id).toBe('live-syllables');
          expect(node.title).toBe('Live Syllables');
          expect(node.patternType).toBe('live');
          expect(node.structure).toBe('CV');
          expect(node.description).toContain('Live syllables');
          expect(node.children).toBeDefined();
          exampleCount = node.children.filter(
            (c: any) => c.type === 'patternExample'
          ).length;
        }
      });

      expect(foundPattern).toBe(true);
      expect(exampleCount).toBe(2);
    });

    it('should transform standalone pattern-example with data attributes', async () => {
      const content = `
::pattern-example{text="กา" transcription="gaa" translation="crow" data:consonantClass="middle" data:tone="mid"}
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundExample = false;
      visit(tree, (node: any) => {
        if (node.type === 'patternExample') {
          foundExample = true;
          expect(node.text).toBe('กา');
          expect(node.translation).toBe('crow');
          expect(node.value).toBe('กา');
          expect(node.data?.consonantClass).toBe('middle');
          expect(node.data?.tone).toBe('mid');
        }
      });

      expect(foundExample).toBe(true);
    });
  });

  describe('Exercise with Skill Tracking', () => {
    it('should transform exercise with skill, tests, and objectiveId', async () => {
      const content = `
:::exercise{id="ex-tone-1" type="matching" difficulty="beginner" skill="tone-rule-application" tests="consonant-class-id,tone-prediction" objectiveId="obj-tone-rules"}
**Question:** Match the consonant class to the correct tone

**Answer:** middle class + no mark = mid tone
:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundExercise = false;
      visit(tree, (node: any) => {
        if (node.type === 'exercise') {
          foundExercise = true;
          expect(node.id).toBe('ex-tone-1');
          expect(node.skill).toBe('tone-rule-application');
          expect(node.tests).toEqual(['consonant-class-id', 'tone-prediction']);
          expect(node.objectiveId).toBe('obj-tone-rules');
        }
      });

      expect(foundExercise).toBe(true);
    });
  });

  describe('Character with canonicalRef', () => {
    it('should transform character item with canonicalRef', async () => {
      const content = `
::character{id="th-chicken" char="ก" name="gor gai" nativeName="ก ไก่" charType="consonant" canonicalRef="chicken"}
::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundChar = false;
      visit(tree, (node: any) => {
        if (node.type === 'characterItem') {
          foundChar = true;
          expect(node.id).toBe('th-chicken');
          expect(node.char).toBe('ก');
          expect(node.canonicalRef).toBe('chicken');
        }
      });

      expect(foundChar).toBe(true);
    });
  });

  describe('Writing Pattern Directives', () => {
    it('should transform writing-pattern with examples', async () => {
      const content = `
:::writing-pattern{id="vowel-positioning" title="Vowel Positioning Rules" patternType="positioning"}
Thai vowels can appear above, below, before, or after their consonant.

::example{id="wp-ex-1" text="เ-" translation="Short e vowel — written before consonant"}
::

::example{id="wp-ex-2" text="-ิ" translation="Short i vowel — written above consonant"}
::

:::
`;

      const parser = createParser();
      const tree = await parser.run(parser.parse(content));

      let foundWritingPattern = false;
      let exampleCount = 0;

      visit(tree, (node: any) => {
        if (node.type === 'writingPattern') {
          foundWritingPattern = true;
          expect(node.id).toBe('vowel-positioning');
          expect(node.title).toBe('Vowel Positioning Rules');
          expect(node.patternType).toBe('positioning');
          expect(node.description).toContain('Thai vowels');
          expect(node.children).toBeDefined();
          exampleCount = node.children.filter(
            (c: any) => c.type === 'example'
          ).length;
        }
      });

      expect(foundWritingPattern).toBe(true);
      expect(exampleCount).toBe(2);
    });
  });
});
