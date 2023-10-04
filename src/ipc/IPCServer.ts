import type { Socket } from 'net';

import node_ipc from 'node-ipc';
import stripAnsi from 'strip-ansi';

import type { MetadataEvent, MetadataEventEmitter } from '../metadata';
import { Deferred, logger, makeDeferred, optimizeForLogger } from '../utils';

const log = logger.child({ cat: 'ipc', tid: 'ipc-server' });

type IPC = Omit<typeof node_ipc, 'IPC'>;

type BatchMessage = {
  /** Whether this is the last batch of messages. */
  last: boolean;
  batch: MetadataEvent[];
};

export type IPCServerConfig = {
  appspace: string;
  serverId: string;
  emitter: MetadataEventEmitter;
};

export class IPCServer {
  private _startPromise?: Promise<void>;
  private _stopPromise?: Promise<void>;
  private _flushDeferred?: Deferred<void>;
  private readonly _ipc: IPC;
  private readonly _emitter: MetadataEventEmitter;
  private readonly _knownSockets = new Set<Socket>();

  constructor(config: IPCServerConfig) {
    this._ipc = new node_ipc.IPC();
    this._ipc.config.id = config.serverId;
    this._ipc.config.appspace = config.appspace;
    this._ipc.config.logger = optimizeForLogger((msg) => log.trace(stripAnsi(msg)));
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
    this._flushDeferred = makeDeferred();

    await new Promise((resolve, reject) => {
      this._ipc.serve(() => resolve(void 0));
      this._ipc.server.on('clientMessageBatch', this._onClientMessageBatch.bind(this));

      // @ts-expect-error TS2339: Property 'once' does not exist on type 'Server'.
      this._ipc.server.once('error', reject);
      this._ipc.server.start();
    });
  }

  private async _doStop(): Promise<void> {
    await this._startPromise;
    this._startPromise = undefined;
    await new Promise((resolve, reject) => {
      this._ipc.server.broadcast('beforeExit');
      const handle = this._setEmergencyTimeout(1000);
      this._checkIfAllClientsFlushed();
      this._flushDeferred!.promise.then(() => {
        clearTimeout(handle);
        // @ts-expect-error TS2339: Property 'server' does not exist on type 'Server'.
        this._ipc.server.server.close((e) => (e ? reject(e) : resolve()));
        this._ipc.server.stop();
      });
    });
  }

  private _onClientMessageBatch({ last, batch }: BatchMessage, socket: Socket) {
    for (const event of batch) {
      if (event.type !== 'add_test_file') {
        // Jest Metadata server adds new test files before we get
        // the independent confirmation from the Jest worker via IPC.
        // So, we don't want to emit the event twice.
        this._emitter.emit(event);
      }
    }

    this._ipc.server.emit(socket, 'clientMessageBatchDone');

    if (last) {
      this._knownSockets.delete(socket);
      this._checkIfAllClientsFlushed();
    } else {
      this._knownSockets.add(socket);
    }
  }

  private _checkIfAllClientsFlushed() {
    if (this._knownSockets.size === 0) {
      this._flushDeferred!.resolve();
    }
  }

  private _setEmergencyTimeout(ms: number) {
    return setTimeout(() => {
      console.warn('[jest-metadata] IPC clients did not flush all messages in time');
      log.warn('forced shutdown');
      this._flushDeferred!.resolve();
    }, ms);
  }
}
