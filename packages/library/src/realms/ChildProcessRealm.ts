// TODO: import packageManifest from '../../package.json';
import { IPCClient } from '../ipc';
import { EnvironmentEventHandler } from '../jest-environment';

import { BaseRealm } from './BaseRealm';
import { getClientId, getServerId } from './detect';

export class ChildProcessRealm extends BaseRealm {
  readonly type = 'child_process';
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.rootEmitter,
  });

  readonly ipc = new IPCClient({
    appspace: `jest-metadata@1.0.0-`, // TODO: packageManifest.version,
    serverId: getServerId()!,
    clientId: getClientId(),
    emitter: this.rootEmitter,
  });

  constructor() {
    super();

    this.setEmitter.on('*', (event) => {
      // TODO: think about error handling
      return this.ipc.send(event);
    });

    this.rootEmitter.on('*', (event) => {
      if (!event.testFilePath || event.testFilePath === this.environmentHandler.testFilePath) {
        this.metadataHandler.handle(event);
      }
    });
  }
}
