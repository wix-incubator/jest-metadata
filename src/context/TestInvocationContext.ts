import { Context } from './Context';
import { TestContext } from './TestContext';

export class TestInvocationContext extends Context {
  constructor(public readonly parent: TestContext, public readonly index: number) {
    super();
  }
}
