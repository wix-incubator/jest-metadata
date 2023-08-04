import { EnvironmentEventHandler } from '../jest-environment';

import { AssociateMetadata, FallbackAPI, QueryMetadata } from '../jest-reporter';
import {
  AggregatedMetadataRegistry,
  MetadataDSL,
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '../metadata';

import { AggregatedEmitter, SerialSyncEmitter } from '../utils';

export abstract class BaseRealm {
  readonly coreEmitter: MetadataEventEmitter = new SerialSyncEmitter<MetadataEvent>('core').on(
    '*',
    (event) => {
      this.metadataHandler.handle(event);
    },
  );
  readonly setEmitter: SetMetadataEventEmitter = new SerialSyncEmitter('set');
  readonly events = new AggregatedEmitter<MetadataEvent>('events').add(this.coreEmitter);

  readonly metadataRegistry = new AggregatedMetadataRegistry();
  readonly metadataFactory = new MetadataFactoryImpl(this.metadataRegistry, this.setEmitter);
  readonly aggregatedResultMetadata = this.metadataFactory.createAggregatedResultMetadata();
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.coreEmitter,
  });
  readonly metadataHandler: MetadataEventHandler = new MetadataEventHandler({
    aggregatedResultMetadata: this.aggregatedResultMetadata,
    metadataRegistry: this.metadataRegistry,
  });
  readonly associate = new AssociateMetadata(process.cwd());
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);
  readonly fallbackAPI = new FallbackAPI(this.aggregatedResultMetadata, this.coreEmitter);
  readonly metadataDSL = new MetadataDSL(
    this.coreEmitter,
    () => this.aggregatedResultMetadata.currentMetadata,
  );
}
