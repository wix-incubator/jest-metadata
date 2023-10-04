import type { AggregatedIdentifier } from '../ids';
import type { Metadata } from '../types';

import type { FileMetadataRegistry } from './FileMetadataRegistry';
import { ScopedMetadataRegistry } from './ScopedMetadataRegistry';

export class GlobalMetadataRegistry implements FileMetadataRegistry<AggregatedIdentifier> {
  private readonly scopes: Record<string, ScopedMetadataRegistry> = {};
  private readonly root = new ScopedMetadataRegistry('globalMetadata');

  public get(scopedId: AggregatedIdentifier): Metadata {
    const { testFilePath, identifier } = scopedId;
    const registry = testFilePath ? this.scopes[testFilePath] : this.root;

    if (!registry) {
      throw new Error(`No metadata registry found for: ${testFilePath}`);
    }

    return registry.get(identifier);
  }

  public register(scopedId: AggregatedIdentifier, metadata: Metadata): void {
    const { testFilePath, identifier } = scopedId;
    if (!testFilePath) {
      return this.root.register(identifier, metadata);
    }

    if (!this.scopes[testFilePath]) {
      this.scopes[testFilePath] = new ScopedMetadataRegistry(testFilePath);
    }

    const registry = this.scopes[testFilePath];
    registry.register(identifier, metadata);
  }

  public *all(): IterableIterator<Metadata> {
    yield* this.root.all();

    for (const registry of Object.values(this.scopes)) {
      yield* registry.all();
    }
  }
}
