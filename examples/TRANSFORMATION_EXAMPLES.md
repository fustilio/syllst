# Syllabus Syntax Transformation Examples

This document shows real examples of how MDX content is transformed into Unist nodes.

## Overview

All transformations follow this pipeline:
```
MDX String → MDAST (remark) → Syllabus Unist Tree → Validated Nodes
```

## Grammar Rules

### Input MDX

```mdx
:::grammar-rule{id="grammar-yah-x-hai" title="Basic Sentence Pattern: यह (X) है"}

The fundamental Hindi sentence pattern **यह (X) है** means "This is (X)".

### Key Points

- **यह** (yah) = "this" (demonstrative pronoun)
- **है** (hai) = "is" (present tense verb, 3rd person)

### Examples

:::example{id="ex-001" text="यह चीन है ।" translation="This is China." illustrates="grammar-yah-x-hai"}
Basic pattern with country name.
:::

:::example{id="ex-002" text="यह रूस है ।" translation="This is Russia." illustrates="grammar-yah-x-hai"}
Another example of the pattern.
:::

:::
```

### Output Unist Node

```javascript
{
  type: 'grammarRule',
  id: 'grammar-yah-x-hai',
  title: 'Basic Sentence Pattern: यह (X) है',
  explanation: 'The fundamental Hindi sentence pattern यह (X) है means "This is (X)".',
  children: [
    {
      type: 'example',
      id: 'ex-001',
      text: 'यह चीन है ।',
      translation: 'This is China.',
      illustrates: ['grammar-yah-x-hai'],
      value: 'यह चीन है ।'
    },
    {
      type: 'example',
      id: 'ex-002',
      text: 'यह रूस है ।',
      translation: 'This is Russia.',
      illustrates: ['grammar-yah-x-hai'],
      value: 'यह रूस है ।'
    }
  ]
}
```

**Key Transformations:**
- Container directive `:::grammar-rule` → `type: 'grammarRule'`
- Attributes `{id="..." title="..."}` → top-level properties
- First paragraph → `explanation` field (with bold markdown removed)
- Nested `:::example` directives → `children` array
- `illustrates` attribute string → array of rule IDs

## Vocabulary Sets

### Input MDX

```mdx
:::vocabulary-set{id="vocab-set-basic-words" title="Basic Words and Expressions"}

::vocab{id="vocab-yah" word="यह" translation="this" partOfSpeech="pronoun"}
Demonstrative pronoun - "this".
::

::vocab{id="vocab-hai" word="है" translation="is" partOfSpeech="verb"}
Present tense verb - "is" (3rd person).
::

::vocab{id="vocab-kya" word="क्या" translation="what" partOfSpeech="pronoun"}
Question word - "what".
::

:::
```

### Output Unist Node

```javascript
{
  type: 'vocabularySet',
  id: 'vocab-set-basic-words',
  title: 'Basic Words and Expressions',
  children: [
    {
      type: 'vocabularyItem',
      id: 'vocab-yah',
      word: 'यह',
      translation: 'this',
      partOfSpeech: 'pronoun',
      value: 'यह'
    },
    {
      type: 'vocabularyItem',
      id: 'vocab-hai',
      word: 'है',
      translation: 'is',
      partOfSpeech: 'verb',
      value: 'है'
    },
    {
      type: 'vocabularyItem',
      id: 'vocab-kya',
      word: 'क्या',
      translation: 'what',
      partOfSpeech: 'pronoun',
      value: 'क्या'
    }
  ]
}
```

**Key Transformations:**
- Container directive `:::vocabulary-set` → `type: 'vocabularySet'`
- Leaf directives `::vocab` → `type: 'vocabularyItem'`
- All attributes become properties
- `word` value is duplicated to `value` for Literal compatibility

## Exercises

### Example 1: Question/Answer Format

#### Input MDX

```mdx
:::exercise{id="ex-fill-1" type="fill-in-blank" difficulty="beginner"}
**Question:** यह _____ है। (This is China)

**Answer:** चीन

**Explanation:** चीन means China in Hindi.
:::
```

#### Output Node

```javascript
{
  type: 'exercise',
  id: 'ex-fill-1',
  exerciseType: 'fill-in-blank',
  difficulty: 'beginner',
  question: 'यह _____ है। (This is China)',
  answer: 'चीन',
  explanation: 'चीन means China in Hindi.'
}
```

### Example 2: Instructions/Answers Format

#### Input MDX

```mdx
:::exercise{id="exercise-01" title="Identify Countries" type="fill-in-blank" difficulty="beginner"}

**Instructions**: Complete the sentences using the pattern **यह (X) है ।**

1. यह _____ है । (China)
2. यह _____ है । (Russia)
3. यह _____ है । (India)

**Answers**:
1. चीन
2. रूस
3. भारत

:::
```

#### Output Node

```javascript
{
  type: 'exercise',
  id: 'exercise-01',
  title: 'Identify Countries',
  exerciseType: 'fill-in-blank',
  difficulty: 'beginner',
  question: 'Complete the sentences using the pattern यह (X) है .\n1. यह _____ है । (China)\n2. यह _____ है । (Russia)\n3. यह _____ है । (India)',
  answer: '1. चीन\n2. रूस\n3. भारत'
}
```

