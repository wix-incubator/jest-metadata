// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { CircusContext } from './CircusContext';

const storage = new CircusContext();

export function startTestFile(testFileName: string) {
  storage.openTestFile(testFileName);
}

export function handleTestEvent(event: Circus.Event) {

}

export function currentContext() {}
