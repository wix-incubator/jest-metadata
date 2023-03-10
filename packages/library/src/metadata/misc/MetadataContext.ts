import type { AggregatedMetadataRegistry } from './AggregatedMetadataRegistry';
import type { MetadataEventEmitter } from './MetadataEventEmitter';

export type MetadataContext = {
  emitter: MetadataEventEmitter;
  aggregatedMetadataRegistry: AggregatedMetadataRegistry;
};
