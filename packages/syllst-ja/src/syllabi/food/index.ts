import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'food',
  title: 'Food',
  description: 'Japanese food vocabulary and dining phrases',
  language: 'ja',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
