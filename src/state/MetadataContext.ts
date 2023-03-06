import { EventQueue, ScopedMetadataRegistry } from '../services';

export type MetadataContext = {
  eventQueue: EventQueue;
  metadataRegistry: ScopedMetadataRegistry;
};
