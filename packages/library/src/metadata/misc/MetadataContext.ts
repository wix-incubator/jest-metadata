import type { AggregatedMetadataRegistry } from './AggregatedMetadataRegistry';
import type { MetadataEventEmitter } from '../events/MetadataEventEmitter';

export type MetadataContext = {
  emitter: MetadataEventEmitter;
  aggregatedMetadataRegistry: AggregatedMetadataRegistry;
};
