import { Metadata } from '../state';

export class MetadataRegistry {
  private readonly metadata: Record<string, Metadata> = {};

  public get(id: string): Metadata {
    return this.metadata[id];
  }

  public register(id: string, metadata: Metadata): void {
    this.metadata[id] = metadata;
  }
}
