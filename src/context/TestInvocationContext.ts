// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { TestContext } from './TestContext';

export class TestInvocationContext extends Context {
  constructor(public readonly parent: TestContext, public readonly index: number) {
    super();
  }

  get mapping(): Circus.TestEntry {
    return this.parent.mapping;
  }
}
