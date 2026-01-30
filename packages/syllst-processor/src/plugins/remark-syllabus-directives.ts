/**
 * Remark Plugin: Syllabus Directives
 *
 * Transforms MDX directives (:::grammar-rule, ::vocab, etc.) into Syllabus Unist nodes
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root as MdastRoot } from 'mdast';
import type {
  GrammarRuleNode,
  VocabularySetNode,
  VocabularyItemNode,
  CharacterSetNode,
  CharacterItemNode,
  CharacterType,
  PhoneticCategory,
  ExampleSetNode,
  ExampleNode,
  ExerciseNode,
  DialogueNode,
  DialogueTurnNode,
  DialogueParticipant,
  GenderVariants,
  Transcription,
  TranscriptionObject,
  PhonologicalRuleNode,
  RuleConditionNode,
  SyllablePatternNode,
  PatternExampleNode,
  WritingPatternNode,
  PhonologicalRuleType,
} from '@syllst/core/types';

/**
 * Directive node from remark-directive
 */
interface DirectiveNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string>;
  children?: any[];
  data?: any;
}

// ============================================================================
// Attribute Parsing Helpers (v0.2.0)
// ============================================================================

/**
 * Parse transcription attribute - handles both string and JSON object formats
 *
 * @example
 * parseTranscription("khâao") // returns "khâao"
 * parseTranscription('{"primary": "khâao", "ipa": "/kʰâːw/"}') // returns { primary: "khâao", ipa: "/kʰâːw/" }
 */
function parseTranscription(value: string | undefined): Transcription | undefined {
  if (!value) return undefined;

  // Try to parse as JSON object
  if (value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed.primary) {
        return parsed as TranscriptionObject;
      }
    } catch {
      // Not valid JSON, treat as string
    }
  }

  return value;
}

/**
 * Extract data:* attributes from directive attributes
 *
 * @example
 * extractDataAttributes({ "data:tone": "falling", "data:class": "low", word: "ข้าว" })
 * // returns { tone: "falling", class: "low" }
 */
function extractDataAttributes(attributes: Record<string, string> | undefined): Record<string, unknown> | undefined {
  if (!attributes) return undefined;

  const data: Record<string, unknown> = {};
  let hasData = false;

  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('data:')) {
      const dataKey = key.slice(5); // Remove 'data:' prefix
      // Try to parse value as JSON for complex types
      try {
        data[dataKey] = JSON.parse(value);
      } catch {
        data[dataKey] = value;
      }
      hasData = true;
    }
  }

  return hasData ? data : undefined;
}

/**
 * Parse comma-separated tags
 */
function parseTags(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(',').map(t => t.trim()).filter(t => t);
}

/**
 * Transform container directive to GrammarRuleNode
 */
function transformGrammarRule(directive: DirectiveNode): Partial<GrammarRuleNode> {
  const { id = '', title = '' } = directive.attributes || {};

  // Extract explanation from first paragraph
  let explanation = '';
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'paragraph' && !explanation) {
        // First paragraph is the explanation
        explanation = extractTextContent(child);
      } else if (child.type === 'containerDirective' && child.name === 'example') {
        // Nested examples
        const exampleNode = transformExample(child);
        children.push(exampleNode);
      } else {
        // Keep other children as-is for now
        children.push(child);
      }
    }
  }

  return {
    type: 'grammarRule',
    id,
    title,
    explanation,
    children,
  };
}

/**
 * Transform container directive to VocabularySetNode
 */
function transformVocabularySet(directive: DirectiveNode): Partial<VocabularySetNode> {
  const { id = '', title, description } = directive.attributes || {};

  const children: VocabularyItemNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'leafDirective' && child.name === 'vocab') {
        const vocabNode = transformVocabularyItem(child);
        children.push(vocabNode as VocabularyItemNode);
      }
    }
  }

  return {
    type: 'vocabularySet',
    id,
    title,
    description,
    children,
  };
}

/**
 * Transform leaf directive to VocabularyItemNode
 *
 * Syntax:
 * - ::vocab{word="ข้าว" transcription="khâao" translation="rice"}
 * - ::vocab{word="ข้าว" transcription='{"primary": "khâao", "ipa": "/kʰâːw/"}' translation="rice"}
 *
 * Supports data:* attributes for language-specific extensions:
 * - ::vocab{word="ข้าว" transcription="khâao" translation="rice" data:tone="falling" data:consonantClass="low"}
 */
