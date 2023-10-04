import { optimizeForLogger } from '../logger';

const CATEGORIES = {
  ENQUEUE: ['enqueue'],
  EMIT: ['emit'],
  INVOKE: ['invoke'],
};

export const __ENQUEUE = optimizeForLogger((event: unknown) => ({
  cat: CATEGORIES.ENQUEUE,
  event,
}));
export const __EMIT = optimizeForLogger((event: unknown) => ({ cat: CATEGORIES.EMIT, event }));
export const __INVOKE = optimizeForLogger((listener: unknown, type?: '*') => ({
  cat: CATEGORIES.INVOKE,
  fn: `${listener}`,
  type,
}));
