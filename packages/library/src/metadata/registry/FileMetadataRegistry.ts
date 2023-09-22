import type { Metadata } from '../types';

export interface FileMetadataRegistry<Identifier> {
  get(scopedId: Identifier): Metadata;
  register(scopedId: Identifier, metadata: Metadata): void;
  all(): IterableIterator<Metadata>;
}