function transformVocabularyItem(directive: DirectiveNode): Partial<VocabularyItemNode> {
  const {
    id = `vocab-${Math.random().toString(36).substr(2, 9)}`,
    word = '',
    translation = '',
    transcription,
    definition,
    preview,
    category,
    tags,
    partOfSpeech,
    notes,
    example,
  } = directive.attributes || {};

  // Extract data:* attributes
  const dataAttrs = extractDataAttributes(directive.attributes);

  return {
    type: 'vocabularyItem',
    id,
    word,
    transcription: parseTranscription(transcription),
    translation,
    definition,
    preview,
    category,
    tags: parseTags(tags),
    partOfSpeech,
    notes,
    example,
    value: word, // For Literal compatibility
    data: dataAttrs,
  };
}

/**
 * Transform container directive to CharacterSetNode
 *
 * Usage:
 * :::character-set{id="basic-vowels" title="Basic Vowels" charType="vowel"}
 * ::character{char="ა" name="Ani" transcription="a" charType="vowel"}
 * ::
 * :::
 */
function transformCharacterSet(directive: DirectiveNode): Partial<CharacterSetNode> {
  const { id = '', title, description, charType, phoneticCategory } = directive.attributes || {};

  const children: CharacterItemNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'leafDirective' && child.name === 'character') {
        const charNode = transformCharacterItem(child);
        children.push(charNode as CharacterItemNode);
      }
    }
  }

  return {
    type: 'characterSet',
    id,
    title,
    description,
    charType: charType as CharacterType | undefined,
    phoneticCategory: phoneticCategory as PhoneticCategory | undefined,
    children,
  };
}

/**
 * Transform leaf directive to CharacterItemNode
 *
 * Syntax:
 * - ::character{char="ა" name="Ani" transcription="a" charType="vowel"}
 * - ::character{char="ა" name="Ani" transcription='{"primary": "a", "ipa": "/ɑ/"}' charType="vowel"}
 *
 * Supports data:* attributes for language-specific extensions:
 * - ::character{char="ბ" name="Bani" transcription="b" charType="consonant" data:phoneticCategory="stop" data:voicing="voiced"}
 *
 * With mnemonic:
 * ::character{char="ა" name="Ani" transcription="a" charType="vowel" mnemonic="Looks like an 'a' rotated"}
 */
function transformCharacterItem(directive: DirectiveNode): Partial<CharacterItemNode> {
  const {
    id = `char-${Math.random().toString(36).substr(2, 9)}`,
    char = '',
    name = '',
    nativeName,
    transcription,
    charType = 'consonant',
    preview,
    category,
    tags,
    mnemonic,
    exampleWords,
    notes,
    audioPath,
    canonicalRef,
  } = directive.attributes || {};

  // Extract data:* attributes
  const dataAttrs = extractDataAttributes(directive.attributes);

  // Parse example words if provided as comma-separated string
  const parsedExampleWords = exampleWords
    ? exampleWords.split(',').map(w => w.trim())
    : undefined;

  return {
    type: 'characterItem',
    id,
    char,
    name,
    nativeName,
    transcription: parseTranscription(transcription),
    charType: charType as CharacterType,
    preview,
    category,
    tags: parseTags(tags),
    mnemonic,
    exampleWords: parsedExampleWords,
    notes,
    audioPath,
    canonicalRef,
    value: char, // For Literal compatibility
    data: dataAttrs,
  };
}

/**
 * Transform container directive to ExampleSetNode
 */
function transformExampleSet(directive: DirectiveNode): Partial<ExampleSetNode> {
  const { id = '', title, description } = directive.attributes || {};

  const children: ExampleNode[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'leafDirective' && child.name === 'example') {
        const exampleNode = transformExample(child);
        children.push(exampleNode as ExampleNode);
      } else if (child.type === 'containerDirective' && child.name === 'example') {
        const exampleNode = transformExample(child);
        children.push(exampleNode as ExampleNode);
      }
    }
  }

  return {
    type: 'exampleSet',
    id,
    title,
    description,
    children,
  };
}

