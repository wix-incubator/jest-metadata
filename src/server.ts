// eslint-disable-next-line node/no-unpublished-import
import type { Config, Reporter } from '@jest/reporters';
import { IPCServer } from './services';

export class JestMetadataServer implements Reporter {
  private readonly _ipcServer: IPCServer;
  constructor(globalConfig: Config.GlobalConfig) {
    const seed = globalConfig.seed ?? +Math.random().toString().slice(2);

    this._ipcServer = new IPCServer({
      serverId: 'jest-metadata-' + seed,
      emitter: {} as any,
    });
  }

  getLastError() {
    return;
  }

  async onRunStart() {
    await this._ipcServer.start();
  }

  async onRunComplete() {
    await this._ipcServer.stop();
  }
}
