import type { Metadata } from '../types';

export class ScopedMetadataRegistry {
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

  public *all(): IterableIterator<Metadata> {
    yield* Object.values(this.metadata);
  }
}
