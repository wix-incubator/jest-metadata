import { EventQueue, MetadataRegistry } from '../services';

export type MetadataContext = {
  eventQueue: EventQueue;
  metadataRegistry: MetadataRegistry;
};
