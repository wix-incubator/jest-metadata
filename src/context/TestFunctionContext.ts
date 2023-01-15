import { Context } from './Context';
import { TestInvocationContext } from './TestInvocationContext';

export class TestFunctionContext extends Context {
  constructor(public readonly parent: TestInvocationContext) {
    super();
  }
}
