import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    'compare/index': 'src/compare/index.ts',
    normalize: 'src/normalize.ts',
  },
});
