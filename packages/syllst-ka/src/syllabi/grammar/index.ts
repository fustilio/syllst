import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'grammar',
  title: 'Grammar',
  description: 'Georgian grammar fundamentals',
  language: 'ka',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
