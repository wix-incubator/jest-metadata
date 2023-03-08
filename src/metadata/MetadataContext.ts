import { AggregatedMetadataRegistry, EventQueue } from '../services';

export type MetadataContext = {
  eventQueue: EventQueue;
  metadataRegistry: AggregatedMetadataRegistry;
};
