/**
 * @syllst/word-lists
 *
 * Word list types, loaders, and utilities for syllst.
 */

// Types
export * from './types/word-lists';

// Utils
export * from './utils/parse-word-list';
export * from './utils/resolve';
export * from './utils/word-lists';
export * from './utils/word-ids';
export * from './utils/word-list-ingestion';
export * from './utils/word-lists-loader';
export * from './utils/word-lists-utils';
export {
  createBrowserWordListLoader,
  createNodeWordListLoader,
  type BrowserWordListLoaderConfig,
  type NodeWordListLoaderConfig,
} from './utils/word-lists-browser-loader';

// Catalog (new descriptor-based lazy loading)
export {
  createWordListCatalog,
  jsonDescriptor,
  parsedJsonDescriptor,
  type WordListCatalog,
  type WordListSetDescriptor,
  type WordListSource,
} from './utils/word-list-catalog';
