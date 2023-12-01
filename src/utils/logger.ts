import { bunyamin, isDebug, threadGroups } from 'bunyamin';
import { noop } from './noop';

threadGroups.add({ id: 'ipc-server', displayName: 'IPC Server (jest-metadata)' });
threadGroups.add({ id: 'ipc-client', displayName: 'IPC Client (jest-metadata)' });
threadGroups.add({ id: 'emitter-core', displayName: 'Core emitter (jest-metadata)' });
threadGroups.add({ id: 'emitter-set', displayName: 'Set emitter (jest-metadata)' });
threadGroups.add({ id: 'emitter-events', displayName: 'Events emitter (jest-metadata)' });
threadGroups.add({ id: 'environment', displayName: 'Test Environment (jest-metadata)' });
threadGroups.add({ id: 'metadata', displayName: 'Metadata (jest-metadata)' });
threadGroups.add({ id: 'reporter', displayName: 'Reporter (jest-metadata)' });

function isTraceEnabled(): boolean {
  return isDebug('jest-metadata');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const optimizeTracing: <F>(f: F) => F = isTraceEnabled() ? (f) => f : ((() => noop) as any);

export const logger = bunyamin.child({ cat: 'jest-metadata' });

export { nobunyamin as nologger } from 'bunyamin';
