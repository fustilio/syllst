import type { WordListItem, WordListSet } from '../types/word-lists';

export function resolveItemPartOfSpeech(
  set: Pick<WordListSet, 'partOfSpeech'>,
  item: Pick<WordListItem, 'partOfSpeech'>,
): string | undefined {
  return item.partOfSpeech ?? set.partOfSpeech;
}
