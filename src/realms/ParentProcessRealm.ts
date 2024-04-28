import { IPCServer } from '../ipc';
import { FallbackAPI, ReporterServer } from '../jest-reporter';
import { getVersion } from '../utils';

import { BaseRealm } from './BaseRealm';
import { registerServerId } from './detect';

export class ParentProcessRealm extends BaseRealm {
  readonly type = 'parent_process' as const;

  readonly ipc = new IPCServer({
    appspace: `jest-metadata@${getVersion()}-`,
    serverId: `${process.pid}`,
    emitter: this.coreEmitter,
    globalMetadata: this.globalMetadata,
  });

  readonly fallbackAPI = new FallbackAPI(this.globalMetadata, this.coreEmitter);

  readonly reporterServer = new ReporterServer({
    associate: this.associate,
    fallbackAPI: this.fallbackAPI,
    ipc: this.ipc,
    rootDir: process.cwd(),
  });

  constructor() {
    super();

    registerServerId(this.ipc.id);
    this.associate.globalMetadata(this.globalMetadata);
  }
}
