// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { eventQueue, circusTestEventHandler } from './state';

export function startTestFile(testFilePath: string): void {
  circusTestEventHandler.test_environment_created(testFilePath);
}

export const handleTestEvent: Circus.EventHandler = circusTestEventHandler.handleTestEvent;

export const flush = (): Promise<void> => {
  return eventQueue.flush();
};

export { handler as rootEventHandler } from './state';