/**
 * Transform directive to ExampleNode
 */
function transformExample(directive: DirectiveNode): Partial<ExampleNode> {
  const {
    id = `example-${Math.random().toString(36).substr(2, 9)}`,
    text = '',
    translation = '',
    transcription,
    notes,
    literalTranslation,
  } = directive.attributes || {};

  // Extract illustrates from attributes
  const illustrates = directive.attributes?.illustrates?.split(',').map(s => s.trim());

  // Extract data attributes (data:* prefix)
  const data = extractDataAttributes(directive.attributes);

  return {
    type: 'example',
    id,
    text,
    transcription: parseTranscription(transcription),
    translation,
    literalTranslation,
    notes,
    illustrates,
    value: text, // For Literal compatibility
    ...(data && { data }),
  };
}

/**
 * Parse numbered list items into an array of strings
 */
function parseListItems(text: string): string[] {
  if (!text) return [];

  // Split by numbered list pattern (1. 2. 3. etc.)
  const lines = text.split('\n').filter(line => line.trim());
  const items: string[] = [];

  for (const line of lines) {
    // Match numbered items: "1. content" or "- content"
    const match = line.match(/^(?:\d+\.|-)?\s*(.+)$/);
    if (match && match[1]) {
      items.push(match[1].trim());
    }
  }

  return items;
}

/**
 * Transform container directive to ExerciseNode
 */
function transformExercise(directive: DirectiveNode): Partial<ExerciseNode> {
  const {
    id = `exercise-${Math.random().toString(36).substr(2, 9)}`,
    type: exerciseType = 'open-ended',
    title,
    difficulty,
    skill,
    tests,
    objectiveId,
  } = directive.attributes || {};

  // Extract question, answer, explanation from children
  let instructions = '';
  let questionItems: string[] = [];
  let answerItems: string[] = [];
  let explanation = '';
  const options: string[] = [];
  const items: { question: string; answer: string }[] = [];

  if (directive.children) {
    let currentSection = '';
    const sections: { [key: string]: string } = {};
    const listContent: { [key: string]: string } = {};

    for (const child of directive.children) {
      if (child.type === 'paragraph') {
        const text = extractTextContent(child);
        // After markdown parsing, **Question:** becomes plain text "Question:"
        // because the strong formatting is already extracted
        if (text.startsWith('Question:')) {
          currentSection = 'question';
          sections.question = text.replace('Question:', '').trim();
        } else if (text.startsWith('Instructions:')) {
          currentSection = 'question';
          instructions = text.replace('Instructions:', '').trim();
        } else if (text.startsWith('Options:') || text.startsWith('?options:')) {
          currentSection = 'options';
          // Handle comma-separated options format: ?options: kite, sky
          if (text.startsWith('?options:')) {
            const optionsText = text.replace(/^\?options:\s*/i, '').trim();
            if (optionsText) {
              const parsedOptions = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
              options.push(...parsedOptions);
            }
          }
          // Don't store the "Options:" text itself, just set the section
        } else if (text.startsWith('Answer:') || text.startsWith('?answer:')) {
          currentSection = 'answer';
          const answerText = text.replace(/^(Answer:|Answers:|\?answer:)\s*/i, '').trim();
          sections.answer = answerText;
        } else if (text.startsWith('Answers:')) {
          currentSection = 'answer';
          sections.answer = text.replace('Answers:', '').trim();
        } else if (text.startsWith('Explanation:')) {
          currentSection = 'explanation';
          sections.explanation = text.replace('Explanation:', '').trim();
        } else if (text.startsWith('Example:')) {
          currentSection = 'example';
          sections.example = text.replace('Example:', '').trim();
        } else if (currentSection && text.trim()) {
          // Append to current section
          sections[currentSection] = (sections[currentSection] || '') + '\n' + text;
        } else if (!currentSection && text.trim() && !text.startsWith('?')) {
          // If no section is set yet and this doesn't start with ?, treat as question
          // This handles the case where question is just a plain line
          if (!instructions && !sections.question) {
            currentSection = 'question';
            sections.question = text.trim();
            instructions = text.trim();
          }
        }
      } else if (child.type === 'list') {
        // Handle numbered lists - store separately for parsing
        const listText = extractTextContent(child);
        if (currentSection) {
          listContent[currentSection] = (listContent[currentSection] || '') + '\n' + listText;
        }
      }
    }

    // Parse options from list content (for multiple-choice exercises)
    if (listContent.options) {
      const parsedOptions = parseListItems(listContent.options);
      options.push(...parsedOptions);
    }

    // Parse question items from list content
    if (listContent.question) {
      questionItems = parseListItems(listContent.question);
    }

    // Parse answer items from list content or section text
    if (listContent.answer) {
      answerItems = parseListItems(listContent.answer);
    } else if (sections.answer) {
      // For multiple-choice, check if answer is a number (index)
      const answerText = sections.answer.trim();
      if (exerciseType === 'multiple-choice' && options.length > 0) {
        // Try to parse as number (1-based index)
        const answerIndex = parseInt(answerText, 10);
        if (!isNaN(answerIndex) && answerIndex >= 1 && answerIndex <= options.length) {
          // Convert to 0-based index and get the option text
          answerItems = [options[answerIndex - 1]!];
        } else {
          answerItems = [answerText];
        }
      } else {
        answerItems = parseListItems(answerText);
      }
    }

    // Build instruction text
    if (!instructions) {
      instructions = sections.question || sections.example || '';
    }

    explanation = sections.explanation || '';

    // Build structured items if we have matching questions and answers
    if (questionItems.length > 0 && answerItems.length > 0) {
      for (let i = 0; i < Math.max(questionItems.length, answerItems.length); i++) {
        items.push({
          question: questionItems[i] || '',
          answer: answerItems[i] || '',
        });
      }
    }

    // For dialogue exercises, use example list content as dialogue lines
    if (exerciseType === 'dialogue' && listContent.example && items.length === 0) {
      const dialogueLines = parseListItems(listContent.example);
      for (const line of dialogueLines) {
        items.push({
          question: line,  // The dialogue line (e.g., "A: यह क्या है ?")
          answer: '',      // No "answer" for dialogue lines
        });
      }
    }

    // For multiple-choice exercises without items, create a single item from question/answer
    if (exerciseType === 'multiple-choice' && items.length === 0 && instructions && answerItems.length > 0) {
      items.push({
        question: instructions,
        answer: answerItems[0] || '',
      });
    }
  }

  return {
    type: 'exercise',
    id,
    title,
    exerciseType: exerciseType as any,
    question: instructions,
    items: items.length > 0 ? items : undefined,
    options: options.length > 0 ? options : undefined,
    answer: answerItems.length > 0 ? (answerItems.length === 1 ? answerItems[0] : answerItems.join('\n')) : '',
    explanation,
    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined,
    skill,
    tests: tests ? tests.split(',').map(t => t.trim()) : undefined,
    objectiveId,
    children: [], // Exercise nodes require children array (empty if no additional content)
  };
}

