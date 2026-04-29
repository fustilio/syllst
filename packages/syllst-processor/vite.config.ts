import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    'builders/index': 'src/builders/index.ts',
    'plugins/index': 'src/plugins/index.ts',
    'validators/index': 'src/validators/index.ts',
    'utils/index': 'src/utils/index.ts',
    'config/index': 'src/config/index.ts',
    'loader/index': 'src/loader/index.ts',
    'codemods/index': 'src/codemods/index.ts',
  },
});
