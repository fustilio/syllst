import { config as hiraganaConfig } from './syllabi/hiragana/index.js';
import * as hiragana from './syllabi/hiragana/index.js';
import { loader as hiraganaLoader } from './syllabi/hiragana/index.js';

import { config as katakanaConfig } from './syllabi/katakana/index.js';
import * as katakana from './syllabi/katakana/index.js';
import { loader as katakanaLoader } from './syllabi/katakana/index.js';

import { config as essentialsConfig } from './syllabi/essentials/index.js';
import * as essentials from './syllabi/essentials/index.js';
import { loader as essentialsLoader } from './syllabi/essentials/index.js';

import { config as numbersConfig } from './syllabi/numbers/index.js';
import * as numbers from './syllabi/numbers/index.js';
import { loader as numbersLoader } from './syllabi/numbers/index.js';

import { config as foodConfig } from './syllabi/food/index.js';
import * as food from './syllabi/food/index.js';
import { loader as foodLoader } from './syllabi/food/index.js';

import { config as travelConfig } from './syllabi/travel/index.js';
import * as travel from './syllabi/travel/index.js';
import { loader as travelLoader } from './syllabi/travel/index.js';

import { config as dialogueConfig } from './syllabi/dialogue/index.js';
import * as dialogue from './syllabi/dialogue/index.js';
import { loader as dialogueLoader } from './syllabi/dialogue/index.js';

export const allConfigs = [
  hiraganaConfig,
  katakanaConfig,
  essentialsConfig,
  numbersConfig,
  foodConfig,
  travelConfig,
  dialogueConfig,
];

export function getConfigById(id: string) {
  return allConfigs.find((config) => config.id === id);
}

// Hiragana exports
export {
  hiragana,
  hiraganaConfig,
  hiraganaLoader,
};

// Katakana exports
export {
  katakana,
  katakanaConfig,
  katakanaLoader,
};

// Essentials exports
export {
  essentials,
  essentialsConfig,
  essentialsLoader,
};

// Numbers exports
export {
  numbers,
  numbersConfig,
  numbersLoader,
};

// Food exports
export {
  food,
  foodConfig,
  foodLoader,
};

// Travel exports
export {
  travel,
  travelConfig,
  travelLoader,
};

// Dialogue exports
export {
  dialogue,
  dialogueConfig,
  dialogueLoader,
};