/**
 * Extract text content from a node, preserving line breaks
 */
function extractTextContent(node: any, preserveLineBreaks = true): string {
  if (!node) {
    return '';
  }

  if (node.type === 'text') {
    return node.value || '';
  }

  // Handle list items specially to preserve structure
  if (node.type === 'listItem') {
    const content = node.children?.map((c: any) => extractTextContent(c, preserveLineBreaks)).join('') || '';
    return content;
  }

  // Handle lists - join items with newlines
  if (node.type === 'list') {
    return node.children?.map((item: any, index: number) => {
      const content = extractTextContent(item, preserveLineBreaks);
      // For ordered lists, add numbering
      if (node.ordered) {
        return `${index + 1}. ${content}`;
      }
      return `- ${content}`;
    }).join('\n') || '';
  }

  // Handle paragraphs - add newline after
  if (node.type === 'paragraph') {
    const content = node.children?.map((c: any) => extractTextContent(c, preserveLineBreaks)).join('') || '';
    return content;
  }

  // Handle strong/emphasis - extract inner text
  if (node.type === 'strong' || node.type === 'emphasis') {
    return node.children?.map((c: any) => extractTextContent(c, preserveLineBreaks)).join('') || '';
  }

  if (node.children && Array.isArray(node.children)) {
    const separator = preserveLineBreaks ? '\n' : '';
    return node.children.map((c: any) => extractTextContent(c, preserveLineBreaks)).join(separator);
  }

  return '';
}

