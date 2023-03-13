import debug from 'debug';
import node_ipc from 'node-ipc';

import type { Socket } from 'net';
import { JestMetadataError } from '../errors';
import type { MetadataEvent, MetadataEventEmitter } from '../metadata';
import { MessageQueue } from '../utils';

import { sendAsyncMessage } from './utils/sendAsyncMessage';

const log = debug('jest-metadata:ipc:server');

type IPC = Omit<typeof node_ipc, 'IPC'>;

export type IPCServerConfig = {
  serverId: string;
  emitter: MetadataEventEmitter;
};

export class IPCServer {
  private _active = false;
  private readonly _ipc: IPC;
  private readonly _connections: Record<string, MessageQueue<MetadataEvent>>;
  private readonly _emitter: MetadataEventEmitter;

  constructor(config: IPCServerConfig) {
    this._ipc = new node_ipc.IPC();
    this._ipc.config.id = config.serverId;
    this._ipc.config.appspace = 'jest-metadata.';
    this._ipc.config.logger = (msg) => log(msg);

    this._connections = {};
    this._emitter = config.emitter;
  }

  get id(): string {
    return this._ipc.config.id;
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

  async send(event: MetadataEvent) {
    if (!event.testFilePath) {
      return this.broadcast(event);
    }

    const connection = this._connections[event.testFilePath];
    if (!connection) {
      throw new JestMetadataError(
        'IPC server is not connected to client for test file: ' + event.testFilePath,
      );
    }

    connection.enqueue(event);
  }

  broadcast(event: MetadataEvent): void {
    for (const connection of Object.values(this._connections)) {
      connection.enqueue(event);
    }
  }

  private _onClientMessage(event: MetadataEvent, socket: Socket) {
    if (event.type === 'test_environment_created') {
      this._connections[event.testFilePath] = new MessageQueue<MetadataEvent>(async () => {
        await sendAsyncMessage(socket, 'serverMessage', event);
      });
    }

    this._emitter.emit(event);
    this._ipc.server.emit(socket, 'clientMessageDone');
  }
}

module.exports = IPCServer;
