import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'essentials',
  title: 'Essentials',
  description: 'Essential Japanese phrases and vocabulary',
  language: 'ja',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
