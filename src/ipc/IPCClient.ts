import node_ipc from 'node-ipc';
import stripAnsi from 'strip-ansi';

import { JestMetadataError } from '../errors';
import type { GlobalMetadata, MetadataEvent } from '../metadata';
import { internal } from '../metadata';
import { diagnostics, optimizeTracing } from '../utils';
import type { BatchMessage } from './BatchMessage';
import { sendAsyncMessage } from './sendAsyncMessage';

const log = diagnostics.child({ cat: ['ipc', 'ipc-client'], tid: 'jest-metadata-ipc' });

type IPC = Omit<typeof node_ipc, 'IPC'>;
type IPCConnection = (typeof node_ipc)['of'][string];

export type IPCClientConfig = {
  appspace: string;
  clientId: string | undefined;
  serverId: string | undefined;
  globalMetadata: GlobalMetadata;
};

const __SEND = optimizeTracing((msg: unknown) => ({ msg }));
const __OMIT = optimizeTracing((event: unknown) => ({ event }));
const __ERROR = optimizeTracing((error: unknown) => ({ cat: ['error'], error }));

export class IPCClient {
  private readonly _ipc: IPC;
  private readonly _serverId: string;
  private _startPromise?: Promise<void>;
  private _stopPromise?: Promise<void>;
  private _queue: string[] = [];
  private _connection?: IPCConnection;
  private _globalMetadata: GlobalMetadata;

  constructor(config: IPCClientConfig) {
    if (!config.serverId) {
      throw new JestMetadataError('IPC server ID is not specified when creating IPC client.');
    }

    if (!config.clientId) {
      throw new JestMetadataError('IPC client ID is not specified when creating IPC client.');
    }

    this._globalMetadata = config.globalMetadata;
    this._ipc = new node_ipc.IPC();
    this._serverId = config.serverId;

    Object.assign(this._ipc.config, {
      id: config.clientId,
      appspace: config.appspace,
      logger: optimizeTracing((msg: string) => log.trace(stripAnsi(msg))),
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

  enqueue(event: MetadataEvent) {
    if (this._stopPromise) {
      log.debug(__OMIT(event), 'enqueue (aborted)');
      return;
    }

    this._queue.push(JSON.stringify(event));
  }

  async flush(modifier?: 'first' | 'last'): Promise<void> {
    if (!this._connection) {
      log.trace(__OMIT(this._queue), 'flush (no connection)');
      return;
    }

    const connection = this._connection;
    const batch = this._queue.splice(0, this._queue.length);
    if (modifier || batch.length > 0) {
      const msg: BatchMessage = { batch };
      if (modifier === 'first') {
        msg.first = true;
      }
      if (modifier === 'last') {
        msg.last = true;
      }

      await log.trace.complete(__SEND(msg), 'send', async () => {
        const data = await sendAsyncMessage(connection, 'clientMessageBatch', msg);
        // Direct update to avoid emitting events.
        Object.assign(this._globalMetadata[internal.data], data);
      });
    } else {
      log.trace('empty-queue');
    }
  }

  private async _doStart() {
    await this._stopPromise;
    this._stopPromise = undefined;

    const serverId = this._serverId;

    const connection = await new Promise<IPCConnection | undefined>((resolve) => {
      const onConnect = (client: typeof node_ipc) => {
        const connection = client.of[serverId];

        const onError = (err: Error) => {
          unsubscribe();
          log.error(__ERROR(err), 'Failed to connect to IPC server.');
          resolve(void 0);
        };

        const onDisconnect = () => {
          unsubscribe();
          log.error(__ERROR(void 0), 'IPC server has unexpectedly disconnected.');
          resolve(void 0);
        };

        const onConnect = () => {
          unsubscribe();
          resolve(client.of[serverId]);
        };

        const unsubscribe = () => {
          connection.off('error', onError);
          connection.off('disconnect', onDisconnect);
          connection.off('connect', onConnect);
        };

        connection.on('error', onError).on('disconnect', onDisconnect).on('connect', onConnect);
      };

      // @ts-expect-error TS2769: No overload matches this call.
      this._ipc.connectTo(serverId, onConnect);
    });

    if (connection) {
      this._connection = connection;
      this._connection.on('beforeExit', () => this.stop());
      await this.flush('first');
    }
  }

  private async _doStop() {
    await this._startPromise;
    this._startPromise = undefined;

    if (this._connection) {
      await this.flush('last');
      await new Promise((resolve, reject) => {
        this._ipc.of[this._serverId]
          // @ts-expect-error TS2339: Property 'once' does not exist on type 'Client'.
          .once('disconnect', resolve)
          .once('error', reject);

        this._ipc.disconnect(this._serverId);
      });

      this._connection = undefined;
    }
  }
}
