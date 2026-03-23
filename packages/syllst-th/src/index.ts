/**
 * @syllst/th
 *
 * Thai language learning content for the syllabus framework.
 */

// Export syllabi with unique names
export { config as alphabetConfig, loader as alphabetLoader } from './syllabi/alphabet';
export { config as vowelsTonesConfig, loader as vowelsTonesLoader } from './syllabi/vowels-tones';
export { config as numbersConfig, loader as numbersLoader } from './syllabi/numbers';
export { config as essentialsConfig, loader as essentialsLoader } from './syllabi/essentials';
export { config as foodConfig, loader as foodLoader } from './syllabi/food';
export { config as travelConfig, loader as travelLoader } from './syllabi/travel';
export { config as dialogueConfig, loader as dialogueLoader } from './syllabi/dialogue';
export { config as grammarConfig, loader as grammarLoader } from './syllabi/grammar';
export { config as readingConfig, loader as readingLoader } from './syllabi/reading';

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