// ============================================================================
// Dialogue Directive Transforms
// ============================================================================

/**
 * Pattern for gender variants: {masculine|feminine}
 * e.g., "สวัสดี{ครับ|ค่ะ}" matches "ครับ" and "ค่ะ"
 */
const GENDER_VARIANT_PATTERN = /\{([^|]+)\|([^}]+)\}/g;

/**
 * Parse gender variant syntax from text
 *
 * @example
 * parseGenderVariants("สวัสดี{ครับ|ค่ะ}")
 * // { hasVariants: true, variants: { masculine: "สวัสดีครับ", feminine: "สวัสดีค่ะ" }, masculine: "สวัสดีครับ", feminine: "สวัสดีค่ะ" }
 */
function parseGenderVariants(text: string): {
  hasVariants: boolean;
  variants?: GenderVariants;
  masculine: string;
  feminine: string;
} {
  const matches = [...text.matchAll(GENDER_VARIANT_PATTERN)];

  if (matches.length === 0) {
    return {
      hasVariants: false,
      masculine: text,
      feminine: text,
    };
  }

  let masculine = text;
  let feminine = text;

  for (const match of matches) {
    const [fullMatch, maleVariant, femaleVariant] = match;
    masculine = masculine.replace(fullMatch, maleVariant ?? '');
    feminine = feminine.replace(fullMatch, femaleVariant ?? '');
  }

  return {
    hasVariants: true,
    variants: {
      masculine,
      feminine,
    },
    masculine,
    feminine,
  };
}

/**
 * Transform container directive to DialogueNode
 *
 * Usage:
 * :::dialogue{id="shop-greeting" context="shopping" lang="th-TH"}
 * ::turn{speaker="me" gender="masculine"}
 * สวัสดี{ครับ|ค่ะ}
 * # en-US: Hello
 * ::
 * ::turn{speaker="shopkeeper" name="Shopkeeper" gender="feminine"}
 * สวัสดีค่ะ
 * # en-US: Hello
 * ::
 * ::cultural-note
 * ครับ is for male speakers, ค่ะ for female speakers.
 * ::
 * :::
 */
function transformDialogue(directive: DirectiveNode): Partial<DialogueNode> {
  const {
    id = `dialogue-${Math.random().toString(36).substr(2, 9)}`,
    context,
    lang,
  } = directive.attributes || {};

  const participants: DialogueParticipant[] = [];
  const children: DialogueTurnNode[] = [];
  let culturalNotes: string | undefined;

  if (directive.children) {
    let i = 0;
    while (i < directive.children.length) {
      const child = directive.children[i];

      // Handle turn directives (leaf or container)
      if ((child.type === 'leafDirective' || child.type === 'containerDirective') && child.name === 'turn') {
        // For leaf directives, content is in SIBLING nodes, not children
        // Collect content until next directive or end
        const siblingContent: any[] = [];
        if (child.type === 'leafDirective') {
          let j = i + 1;
          while (j < directive.children.length) {
            const nextChild = directive.children[j];
            // Stop at next directive (leaf or container) or empty leaf (::)
            if (nextChild.type === 'leafDirective' || nextChild.type === 'containerDirective') {
              break;
            }
            siblingContent.push(nextChild);
            j++;
          }
          i = j; // Skip processed siblings
        } else {
          i++;
        }

        const turn = transformDialogueTurnWithSiblings(child, siblingContent);
        children.push(turn as DialogueTurnNode);

        // Extract participant from turn if not already added
        const speakerId = turn.speakerId || 'unknown';
        if (!participants.some(p => p.id === speakerId)) {
          participants.push({
            id: speakerId,
            name: child.attributes?.name,
            gender: child.attributes?.gender as 'masculine' | 'feminine' | 'neutral' | undefined,
            role: child.attributes?.role,
          });
        }
        continue;
      }

      // Handle cultural-note directives
      if ((child.type === 'leafDirective' || child.type === 'containerDirective') && child.name === 'cultural-note') {
        // For leaf directives, collect sibling content
        const siblingContent: any[] = [];
        if (child.type === 'leafDirective') {
          let j = i + 1;
          while (j < directive.children.length) {
            const nextChild = directive.children[j];
            if (nextChild.type === 'leafDirective' || nextChild.type === 'containerDirective') {
              break;
            }
            siblingContent.push(nextChild);
            j++;
          }
          i = j;
        } else {
          i++;
        }

        // Extract cultural notes from directive children OR sibling content
        if (siblingContent.length > 0) {
          culturalNotes = siblingContent.map(node => extractTextContent(node)).join('\n').trim();
        } else {
          culturalNotes = extractTextContent(child);
        }
        continue;
      }

      i++;
    }
  }

  return {
    type: 'dialogue',
    id,
    participants,
    context,
    culturalNotes,
    lang,
    children,
  };
}

