import { traceEventStream, wrapLogger } from 'bunyamin';
import { createLogger } from 'bunyan';

function create() {
  const label = process.env.JEST_WORKER_ID ? `Worker ${process.env.JEST_WORKER_ID}` : 'Main';

  const bunyan = createLogger({
    name: `Jest Metadata (${label})`,
    streams: streams(),
  });

  bunyan.debug({ env: process.env }, 'logger created');
  return wrapLogger({
    logger: bunyan,
  });
}

function streams() {
  if (process.env.DEBUG) {
    const suffix = process.env.JEST_WORKER_ID ? `-${process.env.JEST_WORKER_ID}` : '';

    return [
      {
        level: 'trace' as const,
        stream: traceEventStream({
          filePath: `jest-metadata.${process.pid}${suffix}.json`,
          threadGroups: [
            { id: 'ipc-server', displayName: 'IPC Server' },
            { id: 'ipc-client', displayName: 'IPC Client' },
            { id: 'emitter-root', displayName: 'Emitter (root)' },
            { id: 'emitter-set', displayName: 'Emitter (set)' },
            { id: 'emitter-combined', displayName: 'Emitter (combined)' },
          ],
        }),
      },
    ];
  } else {
    return [];
  }
}

export const logger = create();
