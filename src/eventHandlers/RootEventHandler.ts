import {
  Event,
  TestEnvironmentCreatedEvent,
  AddHookEvent,
  AddTestEvent,
  FinishDescribeDefinitionEvent,
  HookFailureEvent,
  HookStartEvent,
  HookSuccessEvent,
  RunDescribeFinishEvent,
  RunDescribeStartEvent,
  RunFinishEvent,
  RunStartEvent,
  SetMetadataEvent,
  StartDescribeDefinitionEvent,
  TestDoneEvent,
  TestFnFailureEvent,
  TestFnStartEvent,
  TestFnSuccessEvent,
  TestRetryEvent,
  TestSkipEvent,
  TestStartEvent,
  TestTodoEvent,
} from '../events';
import { EventHandlerCallback } from '../services';
import {
  AggregatedIdentifier,
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  TestEntryMetadata,
} from '../metadata';
import * as internal from '../metadata/symbols';

import { RootEventHandlerConfig } from './RootEventHandlerConfig';

export class RootEventHandler {
  protected readonly metadata: AggregatedResultMetadata;

  constructor(protected readonly config: RootEventHandlerConfig) {
    this.metadata = new AggregatedResultMetadata({
      eventQueue: config.eventQueue,
      metadataRegistry: config.scopedMetadataRegistry,
    });
  }

  subscribe(): this {
    this.config.eventQueue.registerHandler(this.handle);
    return this;
  }

  handle: EventHandlerCallback = (event: Event): void => {
    switch (event.type) {
      /* Custom events */
      case 'test_environment_created': {
        return this._handleTestEnvironmentCreated(event);
      }
      /* Circus events */
      case 'add_hook': {
        return this._handleAddHook(event);
      }
      case 'add_test': {
        return this._handleAddTest(event);
      }
      case 'finish_describe_definition': {
        return this._handleFinishDescribeDefinition(event);
      }
      case 'hook_failure': {
        return this._handleHookFailure(event);
      }
      case 'hook_start': {
        return this._handleHookStart(event);
      }
      case 'hook_success': {
        return this._handleHookSuccess(event);
      }
      case 'run_describe_finish': {
        return this._handleRunDescribeFinish(event);
      }
      case 'run_describe_start': {
        return this._handleRunDescribeStart(event);
      }
      case 'run_finish': {
        return this._handleRunFinish(event);
      }
      case 'run_start': {
        return this._handleRunStart(event);
      }
      case 'set_metadata': {
        return this._handleSetMetadata(event);
      }
      case 'start_describe_definition': {
        return this._handleStartDescribeDefinition(event);
      }
      case 'test_done': {
        return this._handleTestDone(event);
      }
      case 'test_fn_failure': {
        return this._handleTestFnFailure(event);
      }
      case 'test_fn_start': {
        return this._handleTestFnStart(event);
      }
      case 'test_fn_success': {
        return this._handleTestFnSuccess(event);
      }
      case 'test_retry': {
        return this._handleTestRetry(event);
      }
      case 'test_skip': {
        return this._handleTestSkip(event);
      }
      case 'test_start': {
        return this._handleTestStart(event);
      }
      case 'test_todo': {
        return this._handleTestTodo(event);
      }
    }
  };

  private _handleTestEnvironmentCreated(event: TestEnvironmentCreatedEvent) {
    this.metadata.registerTestFile(event.testFilePath);
  }

  private _handleStartDescribeDefinition(event: StartDescribeDefinitionEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
    const currentDescribeBlock = run.current.describeBlock;
    (currentDescribeBlock ?? run)[internal.addDescribeBlock](describeId);
  }

  private _handleAddHook(event: AddHookEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
    const currentDescribeBlock = run.current.describeBlock;
    if (!currentDescribeBlock) {
      throw new Error('No current describe block');
    }
    currentDescribeBlock[internal.addHookDefinition](hookId, event.hookType);
  }

  private _handleAddTest(event: AddTestEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const currentDescribeBlock = run.current.describeBlock;
    if (!currentDescribeBlock) {
      throw new Error('No current describe block');
    }

    currentDescribeBlock[internal.addTestEntry](testId);
  }

  private _handleFinishDescribeDefinition(event: FinishDescribeDefinitionEvent) {
    const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
    this.config.scopedMetadataRegistry.get(describeId).as(DescribeBlockMetadata)[internal.finish]();
  }

  private _handleRunStart(event: RunStartEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    run[internal.start]();
  }

  private _handleRunFinish(event: RunFinishEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    run[internal.finish]();
  }

  private _handleRunDescribeStart(event: RunDescribeStartEvent) {
    const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
    const describe = this.config.scopedMetadataRegistry.get(describeId).as(DescribeBlockMetadata);

    describe[internal.start]();
  }

  private _handleHookStart(event: HookStartEvent) {
    const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
    const hookDef = this.config.scopedMetadataRegistry.get(hookId).as(HookDefinitionMetadata);

    hookDef[internal.start]();
  }

  private _handleHookSuccess(event: HookSuccessEvent) {
    const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
    const hookDef = this.config.scopedMetadataRegistry.get(hookId).as(HookDefinitionMetadata);

    hookDef[internal.finish]();
  }

  private _handleHookFailure(event: HookFailureEvent) {
    const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
    const hookDef = this.config.scopedMetadataRegistry.get(hookId).as(HookDefinitionMetadata);

    hookDef[internal.finish]();
  }

  private _handleRunDescribeFinish(event: RunDescribeFinishEvent) {
    const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
    const describe = this.config.scopedMetadataRegistry.get(describeId).as(DescribeBlockMetadata);

    describe[internal.finish]();
  }

  private _handleTestStart(event: TestStartEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);

    test[internal.start]();
  }

  private _handleTestRetry(event: TestRetryEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);

    test[internal.start]();
  }

  private _handleTestFnStart(event: TestFnStartEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);
    const lastInvocation = test.lastInvocation;
    if (!lastInvocation) {
      throw new Error('Cannot start test function without an invocation');
    }

    lastInvocation[internal.start]();
  }

  private _handleTestFnFailure(event: TestFnFailureEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);
    const lastInvocation = test.lastInvocation;
    if (!lastInvocation) {
      throw new Error('Cannot finish test function without an invocation');
    }

    lastInvocation[internal.finish]();
  }

  private _handleTestFnSuccess(event: TestFnSuccessEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);
    const lastInvocation = test.lastInvocation;
    if (!lastInvocation) {
      throw new Error('Cannot finish test function without an invocation');
    }

    lastInvocation[internal.finish]();
  }

  private _handleTestSkip(event: TestSkipEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);

    test[internal.finish]();
  }

  private _handleTestTodo(event: TestTodoEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);

    test[internal.finish]();
  }

  private _handleTestDone(event: TestDoneEvent) {
    const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
    const test = this.config.scopedMetadataRegistry.get(testId).as(TestEntryMetadata);

    test[internal.finish]();
  }

  private _handleSetMetadata(event: SetMetadataEvent) {
    if (this.config.eventQueue.current === event) {
      return;
    }

    const targetId = new AggregatedIdentifier(event.testFilePath, event.targetId);
    const metadata = this.config.scopedMetadataRegistry.get(targetId);

    if (event.deepMerge) {
      metadata.merge(event.value);
    } else {
      metadata.assign(event.value);
    }
  }
}