### Example 3: Dialogue Format (No Answer)

#### Input MDX

```mdx
:::exercise{id="ex-practice" type="dialogue" difficulty="beginner"}

**Example:**
- A: यह क्या है ?
- B: यह _____ है । (choose a country)
- A: और यह ?
- B: _____ है । (choose another country)

:::
```

#### Output Node

```javascript
{
  type: 'exercise',
  id: 'ex-practice',
  exerciseType: 'dialogue',
  difficulty: 'beginner',
  question: '- A: यह क्या है ?\n- B: यह _____ है । (choose a country)\n- A: और यह ?\n- B: _____ है । (choose another country)',
  answer: '' // Empty - dialogue exercises don't require answers
}
```

**Exercise Content Extraction Rules:**

The transformer recognizes these section headers (case-sensitive, with colon):

| Markdown Header | Maps To | Used For |
|----------------|---------|----------|
| `**Question:**` | `question` | Single-part exercises |
| `**Instructions:**` | `question` | Multi-part exercises |
| `**Example:**` | `question` | Dialogue/practice exercises |
| `**Answer:**` | `answer` | Single answer |
| `**Answers:**` | `answer` | Multiple answers (plural) |
| `**Explanation:**` | `explanation` | Answer explanation |

**Multi-paragraph Handling:**
- Content continues to be appended to the current section until a new header is found
- Numbered lists are preserved within sections
- Line breaks between paragraphs are maintained

## Standalone Examples

### Input MDX

```mdx
:::example{id="conversation-01" text="यह क्या है ?" translation="What's this?" illustrates="grammar-yah-x-hai"}
Question to start the conversation.
:::
```

### Output Node

```javascript
{
  type: 'example',
  id: 'conversation-01',
  text: 'यह क्या है ?',
  translation: 'What\'s this?',
  illustrates: ['grammar-yah-x-hai'],
  value: 'यह क्या है ?'
}
```

## Complete Lesson Transformation

### Input: Full Lesson MDX

```mdx
---
type: lesson
id: unit-01-basic-pattern
title: "पाठ एक — यह (X) है"
description: "Basic sentence pattern: This is (X)"
order: 1
difficulty: beginner
cefrLevel: A1
categories:
  - sentence-patterns
---

# पाठ एक (Unit 1)

## Grammar

:::grammar-rule{id="rule-001" title="Basic Pattern"}
The pattern **यह (X) है** means "This is (X)".
:::

## Vocabulary

:::vocabulary-set{id="vocab-001"}
::vocab{id="v1" word="यह" translation="this"}
::
::vocab{id="v2" word="है" translation="is"}
::
:::
```

### Output: Complete LessonNode

```javascript
{
  type: 'lesson',
  id: 'unit-01-basic-pattern',
  title: 'पाठ एक — यह (X) है',
  description: 'Basic sentence pattern: This is (X)',
  order: 1,
  difficulty: 'beginner',
  cefrLevel: 'A1',
  categories: ['sentence-patterns'],
  children: [
    {
      type: 'grammarRule',
      id: 'rule-001',
      title: 'Basic Pattern',
      explanation: 'The pattern यह (X) है means "This is (X)".',
      children: []
    },
    {
      type: 'vocabularySet',
      id: 'vocab-001',
      children: [
        {
          type: 'vocabularyItem',
          id: 'v1',
          word: 'यह',
          translation: 'this',
          value: 'यह'
        },
        {
          type: 'vocabularyItem',
          id: 'v2',
          word: 'है',
          translation: 'is',
          value: 'है'
        }
      ]
    }
  ]
}
```

## Phonological Rules

### Input MDX

```mdx
:::phonological-rule{id="tone-mid" title="Middle-Class Tone Rules" ruleType="tone"}
Middle-class consonants produce all 5 tones with tone marks.

::rule-condition{condition='{"consonantClass":"middle","toneMark":"none"}' result="mid" example="กา" exampleTranscription="gaa" exampleTranslation="crow"}
::

::rule-condition{condition='{"consonantClass":"middle","toneMark":"mai-ek"}' result="low" example="ไก่" exampleTranscription="gài" exampleTranslation="chicken"}
::

:::
```

### Output Unist Node

```javascript
{
  type: 'phonologicalRule',
  id: 'tone-mid',
  title: 'Middle-Class Tone Rules',
  ruleType: 'tone',
  description: 'Middle-class consonants produce all 5 tones with tone marks.',
  children: [
    {
      type: 'ruleCondition',
      condition: { consonantClass: 'middle', toneMark: 'none' },
      result: 'mid',
      example: 'กา',
      exampleTranscription: 'gaa',
      exampleTranslation: 'crow',
      value: 'consonantClass=middle, toneMark=none → mid'
    },
    {
      type: 'ruleCondition',
      condition: { consonantClass: 'middle', toneMark: 'mai-ek' },
      result: 'low',
      example: 'ไก่',
      exampleTranscription: 'gài',
      exampleTranslation: 'chicken',
      value: 'consonantClass=middle, toneMark=mai-ek → low'
    }
  ]
}
```

