// TODO: import packageManifest from '../../package.json';
import { IPCServer } from '../ipc';
import { AssociateMetadata, QueryMetadata } from '../jest-reporter';

import { BaseRealm } from './BaseRealm';
import { isJestWorker, registerServerId } from './detect';

export class ParentProcessRealm extends BaseRealm {
  readonly type = 'parent_process';
  readonly associate = new AssociateMetadata();
  readonly query = new QueryMetadata(this.associate, this.metadataFactory.checker);

  readonly ipc = new IPCServer({
    appspace: `jest-metadata@1.0.0-`, // TODO: packageManifest.version,
    serverId: `${process.pid}`,
    emitter: this.rootEmitter,
  });

  constructor() {
    super();

    registerServerId(this.ipc.id);

    this.associate.aggregatedResult(this.aggregatedResultMetadata);

    this.setEmitter.on('*', (event) => {
      if (!isJestWorker()) {
        this.ipc.send(event);
      }
    });

    this.rootEmitter.on('*', (event) => {
      this.metadataHandler.handle(event);
    });
  }
}
