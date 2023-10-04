import { EnvironmentEventHandler } from '../jest-environment';

import { AssociateMetadata, QueryMetadata } from '../jest-reporter';
import {
  GlobalMetadataRegistry,
  MetadataDSL,
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEvent,
  SetMetadataEventEmitter,
} from '../metadata';

import { AggregatedEmitter, SerialSyncEmitter } from '../utils';

export abstract class BaseRealm {
  readonly coreEmitter = new SerialSyncEmitter<MetadataEvent>('core').on(
    '*',
    (event: MetadataEvent) => {
      this.metadataHandler.handle(event);
    },
  ) as MetadataEventEmitter;
  readonly setEmitter = new SerialSyncEmitter<SetMetadataEvent>('set') as SetMetadataEventEmitter;
  readonly events = new AggregatedEmitter<MetadataEvent>('events').add(this.coreEmitter);

  readonly metadataRegistry = new GlobalMetadataRegistry();
  readonly metadataFactory = new MetadataFactoryImpl(this.metadataRegistry, this.setEmitter);
  readonly globalMetadata = this.metadataFactory.createGlobalMetadata();
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.coreEmitter,
  });
  readonly metadataHandler: MetadataEventHandler = new MetadataEventHandler({
    globalMetadata: this.globalMetadata,
    metadataRegistry: this.metadataRegistry,
  });
  readonly metadataDSL = new MetadataDSL(
    this.coreEmitter,
    () => this.globalMetadata.currentMetadata,
  );
  readonly associate = new AssociateMetadata();
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);
}
