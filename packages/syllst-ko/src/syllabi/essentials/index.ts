import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'essentials',
  title: 'Essentials',
  description: 'Essential Korean phrases and vocabulary',
  language: 'ko',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
