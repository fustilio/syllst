import { createLibConfig } from '../../scripts/vite-lib-config';

export default createLibConfig({
  entries: {
    index: 'src/index.ts',
    verbs: 'src/verbs.ts',
    'activity-types': 'src/activity-types.ts',
    extensions: 'src/extensions.ts',
    schemas: 'src/schemas.ts',
    profile: 'src/profile.ts',
  },
});
