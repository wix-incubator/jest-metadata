import debug from 'debug';
import node_ipc from 'node-ipc';

import type { Socket } from 'net';
import { JestMetadataError } from '../errors';
import { Event } from '../events';
import { Emitter } from '../types';
import { sendAsyncMessage } from './utils/sendAsyncMessage';

const log = debug('jest-metadata:ipc:server');

type IPC = Omit<typeof node_ipc, 'IPC'>;

export type IPCServerConfig = {
  serverId: string;
  emitter: Emitter;
};

export class IPCServer {
  private _active = false;
  private readonly _ipc: IPC;
  private readonly _connections: Record<string, Socket>;
  private readonly _emitter: Emitter;

  constructor(config: IPCServerConfig) {
    this._ipc = new node_ipc.IPC();
    this._ipc.config.id = config.serverId;
    this._ipc.config.appspace = 'detox.';
    this._ipc.config.logger = (msg) => log(msg);

    this._connections = {};
    this._emitter = config.emitter;
  }

  async start() {
    if (this._active) {
      return;
    }

    await new Promise((resolve, reject) => {
      this._ipc.serve(() => resolve(void 0));
      this._ipc.server.on('clientMessage', this._onClientMessage.bind(this));
      // @ts-expect-error TS2339: Property 'once' does not exist on type 'Server'.
      this._ipc.server.once('error', reject);
      this._ipc.server.start();
    });

    this._active = true;
  }

  async stop() {
    if (this._active) {
      this._active = false;

      await new Promise((resolve, reject) => {
        // @ts-expect-error TS2339: Property 'server' does not exist on type 'Server'.
        this._ipc.server.server.close((e) => (e ? reject(e) : resolve()));
        this._ipc.server.stop();
      });
    }
  }

  async send(event: Event) {
    if (!event.testFilePath) {
      return this.broadcast(event);
    }

    const connection = this._connections[event.testFilePath];
    if (!connection) {
      throw new JestMetadataError(
        'IPC server is not connected to client for test file: ' + event.testFilePath,
      );
    }

    await sendAsyncMessage(connection, 'serverMessage', event);
  }

  broadcast(event: Event): void {
    this._ipc.server.broadcast('serverMessage', event);
    // TODO: add async-await support to prevent race conditions
  }

  private _onClientMessage(event: Event, socket: Socket) {
    if (event.type === 'test_environment_created') {
      this._connections[event.testFilePath] = socket;
    }

    this._emitter.emit(event);
    this._ipc.server.emit(socket, 'clientMessageDone');
  }
}

module.exports = IPCServer;
