import { traceEventStream, wrapLogger } from 'bunyamin';
import { createLogger } from 'bunyan';
import { noop } from './noop';

export const logger = create();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const optimizeForLogger: <F>(f: F) => F = isEnabled() ? (f) => f : ((() => noop) as any);

function create() {
  return wrapLogger({
    logger: (isEnabled() ? createBunyanImpl : createBunyanNoop)(),
  });
}

function isEnabled(): boolean {
  return process.env.JEST_METADATA_DEBUG === 'true';
}

function createBunyanImpl() {
  const label = process.env.JEST_WORKER_ID ? `Worker ${process.env.JEST_WORKER_ID}` : 'Main';
  const suffix = process.env.JEST_WORKER_ID ? `-${process.env.JEST_WORKER_ID}` : '';

  const bunyan = createLogger({
    name: `Jest Metadata (${label})`,
    streams: [
      {
        level: 'trace' as const,
        stream: traceEventStream({
          filePath: `jest-metadata.${process.pid}${suffix}.log`,
          threadGroups: [
            { id: 'ipc-server', displayName: 'IPC Server' },
            { id: 'ipc-client', displayName: 'IPC Client' },
            { id: 'emitter-core', displayName: 'Emitter (core)' },
            { id: 'emitter-set', displayName: 'Emitter (set)' },
            { id: 'emitter-combined', displayName: 'Emitter (combined)' },
            { id: 'metadata', displayName: 'Metadata' },
            { id: 'reporter', displayName: 'Reporter' },
          ],
        }),
      },
    ],
  });

  return bunyan;
}

function createBunyanNoop() {
  return {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
  };
}
