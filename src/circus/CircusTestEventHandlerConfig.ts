import { Event } from '../events';

export type CircusTestEventHandlerConfig = {
  emit(event: Event): void;
  getDescribeId(block: object): string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getHookId(fn: Function): string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getTestId(fn: Function): string;
};
