import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'travel',
  title: 'Travel',
  description: 'Thai travel phrases and vocabulary',
  language: 'th',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
