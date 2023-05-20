import type { Socket } from 'net';

import node_ipc from 'node-ipc';
import stripAnsi from 'strip-ansi';

import type { MetadataEvent, MetadataEventEmitter } from '../metadata';
import { logger } from '../utils';

const log = logger.child({ cat: 'ipc', tid: 'ipc-server' });

type IPC = Omit<typeof node_ipc, 'IPC'>;

export type IPCServerConfig = {
  appspace: string;
  serverId: string;
  emitter: MetadataEventEmitter;
};

export class IPCServer {
  private _startPromise?: Promise<void>;
  private _stopPromise?: Promise<void>;
  private readonly _ipc: IPC;
  private readonly _emitter: MetadataEventEmitter;

  constructor(config: IPCServerConfig) {
    this._ipc = new node_ipc.IPC();
    this._ipc.config.id = config.serverId;
    this._ipc.config.appspace = config.appspace;
    this._ipc.config.logger = (msg) => log.trace(stripAnsi(msg));
    this._emitter = config.emitter;
  }

  get id(): string {
    return this._ipc.config.id;
  }

  async start() {
    if (!this._startPromise) {
      this._startPromise = log.trace.complete('start', this._doStart());
    }

    return this._startPromise;
  }

  async stop() {
    if (!this._stopPromise) {
      this._stopPromise = log.trace.complete('stop', this._doStop());
    }

    return this._stopPromise;
  }

  flush() {
    /* no-op, maybe we should delete this method */
  }

  private async _doStart(): Promise<void> {
    await this._stopPromise;
    this._stopPromise = undefined;

    await new Promise((resolve, reject) => {
      this._ipc.serve(() => resolve(void 0));
      this._ipc.server.on('clientMessage', this._onClientMessage.bind(this));

      // @ts-expect-error TS2339: Property 'once' does not exist on type 'Server'.
      this._ipc.server.once('error', reject);
      this._ipc.server.start();
    });
  }

  private async _doStop(): Promise<void> {
    await this._startPromise;
    this._startPromise = undefined;
    await new Promise((resolve, reject) => {
      // @ts-expect-error TS2339: Property 'server' does not exist on type 'Server'.
      this._ipc.server.server.close((e) => (e ? reject(e) : resolve()));
      this._ipc.server.stop();
    });
  }

  private _onClientMessage(event: MetadataEvent, socket: Socket) {
    this._emitter.emit(event);
    this._ipc.server.emit(socket, 'clientMessageDone');
  }
}
