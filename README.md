# Syllst Monorepo

**Syllabus Syntax Tree (syllst)** — A monorepo for the syllst ecosystem of language learning curriculum packages.

## Packages

### Core

| Package | Version | Description |
|---------|---------|-------------|
| `[@syllst/core](./packages/syllst/)` | 0.6.0 | Unist-based type definitions and Zod validation schemas |
| `[@syllst/processor](./packages/syllst-processor/)` | 0.5.6 | MDX parsing and transformation pipeline |
| `[@syllst/glost](./packages/syllst-glost/)` | 0.5.5 | GLOST word-level annotation plugin for syllst |

### Language Packages

| Package | Version | Description |
|---------|---------|-------------|
| `[@syllst/word-lists](./packages/syllst-word-lists/)` | 0.2.0 | Word list types, loaders, and utilities |

> **Language content** has moved to [polyglot-bundles](../polyglot-bundles/): `@polyglot-bundles/{ja,ka,ko,th}-syllabi`. `syllst` is now engine-only.

### Supporting Packages

| Package | Version | Description |
|---------|---------|-------------|
| `[@syllst/xapi](./packages/syllst-xapi/)` | 0.4.4 | xAPI profile for language learning — verbs, activity types, extensions, and Zod schemas |
| `[@syllst/content-shared](./packages/syllst-content-shared/)` | 1.0.0 | Shared utilities for SYLLST content packages |
| `[@syllst/validator](./packages/validator/)` | — | CLI tool for validating Syllst MDX content |

## Dependency Graph

```
@syllst/core (0.6.0)
  ├── @syllst/processor ──────────► @syllst/core
  ├── @syllst/glost ──────────────► @syllst/core
  ├── @syllst/xapi ───────────────► @syllst/core
  ├── @syllst/content-shared ─────► @syllst/core
  │                                 @syllst/processor
  └── @syllst/word-lists ─────────► @syllst/core

@syllst/processor (0.5.6)
  └── @syllst/core (0.6.0)
```

## Development

```bash
# Install
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check all packages
pnpm typecheck

# Clean all dist outputs
pnpm clean

# Version and publish (requires 2FA)
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

## Publishing

Each package is independently versioned. Use [changesets](https://github.com/changesets/changesets):

```bash
# Select packages to publish
pnpm changeset

# Bump versions
pnpm changeset version

# Build and publish
pnpm build
pnpm changeset publish
```

> **Note:** npm publishing requires 2FA. Run `pnpm changeset publish` manually.

## Adding a Language Package

1. Create `packages/syllst-{lang}/` with `package.json`, `vite.config.ts`, and `src/`
2. Add to `pnpm-workspace.yaml`
3. Run `pnpm install` to link
4. Add a `README.md` using `pnpm generate:readme {lang}`
5. Add changeset before publishing

## License

MIT