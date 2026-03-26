/**
 * @syllst/th
 *
 * Thai language learning content for the syllabus framework.
 */

// Import syllabi with unique names
import { config as alphabetConfig, loader as alphabetLoader } from './syllabi/alphabet';
import { config as vowelsTonesConfig, loader as vowelsTonesLoader } from './syllabi/vowels-tones';
import { config as numbersConfig, loader as numbersLoader } from './syllabi/numbers';
import { config as essentialsConfig, loader as essentialsLoader } from './syllabi/essentials';
import { config as foodConfig, loader as foodLoader } from './syllabi/food';
import { config as travelConfig, loader as travelLoader } from './syllabi/travel';
import { config as dialogueConfig, loader as dialogueLoader } from './syllabi/dialogue';
import { config as grammarConfig, loader as grammarLoader } from './syllabi/grammar';
import { config as readingConfig, loader as readingLoader } from './syllabi/reading';

// Re-export configs and loaders
export { alphabetConfig, alphabetLoader };
export { vowelsTonesConfig, vowelsTonesLoader };
export { numbersConfig, numbersLoader };
export { essentialsConfig, essentialsLoader };
export { foodConfig, foodLoader };
export { travelConfig, travelLoader };
export { dialogueConfig, dialogueLoader };
export { grammarConfig, grammarLoader };
export { readingConfig, readingLoader };

// Helper function to get all configs
export const allConfigs = [
  alphabetConfig,
  vowelsTonesConfig,
  numbersConfig,
  essentialsConfig,
  foodConfig,
  travelConfig,
  dialogueConfig,
  grammarConfig,
  readingConfig,
];

// Helper function to get config by ID
export function getConfigById(id: string) {
  return allConfigs.find((config) => config.id === id);
}
