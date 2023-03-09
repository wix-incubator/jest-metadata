import debug from 'debug';
import node_ipc from 'node-ipc';

import { JestMetadataError } from '../errors';
import { Event } from '../events';
import { Emitter } from '../types';
import { sendAsyncMessage } from './utils/sendAsyncMessage';

const log = debug('jest-metadata:ipc:client');

type IPC = Omit<typeof node_ipc, 'IPC'>;
type IPCConnection = (typeof node_ipc)['of'][string];

export type IPCClientConfig = {
  clientId: string;
  serverId: string;
  emitter: Emitter;
};

export class IPCClient {
  private readonly _ipc: IPC;
  private readonly _id: string;
  private readonly _serverId: string;
  private readonly _emitter: Emitter;

  private _serverConnection?: IPCConnection;

  constructor(config: IPCClientConfig) {
    this._ipc = new node_ipc.IPC();
    this._id = config.clientId;
    this._serverId = config.serverId;
    this._emitter = config.emitter;

    Object.assign(this._ipc.config, {
      id: this._id,
      appspace: 'jest-metadata.',
      logger: (msg: string) => log(msg),
      stopRetrying: 0,
      maxRetries: 0,
    });
  }

  private get connection() {
    if (!this._serverConnection) {
      throw new JestMetadataError(
        `IPC client (${this._id}) is not connected to server (${this._serverId}).`,
      );
    }

    return this._serverConnection;
  }

  async start() {
    const serverId = this._serverId;

    const connection = await new Promise<IPCConnection>((resolve, reject) => {
      const onConnect = (client: typeof node_ipc) => {
        client.of[serverId]
          // @ts-expect-error TS2339: Property 'once' does not exist on type 'Client'.
          .once('error', reject)
          .once('disconnect', () => {
            this._serverConnection = undefined;
            reject(new JestMetadataError('IPC server has unexpectedly disconnected.'));
          })
          .once('connect', () => resolve(client.of[serverId]));
      };

      // @ts-expect-error TS2769: No overload matches this call.
      this._ipc.connectTo(serverId, onConnect);
    });

    await (this._serverConnection = connection.on(
      'serverMessage',
      this._onServerMessage.bind(this),
    ));
  }

  async stop() {
    await new Promise((resolve, reject) => {
      this._ipc.of[this._serverId]
        // @ts-expect-error TS2339: Property 'once' does not exist on type 'Client'.
        .once('disconnect', resolve)
        .once('error', reject);

      this._ipc.disconnect(this._serverId);
    });

    this._serverConnection = undefined;
  }

  async send(event: Event) {
    await sendAsyncMessage(this.connection, 'clientMessage', event);
  }

  async _onServerMessage(event: Event) {
    await this._emitter.emit(event);
    this.connection.emit('serverMessageDone', event);
  }
}
