/* eslint-disable @typescript-eslint/no-explicit-any */

import { realm } from './realms';

export const onRunStart: () => Promise<void> = () => realm.ipc.start();

export const addTestFile: (testFilePath: string) => void = (testFilePath: string) =>
  realm.rootEmitter.emit({
    type: 'add_test_file',
    testFilePath,
  });

export const onRunComplete: () => Promise<void> = () => realm.ipc.stop();
