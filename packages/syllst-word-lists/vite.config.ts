import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    'types/word-lists': 'src/types/word-lists.ts',
    'utils/index': 'src/utils/index.ts',
    'utils/word-lists-loader': 'src/utils/word-lists-loader.ts',
    'utils/word-lists-browser-loader': 'src/utils/word-lists-browser-loader.ts',
  },
});
