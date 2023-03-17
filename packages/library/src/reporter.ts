/* eslint-disable @typescript-eslint/no-explicit-any */

import * as server from './server';

export * from './index';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class JestMetadataReporter {
  getLastError(): Error | void {
    return undefined;
  }

  async onRunStart() {
    await server.onRunStart();
  }

  /**
   * @param {import('@jest/reporters').Test} test
   */
  async onTestFileStart(test: any): Promise<void> {
    await server.addTestFile(test.path);
  }

  async onRunComplete(): Promise<void> {
    await server.onRunComplete();
  }
}

export default JestMetadataReporter;
