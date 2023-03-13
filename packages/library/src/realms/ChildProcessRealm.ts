import {
  AggregatedMetadataRegistry,
  MetadataEventEmitter,
  MetadataEventHandler,
  SetMetadataEventEmitter,
  MetadataFactory,
} from '../metadata';
import { IPCClient } from '../services';
import { SerialEmitter } from '../utils';

import { getClientId, getServerId } from './detect';
import { EnvironmentEventHandler } from '../jest-environment';

export class ChildProcessRealm {
  readonly type = 'child_process';
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

  readonly ipcClient = new IPCClient({
    serverId: getServerId()!,
    clientId: getClientId(),
    emitter: this.rootEmitter,
  });

  constructor() {
    this.setEmitter.on('*', (event) => {
      // TODO: think about error handling
      return this.ipcClient.send(event);
    });

    this.rootEmitter.on('*', (event) => {
      if (!event.testFilePath || event.testFilePath === this.environmentHandler.testFilePath) {
        this.metadataHandler.handle(event);
      }
    });
  }
}
