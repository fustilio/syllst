import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface LibConfigOptions {
  entries: Record<string, string>;
  extraExternals?: string[];
}

const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'sys', 'timers', 'tls', 'trace_events', 'tty', 'url',
  'util', 'v8', 'vm', 'wasix', 'worker_threads', 'zlib',
]);

function isNodeBuiltin(id: string): boolean {
  if (id.startsWith('node:')) return true;
  const topLevel = id.split('/')[0];
  return NODE_BUILTINS.has(topLevel);
}

function getPackageExternals(packageJsonPath: string): string[] {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...(pkg.optionalDependencies ? Object.keys(pkg.optionalDependencies) : []),
  ];
}

export function createLibConfig(options: LibConfigOptions): UserConfig {
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgExternals = getPackageExternals(pkgPath);
  const extraExternals = options.extraExternals || [];

  const external = (id: string): boolean => {
    if (isNodeBuiltin(id)) return true;
    return [...pkgExternals, ...extraExternals].some(
      (ext) => id === ext || id.startsWith(`${ext}/`)
    );
  };

  return defineConfig({
    build: {
      lib: {
        entry: options.entries,
        formats: ['es'],
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [
      dts({
        entryRoot: 'src',
        tsconfigPath: './tsconfig.json',
      }),
    ],
  });
}
