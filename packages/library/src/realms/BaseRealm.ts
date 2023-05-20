import { EnvironmentEventHandler } from '../jest-environment';

import { AssociateMetadata, QueryMetadata } from '../jest-reporter';
import {
  AggregatedMetadataRegistry,
  MetadataDSL,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  ReadonlyMetadataEventEmitter,
  SetMetadataEventEmitter,
} from '../metadata';

import { combineEmitters, SerialEmitter } from '../utils';

export abstract class BaseRealm {
  readonly rootEmitter: MetadataEventEmitter = new SerialEmitter('root');
  readonly setEmitter: SetMetadataEventEmitter = new SerialEmitter('set');
  readonly combinedEmitter: ReadonlyMetadataEventEmitter = combineEmitters(
    this.rootEmitter,
    this.setEmitter,
  );
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
  readonly associate = new AssociateMetadata();
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);
  readonly metadataDSL = new MetadataDSL(
    this.rootEmitter,
    () => this.aggregatedResultMetadata.currentMetadata,
  );
}