/**
 * Extract turn content from a list of nodes (children or siblings)
 *
 * Supports `transcription:` annotations
 */
function extractTurnContent(nodes: any[]): { text: string; translation: string; transcription?: string } {
  let text = '';
  let translation = '';
  let transcription: string | undefined;

  for (const child of nodes) {
    if (child.type === 'paragraph') {
      const content = extractTextContent(child);
      if (content.startsWith('#')) {
        // Parse annotation: # en-US: Hello or # transcription: ...
        const match = content.match(/^#\s*(\S+):\s*(.+)$/);
        if (match) {
          const [, annotationType, value] = match;
          if (annotationType === 'transcription') {
            transcription = value ?? '';
          } else {
            // Treat as translation (e.g., "en-US: Hello")
            translation = value ?? '';
          }
        }
      } else if (!text) {
        // First non-annotation paragraph is the main text
        text = content;
      }
    } else if (child.type === 'heading') {
      // In markdown, # starts a heading - we use this for annotations
      // Parse annotation: # en-US: Hello or # transcription: ...
      const content = extractTextContent(child);
      const match = content.match(/^(\S+):\s*(.+)$/);
      if (match) {
        const [, annotationType, value] = match;
        if (annotationType === 'transcription') {
          transcription = value ?? '';
        } else {
          // Treat as translation (e.g., "en-US: Hello")
          translation = value ?? '';
        }
      }
    } else if (child.type === 'text') {
      // Direct text content
      if (!text) {
        text = child.value || '';
      }
    }
  }

  return { text, translation, transcription };
}

/**
 * Transform leaf/container directive to DialogueTurnNode with sibling content
 *
 * For leaf directives (::turn), content is in sibling nodes, not children.
 * For container directives (:::turn), content is in children.
 */
function transformDialogueTurnWithSiblings(
  directive: DirectiveNode,
  siblingContent: any[] = []
): Partial<DialogueTurnNode> {
  const {
    speaker = 'unknown',
  } = directive.attributes || {};

  // First try directive children (for container directives)
  let content = extractTurnContent(directive.children || []);

  // If no text found in children, try sibling content (for leaf directives)
  if (!content.text && siblingContent.length > 0) {
    content = extractTurnContent(siblingContent);
  }

  const { text, translation, transcription } = content;

  // Parse gender variants
  const { hasVariants, variants, masculine } = parseGenderVariants(text);

  return {
    type: 'dialogueTurn',
    speakerId: speaker,
    text,
    genderVariants: hasVariants ? variants : undefined,
    transcription,
    translation: translation || '', // Default to empty string if no translation
    value: masculine, // Use masculine variant as default value for Literal compatibility
  };
}

/**
 * Transform leaf/container directive to DialogueTurnNode
 *
 * Usage:
 * ::turn{speaker="me" gender="masculine"}
 * สวัสดี{ครับ|ค่ะ}
 * # en-US: Hello
 * # transcription: sa-wat-dee krap/ka
 * ::
 */
function transformDialogueTurn(directive: DirectiveNode): Partial<DialogueTurnNode> {
  return transformDialogueTurnWithSiblings(directive, []);
}

/**
 * Collect sibling content after a directive until the next directive or end
 */
function collectSiblingContent(parent: any, startIndex: number): any[] {
  const siblings: any[] = [];
  if (!parent?.children) return siblings;

  for (let j = startIndex + 1; j < parent.children.length; j++) {
    const sibling = parent.children[j];
    // Stop at next directive (leaf or container) or an empty leaf directive marker
    if (sibling.type === 'leafDirective' || sibling.type === 'containerDirective') {
      break;
    }
    siblings.push(sibling);
  }
  return siblings;
}

// ============================================================================
// Phonological Rule, Syllable Pattern, Writing Pattern Transforms (v0.3.0)
// ============================================================================

/**
 * Transform leaf directive to RuleConditionNode
 *
 * Usage:
 * ::rule-condition{condition='{"consonantClass":"middle","toneMark":"mai-ek"}' result="low" example="ไก่" exampleTranscription="gài" exampleTranslation="chicken"}
 */
function transformRuleCondition(directive: DirectiveNode): Partial<RuleConditionNode> {
  const {
    id,
    result = '',
    example,
    exampleTranscription,
    exampleTranslation,
    notes,
  } = directive.attributes || {};

  // Parse condition from JSON attribute
  let condition: Record<string, string> = {};
  const conditionAttr = directive.attributes?.condition;
  if (conditionAttr) {
    try {
      condition = JSON.parse(conditionAttr);
    } catch {
      // If not valid JSON, treat as single key-value
      condition = { rule: conditionAttr };
    }
  }

  // Build a readable value string from condition + result
  const conditionStr = Object.entries(condition)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  const value = `${conditionStr} → ${result}`;

  return {
    type: 'ruleCondition',
    id,
    condition,
    result,
    example,
    exampleTranscription,
    exampleTranslation,
    notes,
    value,
  };
}

/**
 * Transform container directive to PhonologicalRuleNode
 *
 * Usage:
 * :::phonological-rule{id="tone-rules-middle" title="Tone Rules for Middle-Class" ruleType="tone"}
 * Middle-class consonants produce all 5 tones with tone marks.
 *
 * ::rule-condition{condition='{"consonantClass":"middle","toneMark":"none"}' result="mid" example="กา" exampleTranscription="gaa" exampleTranslation="crow"}
 * ::rule-condition{condition='{"consonantClass":"middle","toneMark":"mai-ek"}' result="low" example="ไก่" exampleTranscription="gài" exampleTranslation="chicken"}
 * :::
 */
function transformPhonologicalRule(directive: DirectiveNode): Partial<PhonologicalRuleNode> {
  const {
    id = '',
    title = '',
    ruleType = 'tone',
    description: descAttr,
    exceptions,
    relatedRules,
  } = directive.attributes || {};

  // Extract description from first paragraph if not in attributes
  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'paragraph' && !description) {
        description = extractTextContent(child);
      } else if (child.type === 'leafDirective' && child.name === 'rule-condition') {
        children.push(transformRuleCondition(child));
      } else if (child.type === 'leafDirective' && child.name === 'example') {
        children.push(transformExample(child));
      } else if (child.type === 'containerDirective' && child.name === 'example') {
        children.push(transformExample(child));
      } else if (child.type === 'paragraph' && description) {
        // Additional paragraphs become content nodes
        children.push({
          type: 'content',
          format: 'text',
          value: extractTextContent(child),
        });
      }
    }
  }

  return {
    type: 'phonologicalRule',
    id,
    title,
    ruleType: ruleType as PhonologicalRuleType,
    description,
    exceptions,
    relatedRules: relatedRules ? relatedRules.split(',').map(r => r.trim()) : undefined,
    children,
  };
}

