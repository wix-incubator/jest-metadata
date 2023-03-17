import { EnvironmentEventHandler } from '../jest-environment';

import {
  AggregatedMetadataRegistry,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '../metadata';

import { SerialEmitter } from '../utils';

export abstract class BaseRealm {
  readonly rootEmitter: MetadataEventEmitter = new SerialEmitter();
  readonly setEmitter: SetMetadataEventEmitter = new SerialEmitter();
  readonly metadataRegistry = new AggregatedMetadataRegistry();
  readonly metadataFactory = new MetadataFactoryImpl(this.metadataRegistry, this.setEmitter);
  readonly aggregatedResultMetadata = this.metadataFactory.createAggregatedResultMetadata();
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.rootEmitter,
  });
  readonly metadataHandler: MetadataEventHandler = new MetadataEventHandler({
    aggregatedResultMetadata: this.aggregatedResultMetadata,
    metadataRegistry: this.metadataRegistry,
  });
}
