# Syllst Monorepo

**Syllabus Syntax Tree (syllst)** - A monorepo containing the syllst ecosystem for language learning syllabi.

## Packages

### Core

- **[@syllst/core](./packages/syllst/)** - Core type definitions and Zod validation schemas
- **[@syllst/processor](./packages/syllst-processor/)** - MDX parsing and transformation pipeline (coming soon)

### Examples

- **[Examples](./examples/)** - Example syllabi and usage patterns

## Getting Started

### Installation

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Type Check

```bash
pnpm typecheck
```

## Package Development

Each package in `packages/` is independently versioned and can be published to npm.

### Adding a New Package

1. Create a new directory in `packages/`
2. Add a `package.json` with the package configuration
3. The package will automatically be included in the workspace

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
