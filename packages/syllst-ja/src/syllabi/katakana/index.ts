import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'katakana',
  title: 'Katakana',
  description: 'Learn the Japanese katakana syllabary for loan words',
  language: 'ja',
  script: 'katakana',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
