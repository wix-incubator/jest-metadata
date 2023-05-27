import node_ipc from 'node-ipc';
import stripAnsi from 'strip-ansi';

import { JestMetadataError } from '../errors';
import type { MetadataEvent } from '../metadata';
import { logger, MessageQueue, optimizeForLogger } from '../utils';
import { sendAsyncMessage } from './sendAsyncMessage';

const log = logger.child({ cat: 'ipc', tid: 'ipc-client' });

type IPC = Omit<typeof node_ipc, 'IPC'>;
type IPCConnection = (typeof node_ipc)['of'][string];

export type IPCClientConfig = {
  appspace: string;
  clientId: string | undefined;
  serverId: string | undefined;
};

const __SEND = optimizeForLogger((msg: unknown) => ({ msg }));

export class IPCClient {
  private readonly _ipc: IPC;
  private readonly _serverId: string;
  private _startPromise?: Promise<void>;
  private _stopPromise?: Promise<void>;

  private readonly _messageQueue = new MessageQueue<MetadataEvent>(this.start(), async (msg) =>
    log.trace.complete(__SEND(msg), 'send', this._doSend(msg)),
  );

  private _doSend: (msg: unknown) => Promise<unknown> = this._throwNotConnected;

  constructor(config: IPCClientConfig) {
    if (!config.serverId) {
      throw new JestMetadataError('IPC server ID is not specified when creating IPC client.');
    }

    if (!config.clientId) {
      throw new JestMetadataError('IPC client ID is not specified when creating IPC client.');
    }

    this._ipc = new node_ipc.IPC();
    this._serverId = config.serverId;

    Object.assign(this._ipc.config, {
      id: config.clientId,
      appspace: config.appspace,
      logger: optimizeForLogger((msg: string) => log.trace(stripAnsi(msg))),
      stopRetrying: 0,
      maxRetries: 0,
    });
  }

  get id() {
    return this._ipc.config.id;
  }

  start(): Promise<void> {
    if (!this._startPromise) {
      this._startPromise = log.trace.complete('start', this._doStart());
    }

    return this._startPromise;
  }

  stop(): Promise<void> {
    if (!this._stopPromise) {
      this._stopPromise = log.trace.complete('stop', this._doStop());
    }

    return this._stopPromise;
  }

  async send(event: MetadataEvent) {
    this._messageQueue.enqueue(event);
    return this.flush();
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

    this._doSend = async (event) => sendAsyncMessage(connection, 'clientMessage', event);
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

  async _throwNotConnected() {
    throw new JestMetadataError('IPC client is not connected to server.');
  }
}
