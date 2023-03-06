import debug from 'debug';

import { RootEventHandler } from '../eventHandlers';
import { EventQueue, InstanceCache, MetadataRegistry } from '../services';

import { CircusTestEventHandler } from './CircusTestEventHandler';

const log = debug('jest-extend-report:event-queue');

export const eventQueue = new EventQueue().registerHandler((event) => {
  log(event);
});

const metadataRegistry = new MetadataRegistry();
export const handler = new RootEventHandler({ eventQueue, metadataRegistry }).subscribe();

const describeInstances = new InstanceCache();
const hookInstances = new InstanceCache();
const testInstances = new InstanceCache();

export const circusTestEventHandler = new CircusTestEventHandler({
  getDescribeId: (block) => `describe:${describeInstances.getInstanceId(block)}`,
  getHookId: (fn) => `hook:${hookInstances.getInstanceId(fn)}`,
  getTestId: (fn) => `test:${testInstances.getInstanceId(fn)}`,
  eventQueue,
});
