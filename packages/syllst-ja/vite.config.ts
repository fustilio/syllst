import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'syllst-ja',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@syllst/core', '@syllst/processor', '@polyglot-bundles/ja-lang'],
      output: {
        globals: {
          '@syllst/core': 'syllstCore',
          '@syllst/processor': 'syllstProcessor',
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    dts({
      rollupTypes: false,
      include: ['src'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
