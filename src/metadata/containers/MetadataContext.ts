import type { MetadataChecker } from '../checker';
import type { MetadataFactory } from '../factory';
import type { MetadataSelectorFactory } from '../selector';
import type { WriteMetadataEventEmitter } from '../types';

export type MetadataContext = {
  checker: MetadataChecker;
  emitter: WriteMetadataEventEmitter;
  factory: MetadataFactory;
  createMetadataSelector: MetadataSelectorFactory;
};
