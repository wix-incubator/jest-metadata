import type { SetMetadataEventEmitter } from './SetMetadataEventEmitter';
import type { MetadataFactory } from './MetadataFactory';
import type { MetadataSelectorFactory } from './MetadataSelector';
import type { MetadataChecker } from './MetadataChecker';

export type MetadataContext = {
  checker: MetadataChecker;
  emitter: SetMetadataEventEmitter;
  factory: MetadataFactory;
  createMetadataSelector: MetadataSelectorFactory;
};
