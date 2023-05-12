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
    emitter: this.rootEmitter,
  });

  constructor() {
    super();

    this.setEmitter.on('*', (event) => {
      // TODO: think about error handling
      return this.ipc.send(event);
    });

    this.rootEmitter.on('*', (event) => {
      // if the event is global (aggregated result), we need to handle it
      // otherwise, we need to handle it only if the test file path matches
      if (!event.testFilePath || event.testFilePath === this.environmentHandler.testFilePath) {
        this.metadataHandler.handle(event);
      }
    });
  }
}
