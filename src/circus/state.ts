import debug from 'debug';

import { RootEventHandler } from '../eventHandlers';
import { EventQueue, InstanceCache, ScopedMetadataRegistry } from '../services';

import { CircusTestEventHandler } from './CircusTestEventHandler';

const log = debug('jest-extend-report:event-queue');

export const eventQueue = new EventQueue().registerHandler((event) => {
  log(event);
});

const scopedMetadataRegistry = new ScopedMetadataRegistry();

const describeInstances = new InstanceCache();
const hookInstances = new InstanceCache();
const testInstances = new InstanceCache();

let currentTestFilePath = '';
export const circusTestEventHandler = new CircusTestEventHandler({
  eventQueue,
  getDescribeId: (block) => {
    return `${currentTestFilePath}:describe.${describeInstances.getInstanceId(block)}`;
  },
  getHookId: (fn) => `${currentTestFilePath}:hook.${hookInstances.getInstanceId(fn)}`,
  getTestId: (fn) => `${currentTestFilePath}:test.${testInstances.getInstanceId(fn)}`,
  setTestFilePath: (testFilePath) => {
    currentTestFilePath = testFilePath;
  },
});

export const handler = new RootEventHandler({ eventQueue, scopedMetadataRegistry }).subscribe();
