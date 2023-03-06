import { EventQueue, ScopedMetadataRegistry } from '../services';

export type RootEventHandlerConfig = {
  readonly eventQueue: EventQueue;
  readonly scopedMetadataRegistry: ScopedMetadataRegistry;
};
