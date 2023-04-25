/* eslint-disable @typescript-eslint/no-explicit-any */

import memoize from 'lodash.memoize';
import once from 'lodash.once';

import { realm } from './realms';

export const onRunStart: () => Promise<void> = once(async () => {
  await realm.ipc.start();
});

export const addTestFile: (testFilePath: string) => Promise<void> = memoize(
  async (testFilePath: string) => {
    realm.rootEmitter.emit({
      type: 'add_test_file',
      testFilePath,
    });

    await realm.ipc.flush();
  },
);

export const onRunComplete: () => Promise<void> = once(async () => {
  await realm.ipc.stop();
});
