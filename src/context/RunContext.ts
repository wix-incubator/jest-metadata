import { Context } from './Context';

export class RunContext extends Context {
  constructor(public readonly testFilePath: string) {
    super();
  }
}
