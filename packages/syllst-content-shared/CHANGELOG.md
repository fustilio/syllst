# @syllst/content-shared

## 1.0.0

### Major Changes

- Breaking change: Removed word list utilities from @syllst/content-shared. Word list functionality has been extracted to dedicated @syllst/word-lists package.

  To migrate:

  - Replace `@syllst/content-shared` word list imports with `@syllst/word-lists`
  - @syllst/content-shared now only exports: loader utilities (createContentLoader), skill taxonomy (SKILL_MAP), and content types (SyllabusConfig, ContentLoader, LoadedLesson)

## 0.4.0

### Minor Changes

- New package: Migrated @syllst/content-shared from polyglot-bundles to syllst monorepo with all utilities including loader utilities, skill taxonomy, word list types, word ID utilities, ingestion converters, and Node.js/browser loaders.
