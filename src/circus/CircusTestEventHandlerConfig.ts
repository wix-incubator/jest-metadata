import { EventQueue } from '../services';

export type CircusTestEventHandlerConfig = {
  readonly eventQueue: EventQueue;
  setTestFilePath(testFilePath: string): void;
  getDescribeId(block: object): string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getHookId(fn: Function): string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getTestId(fn: Function): string;
};
