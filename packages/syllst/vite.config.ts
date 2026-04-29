import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'schemas/index': 'src/schemas/index.ts',
  },
});
