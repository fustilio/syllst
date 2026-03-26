/**
 * Skill Taxonomy for Language Learning
 *
 * Defines the standard skill categories and individual skills
 * that can be tracked across exercises and learning objectives.
 * These skill IDs are used in exercise `skill` fields and
 * learning objective `skill` fields to enable granular tracking.
 */

/**
 * Skill category grouping related skills
 */
export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
}

/**
 * Individual trackable skill
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * Core skill categories for language learning.
 * Language-specific packages can extend with additional skills.
 */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'character',
    name: 'Character Skills',
    description: 'Skills related to recognizing, writing, and producing characters',
    skills: [
      {
        id: 'character-recognition',
        name: 'Character Recognition',
        description: 'Identify a character from its visual form',
        category: 'character',
      },
      {
        id: 'character-production',
        name: 'Character Production',
        description: 'Write or produce a character from memory',
        category: 'character',
      },
      {
        id: 'character-sound-mapping',
        name: 'Character-Sound Mapping',
        description: 'Map a character to its pronunciation',
        category: 'character',
      },
      {
        id: 'character-name-recall',
        name: 'Character Name Recall',
        description: 'Recall the name or mnemonic of a character',
        category: 'character',
      },
      {
        id: 'character-class-identification',
        name: 'Character Class Identification',
        description: 'Identify the class/category of a character (e.g., consonant class)',
        category: 'character',
      },
    ],
  },
  {
    id: 'phonology',
    name: 'Phonology Skills',
    description: 'Skills related to sound systems, tone rules, and pronunciation',
    skills: [
      {
        id: 'tone-rule-application',
        name: 'Tone Rule Application',
        description: 'Apply tone rules to determine correct pronunciation',
        category: 'phonology',
      },
      {
        id: 'tone-perception',
        name: 'Tone Perception',
        description: 'Distinguish between different tones in spoken language',
        category: 'phonology',
      },
      {
        id: 'tone-production',
        name: 'Tone Production',
        description: 'Produce correct tones in speech',
        category: 'phonology',
      },
      {
        id: 'syllable-analysis',
        name: 'Syllable Analysis',
        description: 'Break words into syllables and identify syllable types',
        category: 'phonology',
      },
      {
        id: 'sound-change-recognition',
        name: 'Sound Change Recognition',
        description: 'Recognize phonological processes like assimilation or elision',
        category: 'phonology',
      },
    ],
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Skills',
    description: 'Skills related to word knowledge and usage',
    skills: [
      {
        id: 'word-recognition',
        name: 'Word Recognition',
        description: 'Recognize a word and recall its meaning',
        category: 'vocabulary',
      },
      {
        id: 'word-production',
        name: 'Word Production',
        description: 'Produce the correct word for a given meaning',
        category: 'vocabulary',
      },
      {
        id: 'word-pronunciation',
        name: 'Word Pronunciation',
        description: 'Pronounce a word correctly (transcription recall)',
        category: 'vocabulary',
      },
      {
        id: 'word-spelling',
        name: 'Word Spelling',
        description: 'Spell a word correctly in the target script',
        category: 'vocabulary',
      },
    ],
  },
  {
    id: 'grammar',
    name: 'Grammar Skills',
    description: 'Skills related to grammatical patterns and sentence construction',
    skills: [
      {
        id: 'pattern-recognition',
        name: 'Pattern Recognition',
        description: 'Recognize a grammatical pattern in context',
        category: 'grammar',
      },
      {
        id: 'pattern-application',
        name: 'Pattern Application',
        description: 'Apply a grammatical pattern to construct sentences',
        category: 'grammar',
      },
      {
        id: 'particle-usage',
        name: 'Particle Usage',
        description: 'Use grammatical particles correctly',
        category: 'grammar',
      },
      {
        id: 'word-order',
        name: 'Word Order',
        description: 'Arrange words in the correct order',
        category: 'grammar',
      },
    ],
  },
  {
    id: 'reading',
    name: 'Reading Skills',
    description: 'Skills related to reading comprehension',
    skills: [
      {
        id: 'text-decoding',
        name: 'Text Decoding',
        description: 'Read and decode text in the target script',
        category: 'reading',
      },
      {
        id: 'reading-comprehension',
        name: 'Reading Comprehension',
        description: 'Understand the meaning of a passage',
        category: 'reading',
      },
    ],
  },
  {
    id: 'writing',
    name: 'Writing Skills',
    description: 'Skills related to the writing system',
    skills: [
      {
        id: 'stroke-order',
        name: 'Stroke Order',
        description: 'Write characters with correct stroke order',
        category: 'writing',
      },
      {
        id: 'vowel-positioning',
        name: 'Vowel Positioning',
        description: 'Place vowel marks in the correct position relative to consonants',
        category: 'writing',
      },
      {
        id: 'tone-mark-placement',
        name: 'Tone Mark Placement',
        description: 'Place tone marks correctly on syllables',
        category: 'writing',
      },
    ],
  },
  {
    id: 'conversation',
    name: 'Conversation Skills',
    description: 'Skills related to dialogue and conversation',
    skills: [
      {
        id: 'dialogue-comprehension',
        name: 'Dialogue Comprehension',
        description: 'Understand a dialogue exchange',
        category: 'conversation',
      },
      {
        id: 'polite-register',
        name: 'Polite Register',
        description: 'Use the appropriate level of politeness',
        category: 'conversation',
      },
      {
        id: 'situational-response',
        name: 'Situational Response',
        description: 'Choose the correct response for a given situation',
        category: 'conversation',
      },
    ],
  },
];

/**
 * Flat list of all skill IDs for quick lookup
 */
export const ALL_SKILL_IDS: string[] = SKILL_CATEGORIES.flatMap(
  (cat) => cat.skills.map((s) => s.id),
);

/**
 * Map from skill ID to Skill object
 */
export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  SKILL_CATEGORIES.flatMap((cat) =>
    cat.skills.map((s) => [s.id, s]),
  ),
);

/**
 * Check if a skill ID is valid (exists in the taxonomy)
 */
export function isValidSkillId(skillId: string): boolean {
  return skillId in SKILL_MAP;
}

/**
 * Get skill info by ID, returns undefined if not found
 */
export function getSkill(skillId: string): Skill | undefined {
  return SKILL_MAP[skillId];
}

/**
 * Get all skills in a category
 */
export function getSkillsByCategory(categoryId: string): Skill[] {
  const category = SKILL_CATEGORIES.find((c) => c.id === categoryId);
  return category?.skills ?? [];
}
