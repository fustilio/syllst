import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'hiragana',
  title: 'Hiragana',
  description: 'Learn the basic Japanese hiragana syllabary',
  language: 'ja',
  script: 'hiragana',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
