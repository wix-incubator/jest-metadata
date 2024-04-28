import { bunyamin, isDebug, nobunyamin, threadGroups } from 'bunyamin';

function isTraceEnabled(): boolean {
  return isDebug('jest-metadata');
}

threadGroups
  .add({ id: 'jest-metadata', displayName: 'jest-metadata' })
  .add({
    id: 'jest-metadata-emitter-core',
    displayName: 'jest-metadata (Core Emitter)',
  })
  .add({
    id: 'jest-metadata-emitter-events',
    displayName: 'jest-metadata (Events Emitter)',
  })
  .add({
    id: 'jest-metadata-emitter-globalMetadataRegistry',
    displayName: 'jest-metadata (Metadata Registry)',
  })
  .add({ id: 'jest-metadata-emitter-set', displayName: 'jest-metadata (Set Emitter)' })
  .add({ id: 'jest-metadata-environment', displayName: 'jest-metadata (Environment)' })
  .add({ id: 'jest-metadata-ipc', displayName: 'jest-metadata (IPC)' })
  .add({ id: 'jest-metadata-reporter', displayName: 'jest-metadata (Reporter)' });

const EMPTY = {};
const NOOP: any = () => EMPTY;

export const optimizeTracing: <F>(f: F) => F = isTraceEnabled() ? (f) => f : () => NOOP;

export const logger = bunyamin.child({ cat: 'jest-metadata' });

export const diagnostics = isTraceEnabled() ? logger : nobunyamin;

export { nobunyamin as nologger } from 'bunyamin';
