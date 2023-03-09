// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import realm from '../realms';

const { eventQueue, circusTestEventHandler, rootEventHandler } = realm;

export function startTestFile(testFilePath: string): void {
  circusTestEventHandler.test_environment_created(testFilePath);
}

export const handleTestEvent: Circus.EventHandler = circusTestEventHandler.handleTestEvent;

export const flush = async () => {
  await eventQueue.flush();
};

export { rootEventHandler };
