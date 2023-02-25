import { Event } from '../events';
import { MetadataRegistry } from '../services';

export type RootEventHandlerConfig = {
  readonly emit: (event: Event) => void;
  readonly metadataRegistry: MetadataRegistry;
};
