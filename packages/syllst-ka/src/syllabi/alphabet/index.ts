import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'alphabet',
  title: 'Alphabet',
  description: 'Georgian alphabet (Mkhedruli script)',
  language: 'ka',
  script: 'mkhedruli',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
