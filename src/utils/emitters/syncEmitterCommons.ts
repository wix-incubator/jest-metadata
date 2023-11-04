import { optimizeTracing } from '../logger';

const CATEGORIES = {
  ENQUEUE: ['enqueue'],
  EMIT: ['emit'],
  INVOKE: ['invoke'],
};

export const __ENQUEUE = optimizeTracing((event: unknown) => ({
  cat: CATEGORIES.ENQUEUE,
  event,
}));
export const __EMIT = optimizeTracing((event: unknown) => ({ cat: CATEGORIES.EMIT, event }));
export const __INVOKE = optimizeTracing((listener: unknown, type?: '*') => ({
  cat: CATEGORIES.INVOKE,
  fn: `${listener}`,
  type,
}));
