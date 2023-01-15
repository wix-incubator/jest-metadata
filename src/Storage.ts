// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import {
  Context,
  DescribeBlockContext,
  HookContext,
  RunContext,
  TestContext,
  TestFunctionContext,
  TestInvocationContext
} from './context';

export class Storage {
  private _context: Context | undefined;
  private readonly _testContexts = new WeakMap<Circus.TestEntry, TestContext>();

  public get context() {
    return this._context;
  }

  openTestFile(testFilePath: string) {
    this._context = new RunContext(testFilePath);
  }

  openDescribeBlock(describeBlock: Circus.DescribeBlock) {
    this._assertContext(this._context, RunContext);
    this._context = new DescribeBlockContext(this._context, describeBlock);
  }

  openHook(hook: Circus.Hook) {
    if (hook.type === 'beforeAll' || hook.type === 'afterAll') {
      this._assertContext(this._context, DescribeBlockContext);
      this._context = new HookContext(this._context, hook);
    } else {
      this._assertContext(this._context, TestInvocationContext);
      this._context = new HookContext(this._context, hook);
    }
  }

  openTestEntry(testEntry: Circus.TestEntry) {
    let context: TestContext;

    this._assertContext(this._context, DescribeBlockContext);

    if (this._testContexts.has(testEntry)) {
      context = this._testContexts.get(testEntry)!;
    } else {
      context = new TestContext(this._context, testEntry);
      this._testContexts.set(testEntry, context);
    }

    this._context = context.addInvocation(testEntry.invocations);
  }

  openTestFunction(testEntry: Circus.TestEntry) {
    this._assertContext(this._context, TestInvocationContext);
    if (this._context.mapping !== testEntry) {
      throw new Error('Invalid state: test_fn does not match the test');
    }
    this._context = new TestFunctionContext(this._context);
  }

  closeTestEntry() {
    const context = this._context;
    this._assertContext(context, TestInvocationContext);
    this._context = context.parent;
    // TODO: do a lot of work
  }

  closeHook() {
    const context = this._context;
    this._assertContext(context, HookContext);
    this._context = context.parent;
  }

  closeDescribeBlock() {
    const context = this._context;
    this._assertContext<DescribeBlockContext | TestContext>(
      context,
      DescribeBlockContext,
      TestContext,
    );
    this._context = context.parent;
  }

  private _assertContext<T>(value: unknown, ...classes: Constructor<T>[]): asserts value is T {
    if (!classes.some((Klass) => value instanceof Klass)) {
      const names = classes.map((Klass) => Klass.name).join(' or ');
      throw new TypeError(`Expected to have ${names} as a current context`);
    }
  }
}

type Constructor<T> = new (...a: any[]) => T;
