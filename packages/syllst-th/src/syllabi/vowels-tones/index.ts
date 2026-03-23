import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'vowels-tones',
  title: 'Vowels & Tones',
  description: 'Thai vowels and tone rules',
  language: 'th',
  script: 'thai',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
