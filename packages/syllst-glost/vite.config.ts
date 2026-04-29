import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    'enrichers/index': 'src/enrichers/index.ts',
    'providers/index': 'src/providers/index.ts',
  },
});
