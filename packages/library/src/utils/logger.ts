import fs from 'fs';
import path from 'path';
import { traceEventStream, uniteTraceEventsToFile, wrapLogger } from 'bunyamin';
import { createLogger } from 'bunyan';
import { noop } from './noop';

const logsDirectory = process.env.JEST_METADATA_DEBUG;

export const logger = create();

export const nologger = wrapLogger({
  logger: createBunyanNoop(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const optimizeForLogger: <F>(f: F) => F = isEnabled() ? (f) => f : ((() => noop) as any);

function create() {
  return wrapLogger({
    logger: (isEnabled() ? createBunyanImpl : createBunyanNoop)(),
  });
}

function isEnabled(): boolean {
  return !!logsDirectory;
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
          filePath: path.join(
            process.env.JEST_METADATA_DEBUG!,
            `jest-metadata.${process.pid}${suffix}.log`,
          ),
          threadGroups: [
            { id: 'ipc-server', displayName: 'IPC Server' },
            { id: 'ipc-client', displayName: 'IPC Client' },
            { id: 'emitter-core', displayName: 'Emitter (core)' },
            { id: 'emitter-set', displayName: 'Emitter (set)' },
            { id: 'emitter-events', displayName: 'Emitter (events)' },
            { id: 'emitter-environment', displayName: 'Test Environment' },
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

const LOG_PATTERN = /^jest-metadata\..*\.log$/;

export async function aggregateLogs() {
  const root = logsDirectory;
  if (!root) {
    return;
  }

  const logs = fs
    .readdirSync(root)
    .filter((x) => LOG_PATTERN.test(x))
    .map((x) => path.join(root, x));

  if (fs.existsSync('jest-metadata.json')) {
    fs.rmSync('jest-metadata.json');
  }

  if (logs.length > 1) {
    await uniteTraceEventsToFile(logs, path.join(root, 'jest-metadata.log'));
    for (const x of logs) fs.rmSync(x);
  }
}
