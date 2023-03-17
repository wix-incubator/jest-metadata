import type { Metadata } from '../types';

export interface MetadataRegistry<Identifier> {
  get(scopedId: Identifier): Metadata;
  register(scopedId: Identifier, metadata: Metadata): void;
  all(): IterableIterator<Metadata>;
}
