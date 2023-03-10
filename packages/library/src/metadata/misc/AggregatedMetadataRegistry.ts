import { Metadata, AggregatedIdentifier } from '../index';

// TODO: maybe drop ambiguous signature and use only AggregatedIdentifier
type RawScopedIdentifier = string | AggregatedIdentifier;

export class AggregatedMetadataRegistry {
  private readonly scopes: Record<string, MetadataRegistry> = {};

  public get(scopedId: RawScopedIdentifier): Metadata {
    const { testFilePath, identifier } = AggregatedIdentifier.normalize(scopedId);
    const registry = this.scopes[testFilePath];

    if (!registry) {
      throw new Error(`No metadata registry found for: ${testFilePath}`);
    }

    return registry.get(identifier);
  }

  public register(scopedId: RawScopedIdentifier, metadata: Metadata): void {
    const { testFilePath, identifier } = AggregatedIdentifier.normalize(scopedId);
    if (!this.scopes[testFilePath]) {
      this.scopes[testFilePath] = new MetadataRegistry(testFilePath);
    }

    const registry = this.scopes[testFilePath];
    registry.register(identifier, metadata);
  }
}

export class MetadataRegistry {
  private readonly metadata: Record<string, Metadata> = {};

  constructor(private readonly scope: string) {}

  public get(id: string): Metadata {
    const metadata = this.metadata[id];
    if (!metadata) {
      throw new Error(`No metadata found in ${this.scope} for id: ${id}`);
    }

    return this.metadata[id];
  }

  public register(id: string, metadata: Metadata): void {
    this.metadata[id] = metadata;
  }
}
