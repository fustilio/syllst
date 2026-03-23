import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'reading',
  title: 'Reading',
  description: 'Georgian reading comprehension',
  language: 'ka',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
