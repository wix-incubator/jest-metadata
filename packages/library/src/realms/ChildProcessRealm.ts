import { IPCClient } from '../ipc';
import { EnvironmentEventHandler } from '../jest-environment';
import { getVersion } from '../utils';

import { BaseRealm } from './BaseRealm';
import { getClientId, getServerId } from './detect';

export class ChildProcessRealm extends BaseRealm {
  readonly type = 'child_process';
  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.rootEmitter,
  });

  readonly ipc = new IPCClient({
    appspace: `jest-metadata@${getVersion()}-`,
    serverId: getServerId()!,
    clientId: getClientId(),
  });

  constructor() {
    super();

    this.setEmitter.on('*', (event) => {
      // TODO: think about error handling
      return this.ipc.send(event);
    });

    this.rootEmitter.on('*', (event) => {
      this.metadataHandler.handle(event);
      return this.ipc.send(event);
    });
  }
}
