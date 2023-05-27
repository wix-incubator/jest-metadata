import { EnvironmentEventHandler } from '../jest-environment';

import { AssociateMetadata, QueryMetadata } from '../jest-reporter';
import {
  AggregatedMetadataRegistry,
  MetadataDSL,
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '../metadata';

import { CombinedEmitter, SerialEmitter } from '../utils';

export abstract class BaseRealm {
  readonly coreEmitter: MetadataEventEmitter = new SerialEmitter<MetadataEvent>('core').on(
    '*',
    (event) => {
      this.metadataHandler.handle(event);
    },
  );
  readonly setEmitter: SetMetadataEventEmitter = new SerialEmitter('set');
  readonly events = new CombinedEmitter<MetadataEvent>().add(this.coreEmitter);

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
  readonly associate = new AssociateMetadata();
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);
  readonly metadataDSL = new MetadataDSL(
    this.coreEmitter,
    () => this.aggregatedResultMetadata.currentMetadata,
  );
}
