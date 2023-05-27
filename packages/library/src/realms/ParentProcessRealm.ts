import { IPCServer } from '../ipc';
import { getVersion } from '../utils';

import { BaseRealm } from './BaseRealm';
import { registerServerId } from './detect';

export class ParentProcessRealm extends BaseRealm {
  readonly type = 'parent_process';

  readonly ipc = new IPCServer({
    appspace: `jest-metadata@${getVersion()}-`,
    serverId: `${process.pid}`,
    emitter: this.coreEmitter,
  });

  constructor() {
    super();

    registerServerId(this.ipc.id);
    this.associate.aggregatedResult(this.aggregatedResultMetadata);
  }
}