/**
 * Transform leaf directive to PatternExampleNode
 *
 * Usage:
 * ::pattern-example{text="กา" transcription="gaa" translation="crow" references="chicken" data:consonantClass="middle" data:syllableType="live" data:tone="mid"}
 */
function transformPatternExample(directive: DirectiveNode): Partial<PatternExampleNode> {
  const {
    text = '',
    transcription,
    translation,
    notes,
    references,
  } = directive.attributes || {};

  const dataAttrs = extractDataAttributes(directive.attributes);

  return {
    type: 'patternExample',
    text,
    transcription: parseTranscription(transcription),
    translation,
    notes,
    references: references ? references.split(',').map(r => r.trim()) : undefined,
    value: text,
    data: dataAttrs,
  };
}

/**
 * Transform container directive to SyllablePatternNode
 *
 * Usage:
 * :::syllable-pattern{id="live-syllables" title="Live Syllables" patternType="live" structure="CV"}
 * Live syllables end in a long vowel or a sonorant consonant.
 *
 * ::pattern-example{text="กา" transcription="gaa" translation="crow" data:tone="mid"}
 * :::
 */
function transformSyllablePattern(directive: DirectiveNode): Partial<SyllablePatternNode> {
  const {
    id = '',
    title = '',
    patternType,
    structure,
    description: descAttr,
  } = directive.attributes || {};

  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'paragraph' && !description) {
        description = extractTextContent(child);
      } else if (child.type === 'leafDirective' && child.name === 'pattern-example') {
        children.push(transformPatternExample(child));
      } else if (child.type === 'paragraph' && description) {
        children.push({
          type: 'content',
          format: 'text',
          value: extractTextContent(child),
        });
      }
    }
  }

  return {
    type: 'syllablePattern',
    id,
    title,
    patternType,
    structure,
    description,
    children,
  };
}

