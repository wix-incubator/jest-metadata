import { Metadata, ScopedIdentifier } from '../state';

import { MetadataRegistry } from './MetadataRegistry';

type RawScopedIdentifier = string | ScopedIdentifier;

export class ScopedMetadataRegistry {
  private readonly scopes: Record<string, MetadataRegistry> = {};

  public get(scopedId: RawScopedIdentifier): Metadata {
    const { testFilePath, identifier } = ScopedIdentifier.normalize(scopedId);
    const registry = this.scopes[testFilePath];

    if (!registry) {
      throw new Error(`No metadata registry found for: ${testFilePath}`);
    }

    return registry.get(identifier);
  }

  public register(scopedId: RawScopedIdentifier, metadata: Metadata): void {
    const { testFilePath, identifier } = ScopedIdentifier.normalize(scopedId);
    if (!this.scopes[testFilePath]) {
      this.scopes[testFilePath] = new MetadataRegistry(testFilePath);
    }

    const registry = this.scopes[testFilePath];
    registry.register(identifier, metadata);
  }
}
