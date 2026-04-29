import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    'generators/index': 'src/generators/index.ts',
    'fidelity/index': 'src/fidelity/index.ts',
  },
});
