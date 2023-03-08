import { EventQueue, AggregatedMetadataRegistry } from '../services';

export type RootEventHandlerConfig = {
  readonly eventQueue: EventQueue;
  readonly scopedMetadataRegistry: AggregatedMetadataRegistry;
};
