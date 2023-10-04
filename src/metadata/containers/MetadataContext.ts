import type { MetadataChecker } from '../checker';
import type { MetadataFactory } from '../factory';
import type { MetadataSelectorFactory } from '../selector';
import type { SetMetadataEventEmitter } from '../types';

export type MetadataContext = {
  checker: MetadataChecker;
  emitter: SetMetadataEventEmitter;
  factory: MetadataFactory;
  createMetadataSelector: MetadataSelectorFactory;
};
