import { createLoader } from '@syllst/processor';
import type { SyllabusConfig } from '@syllst/core/types';

export const config: SyllabusConfig = {
  id: 'dialogue',
  title: 'Dialogue',
  description: 'Thai conversation dialogues',
  language: 'th',
};

// Create loader - lessons are loaded at runtime from the lessons directory
export const loader = createLoader(config);
