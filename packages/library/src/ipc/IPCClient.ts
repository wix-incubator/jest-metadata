import debug from 'debug';
import node_ipc from 'node-ipc';

import { JestMetadataError } from '../errors';
import type { MetadataEvent, MetadataEventEmitter } from '../metadata';
import { MessageQueue } from '../utils';
import { sendAsyncMessage } from './sendAsyncMessage';

const log = debug('jest-metadata:ipc:client');

type IPC = Omit<typeof node_ipc, 'IPC'>;
type IPCConnection = (typeof node_ipc)['of'][string];

export type IPCClientConfig = {
  appspace: string;
  clientId: string | undefined;
  serverId: string | undefined;
  emitter: MetadataEventEmitter;
};

export class IPCClient {
  private readonly _ipc: IPC;
  private readonly _serverId: string;
  private readonly _emitter: MetadataEventEmitter;
  private _startPromise?: Promise<void>;
  private _stopPromise?: Promise<void>;

  private readonly _messageQueue = new MessageQueue<MetadataEvent>(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    async (msg) => this._doSend(msg, 'clientMessage'),
  );

  private _doSend: (msg: unknown, type: 'clientMessage' | 'serverMessageDone') => Promise<unknown> =
    this._throwNotConnected;

  constructor(config: IPCClientConfig) {
    if (!config.serverId) {
      throw new JestMetadataError('IPC server ID is not specified when creating IPC client.');
    }

    if (!config.clientId) {
      throw new JestMetadataError('IPC client ID is not specified when creating IPC client.');
    }

    this._ipc = new node_ipc.IPC();
    this._serverId = config.serverId;
    this._emitter = config.emitter;

    Object.assign(this._ipc.config, {
      id: config.clientId,
      appspace: config.appspace,
      logger: (msg: string) => log(msg),
      stopRetrying: 0,
      maxRetries: 0,
    });
  }

  get id() {
    return this._ipc.config.id;
  }

  start(): Promise<void> {
    if (!this._startPromise) {
      this._startPromise = this._doStart();
    }

    return this._startPromise;
  }

  stop(): Promise<void> {
    if (!this._stopPromise) {
      this._stopPromise = this._doStop();
    }

    return this._stopPromise;
  }

  async send(event: MetadataEvent) {
    this._messageQueue.enqueue(event);
    return this._messageQueue.flush();
  }

  async flush(): Promise<unknown> {
    return this._messageQueue.flush();
  }

  async _doStart() {
    await this._stopPromise;
    this._stopPromise = undefined;

    const serverId = this._serverId;

    const connection = await new Promise<IPCConnection>((resolve, reject) => {
      const onConnect = (client: typeof node_ipc) => {
        client.of[serverId]
          // @ts-expect-error TS2339: Property 'once' does not exist on type 'Client'.
          .once('error', reject)
          .once('disconnect', () => {
            reject(new JestMetadataError('IPC server has unexpectedly disconnected.'));
          })
          .once('connect', () => resolve(client.of[serverId]));
      };

      // @ts-expect-error TS2769: No overload matches this call.
      this._ipc.connectTo(serverId, onConnect);
    });

    connection.on('serverMessage', this._onServerMessage.bind(this));
    this._doSend = async (event, messageType) => sendAsyncMessage(connection, messageType, event);
  }

  async _doStop() {
    await this._startPromise;
    this._startPromise = undefined;

    await this._messageQueue.flush();
    await new Promise((resolve, reject) => {
      this._ipc.of[this._serverId]
        // @ts-expect-error TS2339: Property 'once' does not exist on type 'Client'.
        .once('disconnect', resolve)
        .once('error', reject);

      this._ipc.disconnect(this._serverId);
    });

    this._doSend = this._throwNotConnected;
  }

  async _onServerMessage(event: MetadataEvent) {
    this._emitter.emit(event);
    await this._doSend({}, 'serverMessageDone');
  }

  async _throwNotConnected() {
    throw new JestMetadataError('IPC client is not connected to server.');
  }
}
