# Syllst Monorepo

**Syllabus Syntax Tree (syllst)** — A monorepo for the syllst ecosystem of language learning curriculum packages.

## Packages

Versions are not listed here — `package.json` in each package directory and the
[npm registry](https://www.npmjs.com/org/syllst) are the source of truth.

### Core

| Package | Description |
|---------|-------------|
| [`@syllst/core`](./packages/syllst/) | Unist-based type definitions and Zod validation schemas |
| [`@syllst/processor`](./packages/syllst-processor/) | MDX parsing and transformation pipeline |
| [`@syllst/glost`](./packages/syllst-glost/) | GLOST word-level annotation plugin for syllst |

### Content Packages

| Package | Description |
|---------|-------------|
| [`@syllst/word-lists`](./packages/syllst-word-lists/) | Word list types, loaders, and utilities |

> **Language content** has moved to [polyglot-bundles](../polyglot-bundles/): `@polyglot-bundles/{ja,ka,ko,th}-syllabi`. `syllst` is now engine-only.

### Supporting Packages

| Package | Description |
|---------|-------------|
| [`@syllst/xapi`](./packages/syllst-xapi/) | xAPI profile for language learning — verbs, activity types, extensions, and Zod schemas |
| [`@syllst/content-shared`](./packages/syllst-content-shared/) | Shared utilities for SYLLST content packages |
| [`@syllst/validator`](./packages/validator/) | CLI tool (`syllst-validate`) for validating Syllst MDX content |
| [`@syllst/compare`](./packages/syllst-compare/) | Answer-comparison strategies for exercises |
| [`@syllst/srs`](./packages/syllst-srs/) | Spaced-repetition card generation |
| [`@syllst/ja`](./packages/syllst-ja/) | Japanese-specific comparison and normalization helpers |

## Dependency Graph

```
@syllst/core
  ├── @syllst/processor ──────────► @syllst/core
  ├── @syllst/glost ──────────────► @syllst/core   (+ optional @glotblocks/glost peers)
  ├── @syllst/xapi ───────────────► @syllst/core
  ├── @syllst/content-shared ─────► @syllst/core, @syllst/processor
  ├── @syllst/word-lists ─────────► @syllst/core
  ├── @syllst/compare ────────────► @syllst/core
  ├── @syllst/srs ────────────────► @syllst/core
  └── @syllst/ja ─────────────────► @syllst/core, @syllst/compare

@syllst/validator ────────────────► @syllst/processor
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

# Check publish health (exports, files, types)
pnpm lint:publish

# Clean all dist outputs
pnpm clean
```

## Publishing

Each package is independently versioned with
[changesets](https://github.com/changesets/changesets), and releases are
automated by GitHub Actions (`.github/workflows/release.yml`) — nobody
publishes from a laptop.

1. **In your PR**, add a changeset describing the change and bump type:

   ```bash
   pnpm changeset
   ```

   Commit the generated `.changeset/*.md` file with your change.

2. **On merge to `main`**, the release workflow opens (or refreshes) a
   **"chore: version packages"** Version PR that applies all pending
   changesets: version bumps + `CHANGELOG.md` entries.

3. **Merging the Version PR publishes to npm.** The workflow builds, runs the
   publint gate, and runs `changeset publish` using npm **OIDC trusted
   publishing** — there is no `NPM_TOKEN` secret and no 2FA prompt.

### One-time setup per package

Each `@syllst/*` package needs a trusted publisher configured on npmjs.com
(package → Settings → Trusted publisher): repository `fustilio/syllst`,
workflow `release.yml`. A brand-new package must be published once manually
(`npm publish --access public` with OTP) before OIDC can take over.

## Adding a Package

1. Create `packages/syllst-{name}/` with `package.json`, `vite.config.ts`, and `src/`
2. Run `pnpm install` to link (the workspace glob `packages/*` picks it up)
3. Add it to the Packages table and dependency graph above
4. Add a changeset; configure its trusted publisher after the first manual publish

## License

MIT