**Key Transformations:**
- Container directive `:::phonological-rule` → `type: 'phonologicalRule'`
- `ruleType` attribute maps to `PhonologicalRuleType` (tone, sound-change, assimilation, etc.)
- First paragraph → `description` field
- Nested `::rule-condition` directives → `children` array
- `condition` attribute is JSON-parsed into a `Record<string, string>`
- `relatedRules` attribute (comma-separated) → string array

## Syllable Patterns

### Input MDX

```mdx
:::syllable-pattern{id="live-syllables" title="Live Syllables" patternType="live" structure="CV"}
Live syllables end in a long vowel or a sonorant consonant.

::pattern-example{text="กา" transcription="gaa" translation="crow"}
::

::pattern-example{text="มา" transcription="maa" translation="come"}
::

:::
```

### Output Unist Node

```javascript
{
  type: 'syllablePattern',
  id: 'live-syllables',
  title: 'Live Syllables',
  patternType: 'live',
  structure: 'CV',
  description: 'Live syllables end in a long vowel or a sonorant consonant.',
  children: [
    {
      type: 'patternExample',
      text: 'กา',
      transcription: 'gaa',
      translation: 'crow',
      value: 'กา'
    },
    {
      type: 'patternExample',
      text: 'มา',
      transcription: 'maa',
      translation: 'come',
      value: 'มา'
    }
  ]
}
```

**Key Transformations:**
- Container directive `:::syllable-pattern` → `type: 'syllablePattern'`
- `patternType` and `structure` map to optional string fields
- Nested `::pattern-example` → `type: 'patternExample'`
- `text` is duplicated to `value` for Literal compatibility
- `data:*` attributes become `data` object properties

## Writing Patterns

### Input MDX

```mdx
:::writing-pattern{id="vowel-positioning" title="Vowel Positioning Rules" patternType="positioning"}
Thai vowels can appear above, below, before, or after their consonant.

::example{id="wp-ex-1" text="เ-" translation="Short e vowel — written before consonant"}
::

::example{id="wp-ex-2" text="-ิ" translation="Short i vowel — written above consonant"}
::

:::
```

### Output Unist Node

```javascript
{
  type: 'writingPattern',
  id: 'vowel-positioning',
  title: 'Vowel Positioning Rules',
  patternType: 'positioning',
  description: 'Thai vowels can appear above, below, before, or after their consonant.',
  children: [
    {
      type: 'example',
      id: 'wp-ex-1',
      text: 'เ-',
      translation: 'Short e vowel — written before consonant',
      value: 'เ-'
    },
    {
      type: 'example',
      id: 'wp-ex-2',
      text: '-ิ',
      translation: 'Short i vowel — written above consonant',
      value: '-ิ'
    }
  ]
}
```

**Key Transformations:**
- Container directive `:::writing-pattern` → `type: 'writingPattern'`
- `patternType` is required (positioning, stroke-order, ligature, combination, etc.)
- Children can be `ExampleNode` or `ContentNode`
- First paragraph → `description` field

## Text Extraction Details

### How Bold Text is Handled

Markdown bold (`**text**`) is parsed as a `strong` node in MDAST:

```javascript
// MDAST structure
{
  type: 'paragraph',
  children: [
    { type: 'strong', children: [{ type: 'text', value: 'Question:' }] },
    { type: 'text', value: ' What is this?' }
  ]
}
```

The `extractTextContent()` function recursively extracts all text:

```javascript
function extractTextContent(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(extractTextContent).join('');
  return '';
}

// Result: "Question: What is this?"
```

### Devanagari Preservation

All Devanagari text is preserved exactly as written:
- ✅ Input: `यह चीन है ।`
- ✅ Output: `यह चीन है ।`
- No transliteration or conversion happens during transformation

## Validation

After transformation, lessons are validated:

```javascript
import { validateLesson } from '@syllst/core';

const validation = validateLesson(lesson);

// Returns:
{
  valid: true,
  errors: []
}

// Or with errors:
{
  valid: false,
  errors: [
    'Exercise at index 2 must have an answer',
    'Grammar rule at index 0 must have a title'
  ]
}
```

**Validation Rules:**
- ✅ Lesson must have `id`, `title`, and `order`
- ✅ All child nodes must have valid `type`
- ✅ Grammar rules must have `id` and `title`
- ✅ Vocabulary sets must have `id`
- ✅ Exercises must have `id` and `question`
- ✅ Exercises of type `fill-in-blank`, `translation`, `transformation`, `multiple-choice` must have `answer`
- ⚠️ Exercises of type `dialogue`, `open-ended`, `discussion` don't require `answer`

## Testing

All transformations are validated with tests:

```bash
pnpm test
```

**Test Coverage:**
- ✅ 197 tests passing in `@syllst/core`
- ✅ 37 tests passing in `@syllst/processor`
- ✅ Complete validation testing for all node types
- ✅ Real-world lesson file examples