/**
 * Transform container directive to WritingPatternNode
 *
 * Usage:
 * :::writing-pattern{id="vowel-positioning" title="Vowel Positioning Rules" patternType="positioning"}
 * Thai vowels can appear above, below, before, or after their consonant.
 *
 * ::example{text="เ-" translation="Short e vowel — written before consonant"}
 * :::
 */
function transformWritingPattern(directive: DirectiveNode): Partial<WritingPatternNode> {
  const {
    id = '',
    title = '',
    patternType = 'positioning',
    description: descAttr,
  } = directive.attributes || {};

  let description = descAttr;
  const children: any[] = [];

  if (directive.children) {
    for (const child of directive.children) {
      if (child.type === 'paragraph' && !description) {
        description = extractTextContent(child);
      } else if (
        (child.type === 'leafDirective' || child.type === 'containerDirective') &&
        child.name === 'example'
      ) {
        children.push(transformExample(child));
      } else if (child.type === 'paragraph' && description) {
        children.push({
          type: 'content',
          format: 'text',
          value: extractTextContent(child),
        });
      }
    }
  }

  return {
    type: 'writingPattern',
    id,
    title,
    patternType,
    description,
    children,
  };
}

/**
 * Remark plugin to transform syllabus directives
 */
export const remarkSyllabusDirectives: Plugin<[], MdastRoot> = function () {
  return (tree: MdastRoot) => {
    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective') {
        return;
      }

      const directive = node as DirectiveNode;

      // Transform based on directive name
      switch (directive.name) {
        case 'grammar-rule':
          Object.assign(node, transformGrammarRule(directive));
          break;

        case 'vocabulary-set':
          Object.assign(node, transformVocabularySet(directive));
          break;

        case 'vocab':
          Object.assign(node, transformVocabularyItem(directive));
          break;

        case 'character-set':
          Object.assign(node, transformCharacterSet(directive));
          break;

        case 'character':
          Object.assign(node, transformCharacterItem(directive));
          break;

        case 'example-set':
          Object.assign(node, transformExampleSet(directive));
          break;

        case 'example':
          Object.assign(node, transformExample(directive));
          break;

        case 'exercise':
          Object.assign(node, transformExercise(directive));
          break;

        case 'dialogue':
          Object.assign(node, transformDialogue(directive));
          break;

        case 'turn':
          // For standalone turn directives, collect sibling content
          if (directive.type === 'leafDirective' && index !== undefined && parent) {
            const siblingContent = collectSiblingContent(parent, index);
            Object.assign(node, transformDialogueTurnWithSiblings(directive, siblingContent));
          } else {
            Object.assign(node, transformDialogueTurn(directive));
          }
          break;

        case 'cultural-note':
          // Cultural notes are handled inside dialogue, but can also be standalone
          // For standalone notes, we could create a ContentNode
          break;

        case 'phonological-rule':
          Object.assign(node, transformPhonologicalRule(directive));
          break;

        case 'rule-condition':
          Object.assign(node, transformRuleCondition(directive));
          break;

        case 'syllable-pattern':
          Object.assign(node, transformSyllablePattern(directive));
          break;

        case 'pattern-example':
          Object.assign(node, transformPatternExample(directive));
          break;

        case 'writing-pattern':
          Object.assign(node, transformWritingPattern(directive));
          break;
      }
    });
  };
};

export default remarkSyllabusDirectives;
