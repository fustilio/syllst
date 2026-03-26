/**
 * @syllst/ko
 *
 * Korean language learning content for the syllabus framework.
 */

// Import syllabi with unique names
import { config as alphabetConfig, loader as alphabetLoader } from './syllabi/alphabet';
import { config as numbersConfig, loader as numbersLoader } from './syllabi/numbers';
import { config as essentialsConfig, loader as essentialsLoader } from './syllabi/essentials';

// Re-export configs and loaders
export { alphabetConfig, alphabetLoader };
export { numbersConfig, numbersLoader };
export { essentialsConfig, essentialsLoader };

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
