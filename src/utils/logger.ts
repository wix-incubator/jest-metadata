import fs from 'fs';
import path from 'path';
import { traceEventStream, uniteTraceEventsToFile, wrapLogger } from 'bunyamin';
import { createLogger } from 'bunyan';
import createDebugStream from 'bunyan-debug-stream';
import { noop } from './noop';

const logsDirectory = process.env.JEST_METADATA_DEBUG;

export const logger = wrapLogger({
  logger: createBunyanImpl(isTraceEnabled()),
});

export const nologger = wrapLogger({
  logger: createBunyanNoop(),
}) as typeof logger;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const optimizeTracing: <F>(f: F) => F = isTraceEnabled() ? (f) => f : ((() => noop) as any);

function isTraceEnabled(): boolean {
  return !!logsDirectory;
}

function createLogFilePath() {
  const suffix = process.env.JEST_WORKER_ID ? `-${process.env.JEST_WORKER_ID}` : '';
  let counter = 0;
  let filePath = '';

  do {
    // when jest-metadata test environment is not configured,
    // we don't have realm reuse in the sandboxed environment,
    // so erroneously the logger tries to create a new file
    // with the same name. This is a workaround for that.
    filePath = path.join(
      process.env.JEST_METADATA_DEBUG!,
      `jest-metadata.${process.pid}${suffix}${counter-- || ''}.log`,
    );
  } while (fs.existsSync(filePath));

  return filePath;
}

function createBunyanImpl(traceEnabled: boolean) {
  const label = process.env.JEST_WORKER_ID ? `Worker ${process.env.JEST_WORKER_ID}` : 'Main';
  const bunyan = createLogger({
    name: `Jest Metadata (${label})`,
    streams: [
      {
        level: 'warn' as const,
        stream: createDebugStream({
          out: process.stderr,
          showMetadata: false,
          showDate: false,
          showPid: false,
          showProcess: false,
          showLoggerName: false,
          showLevel: false,
          prefixers: {
            cat: () => 'jest-metadata',
          },
        }),
      },
      ...(traceEnabled
        ? [
            {
              level: 'trace' as const,
              stream: traceEventStream({
                filePath: createLogFilePath(),
                threadGroups: [
                  { id: 'ipc-server', displayName: 'IPC Server' },
                  { id: 'ipc-client', displayName: 'IPC Client' },
                  { id: 'emitter-core', displayName: 'Emitter (core)' },
                  { id: 'emitter-set', displayName: 'Emitter (set)' },
                  { id: 'emitter-events', displayName: 'Emitter (events)' },
                  { id: 'environment', displayName: 'Test Environment' },
                  { id: 'metadata', displayName: 'Metadata' },
                  { id: 'reporter', displayName: 'Reporter' },
                ],
              }),
            },
          ]
        : []),
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

  const unitedLogPath = path.join(root, 'jest-metadata.log');
  if (fs.existsSync(unitedLogPath)) {
    fs.rmSync(unitedLogPath);
  }

  const logs = fs
    .readdirSync(root)
    .filter((x) => LOG_PATTERN.test(x))
    .map((x) => path.join(root, x));

  if (logs.length > 1) {
    await uniteTraceEventsToFile(logs, unitedLogPath);
    for (const x of logs) fs.rmSync(x);
  } else {
    fs.renameSync(logs[0], unitedLogPath);
  }
}
