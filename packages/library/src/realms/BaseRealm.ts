import { EnvironmentEventHandler } from '../jest-environment';

import { AssociateMetadata, FallbackAPI, QueryMetadata } from '../jest-reporter';
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
  readonly coreEmitter: MetadataEventEmitter = new SerialSyncEmitter<MetadataEvent>('core').on(
    '*',
    (event: MetadataEvent) => {
      this.metadataHandler.handle(event);
    },
  );
  readonly setEmitter: SetMetadataEventEmitter = new SerialSyncEmitter<SetMetadataEvent>('set');
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
  readonly associate = new AssociateMetadata(process.cwd());
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);
  readonly fallbackAPI = new FallbackAPI(this.globalMetadata, this.coreEmitter);
  readonly metadataDSL = new MetadataDSL(
    this.coreEmitter,
    () => this.globalMetadata.currentMetadata,
  );
}
