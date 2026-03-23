/**
 * @syllst/ko
 *
 * Korean language learning content for the syllabus framework.
 */

// Export syllabi with unique names
export { config as alphabetConfig, loader as alphabetLoader } from './syllabi/alphabet';
export { config as numbersConfig, loader as numbersLoader } from './syllabi/numbers';
export { config as essentialsConfig, loader as essentialsLoader } from './syllabi/essentials';

// Helper function to get all configs
export const allConfigs = [
  alphabetConfig,
  numbersConfig,
  essentialsConfig,
];

// Helper function to get config by ID
export function getConfigById(id: string) {
  return allConfigs.find((config) => config.id === id);
}
