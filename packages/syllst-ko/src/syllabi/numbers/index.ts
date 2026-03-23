import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'numbers',
  title: 'Numbers',
  description: 'Learn Korean numbers and counting',
  language: 'ko',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
