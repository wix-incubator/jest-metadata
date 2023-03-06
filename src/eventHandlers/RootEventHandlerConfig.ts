import { EventQueue, MetadataRegistry } from '../services';

export type RootEventHandlerConfig = {
  readonly eventQueue: EventQueue;
  readonly metadataRegistry: MetadataRegistry;
};
