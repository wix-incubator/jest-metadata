// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';
import { CircusContext } from './CircusContext';

const circusContext = new CircusContext();

export function startTestFile(testFilePath: string): void {
  circusContext.new_environment(testFilePath);
}

export const handleTestEvent: Circus.EventHandler = (_event, _state) => {
  // TODO
};

export const current = circusContext.current;

export const flush = (): Promise<void> => {
  return Promise.resolve();
};
