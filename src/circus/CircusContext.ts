// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { Context } from './Context';

export class CircusContext {
  private _runContext?: RunContext;
  private _describeBlockContext?: DescribeBlockContext;
  private _testContext?: TestContext;
  private _currentContext?: Context;

  private readonly _cachedDescribeBlocks = new WeakMap<
    Circus.DescribeBlock,
    DescribeBlockContext
  >();

  private readonly _cachedTestEntries = new WeakMap<Circus.TestEntry, TestContext>();

  public get context(): Context | undefined {
    return undefined;
  }

  public get run(): Context | undefined {
    return undefined;
  }

  public get describeBlock(): Context | undefined {
    return undefined;
  }

  public get testEntry(): Context | undefined {
    return undefined;
  }

  public get testInvocation(): Context | undefined {
    return undefined;
  }

  public get testFn(): Context | undefined {
    return undefined;
  }

  public get hook(): Context | undefined {
    return undefined;
  }

  public get execution(): Context | undefined {
    return undefined;
  }

  openTestFile(testFilePath: string) {
    if (this._context) {
      throw new Error(`Invalid state: run_start does not match the previously open context`);
    }

    this._context = new RunContext(testFilePath);
  }

  openDescribeBlock(describeBlock: Circus.DescribeBlock) {
    let context: DescribeBlockContext;

    this._assertContext<RunContext | DescribeBlockContext>(
      this._context,
      RunContext,
      DescribeBlockContext,
    );

    if (describeBlock.parent) {
      if (this._context?.mapping !== describeBlock.parent) {
        throw new Error('Invalid state: describe_start does not match the parent describe block');
      }
    } else {
      if (!(this._context instanceof RunContext)) {
        throw new TypeError('Invalid state: describe_start does not match the run circus');
      }
    }

    if (this._cachedDescribeBlocks.has(describeBlock)) {
      context = this._cachedDescribeBlocks.get(describeBlock)!;
    } else {
      context = new DescribeBlockContext(this._context, describeBlock);
      this._cachedDescribeBlocks.set(describeBlock, context);
    }

    this._context = context;
  }

  openHook(hook: Circus.Hook) {
    if (hook.type === 'beforeAll' || hook.type === 'afterAll') {
      this._assertContext(this._context, DescribeBlockContext);
      if (this._context?.mapping !== hook.parent) {
        throw new Error(
          `Invalid state: hook_start (${hook.type}) does not match the describe block`,
        );
      }

      if (hook.type === 'beforeAll') {
        this._context.openBeforeHook();
      } else {
        this._context.openAfterHook();
      }
    } else {
      this._assertContext(this._context, TestInvocationContext);
      if (this._context?.mapping !== (hook.parent as any)) {
        throw new Error(`Invalid state: hook_start (${hook.type}) does not match the test entry`);
      }

      if (hook.type === 'beforeEach') {
        this._context.openBeforeHook();
      } else {
        this._context.openAfterHook();
      }
    }
  }

  openTestEntry(testEntry: Circus.TestEntry) {
    let context: TestContext;

    this._assertContext(this._context, DescribeBlockContext);
    if (this._context?.mapping !== testEntry.parent) {
      throw new Error('Invalid state: test_start does not match the describe block');
    }

    if (this._cachedTestEntries.has(testEntry)) {
      context = this._cachedTestEntries.get(testEntry)!;
    } else {
      context = new TestContext(this._context, testEntry);
      this._cachedTestEntries.set(testEntry, context);
    }

    this._context = context.startInvocation();
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
