// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';
import { CircusTestEventHandler } from './CircusTestEventHandler';
import { InstanceCache, MetadataRegistry } from '../services';
import { Event } from '../events';
import { RootEventHandler } from '../eventHandlers/RootEventHandler';

let emitter = {
  emit: (event: Event) => {
    console.log('Emitting:', event);
  },
};

const metadataRegistry = new MetadataRegistry();
const handler = new RootEventHandler({
  emit: (event) => emitter.emit(event),
  metadataRegistry,
});

export function setEmitter(emitterNew: typeof emitter) {
  emitter = emitterNew;
}

export const current = handler.current;
export const last = handler.last;

const describeInstances = new InstanceCache();
const hookInstances = new InstanceCache();
const testInstances = new InstanceCache();

const circusTestEventHandler = new CircusTestEventHandler({
  getDescribeId: (block) => `describe:${describeInstances.getInstanceId(block)}`,
  getHookId: (fn) => `hook:${hookInstances.getInstanceId(fn)}`,
  getTestId: (fn) => `test:${testInstances.getInstanceId(fn)}`,
  emit: (event) => emitter.emit(event),
});

export function startTestFile(testFilePath: string): void {
  circusTestEventHandler.test_environment_created(testFilePath);
}

export const handleTestEvent: Circus.EventHandler = circusTestEventHandler.handleTestEvent;

export const flush = (): Promise<void> => {
  return Promise.resolve();
};
