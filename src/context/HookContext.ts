// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { DescribeBlockContext } from './DescribeBlockContext';
import { TestInvocationContext } from './TestInvocationContext';

export class HookContext extends Context {
  constructor(
    public readonly parent: DescribeBlockContext | TestInvocationContext,
    public readonly hook: Circus.Hook,
  ) {
    super();
  }

  get mapping() {
    return this.hook;
  }
}
