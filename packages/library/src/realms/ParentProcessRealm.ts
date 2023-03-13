import { EnvironmentEventHandler } from '../jest-environment';
import { AssociateMetadata } from '../jest-reporter/AssociateMetadata';
import { QueryMetadata } from '../jest-reporter/QueryMetadata';
import {
  AggregatedMetadataRegistry,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactory,
  SetMetadataEventEmitter,
} from '../metadata';
import { IPCServer } from '../services';
import { SerialEmitter } from '../utils';

import { registerServerId } from './detect';

export class ParentProcessRealm {
  readonly type = 'parent_process';
  readonly rootEmitter: MetadataEventEmitter = new SerialEmitter();
  readonly setEmitter: SetMetadataEventEmitter = new SerialEmitter();
  readonly metadataRegistry = new AggregatedMetadataRegistry();
  readonly metadataFactory = new MetadataFactory(this.metadataRegistry, this.setEmitter);
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.rootEmitter,
  });
  readonly metadataHandler: MetadataEventHandler = new MetadataEventHandler({
    metadataRegistry: this.metadataRegistry,
    metadataFactory: this.metadataFactory,
  });

  readonly associate = new AssociateMetadata();
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);

  readonly ipcServer = new IPCServer({
    serverId: `${process.pid}`,
    emitter: this.rootEmitter,
  });

  constructor() {
    registerServerId(this.ipcServer.id);

    this.setEmitter.on('*', (event) => {
      this.ipcServer.send(event);
    });

    this.rootEmitter.on('*', (event) => {
      this.metadataHandler.handle(event);
    });
  }
}
