import { IPCClient } from '../ipc';
import { EnvironmentEventHandler } from '../jest-environment';
import { getVersion } from '../utils';

import { BaseRealm } from './BaseRealm';
import { getClientId, getServerId } from './detect';

export class ChildProcessRealm extends BaseRealm {
  readonly type = 'child_process' as const;

  readonly environmentHandler: EnvironmentEventHandler = new EnvironmentEventHandler({
    emitter: this.coreEmitter,
  });

  readonly ipc = new IPCClient({
    appspace: `jest-metadata@${getVersion()}-`,
    serverId: getServerId()!,
    clientId: getClientId(),
    globalMetadata: this.globalMetadata,
  });

  constructor() {
    super();

    this.events.on('*', (event) => {
      return this.ipc.enqueue(event);
    });
  }
}
