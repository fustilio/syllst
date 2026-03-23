import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'travel',
  title: 'Travel',
  description: 'Japanese travel phrases and vocabulary',
  language: 'ja',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
