import type { Socket } from 'net';

import debug from 'debug';
import node_ipc from 'node-ipc';

import { JestMetadataError } from '../errors';
import type { MetadataEvent, MetadataEventEmitter } from '../metadata';
import { MessageQueue } from '../utils';

import { sendAsyncMessage } from './sendAsyncMessage';

const log = debug('jest-metadata:ipc:server');

type IPC = Omit<typeof node_ipc, 'IPC'>;

export type IPCServerConfig = {
  appspace: string;
  serverId: string;
  emitter: MetadataEventEmitter;
};

class SocketQueue extends MessageQueue<MetadataEvent> {
  constructor(public readonly socket: Socket) {
    super((event) => sendAsyncMessage(socket, 'serverMessage', event));
  }
}

export class IPCServer {
  private _active = false;
  private readonly _sockets = new Map<Socket, SocketQueue>();
  private readonly _socketsByFile = new Map<string, SocketQueue>();
  private readonly _filesBySocket = new Map<SocketQueue, string>();
  private readonly _ipc: IPC;
  private readonly _emitter: MetadataEventEmitter;

  constructor(config: IPCServerConfig) {
    this._ipc = new node_ipc.IPC();
    this._ipc.config.id = config.serverId;
    this._ipc.config.appspace = config.appspace;
    this._ipc.config.logger = (msg) => log(msg);
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
      this._ipc.server
        .on('connect', (socket) => {
          this._sockets.set(socket, new SocketQueue(socket));
        })
        .on('socket.disconnected', (disconnected) => {
          const queue = this._sockets.get(disconnected);
          if (!queue) {
            throw new JestMetadataError('IPC server disconnected from unknown socket.');
          }

          const testFilePath = this._filesBySocket.get(queue);
          if (testFilePath) {
            this._socketsByFile.delete(testFilePath);
            this._filesBySocket.delete(queue);
          }
        })
        .on('clientMessage', this._onClientMessage.bind(this));

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
      return this._broadcast(event);
    }

    const connection = this._socketsByFile.get(event.testFilePath);
    if (!connection) {
      throw new JestMetadataError(
        'IPC server is not connected to client for test file: ' + event.testFilePath,
      );
    }

    connection.enqueue(event);
  }

  async flush(): Promise<unknown> {
    return Promise.all(Object.values(this._sockets).map((connection) => connection.flush()));
  }

  private _broadcast(event: MetadataEvent): void {
    for (const connection of Object.values(this._sockets)) {
      connection.enqueue(event);
    }
  }

  private _onClientMessage(event: MetadataEvent, socket: Socket) {
    log('Received client message: %O', event);

    if (event.type === 'add_test_file') {
      const socketQueue = this._sockets.get(socket);
      if (!socketQueue) {
        throw new JestMetadataError(
          'Internal error: socket queue not found for event: ' + JSON.stringify(event),
        );
      }

      this._socketsByFile.set(event.testFilePath, socketQueue);
      this._filesBySocket.set(socketQueue, event.testFilePath);
    }

    this._emitter.emit(event);
    this._ipc.server.emit(socket, 'clientMessageDone');
  }
}
