import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'alphabet',
  title: 'Alphabet',
  description: 'Thai alphabet (consonants and initial consonants)',
  language: 'th',
  script: 'thai',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
