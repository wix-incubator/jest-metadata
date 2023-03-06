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
import { EventHandler, ScopedIdentifier } from '../services';
import { AggregatedResultMetadata, DescribeBlockMetadata, HookDefinitionMetadata } from '../state';
import {
  _addDescribeBlock,
  _addHookDefinition,
  _addTestEntry,
  _start,
  _finish,
} from '../state/symbols';

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

  handle: EventHandler = (event: Event): void => {
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
    const describeId = new ScopedIdentifier(event.testFilePath, event.describeId);
    run[_addDescribeBlock](describeId);
  }

  private _handleAddHook(event: AddHookEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    const hookId = new ScopedIdentifier(event.testFilePath, event.hookId);
    run.currentDescribeBlock[_addHookDefinition](hookId, event.hookType);
  }

  private _handleAddTest(event: AddTestEvent) {
    const run = this.metadata.getRunMetadata(event.testFilePath);
    const testId = new ScopedIdentifier(event.testFilePath, event.testId);
    run.currentDescribeBlock[_addTestEntry](testId);
  }

  private _handleFinishDescribeDefinition(event: FinishDescribeDefinitionEvent) {
    const describeId = new ScopedIdentifier(event.testFilePath, event.describeId);
    this.config.scopedMetadataRegistry.get(describeId).as(DescribeBlockMetadata)[_finish]();
  }

  private _handleRunDescribeStart(event: RunDescribeStartEvent) {
    const describeId = new ScopedIdentifier(event.testFilePath, event.describeId);
    const describe = this.config.scopedMetadataRegistry.get(describeId).as(DescribeBlockMetadata);

    describe[_start]();
  }

  private _handleHookStart(event: HookStartEvent) {
    const hookId = new ScopedIdentifier(event.testFilePath, event.hookId);
    const hookDef = this.config.scopedMetadataRegistry.get(hookId).as(HookDefinitionMetadata);

    switch (hookDef.hookType) {
      case 'beforeAll': {
        // TODO: add hook invocation to describe and to run's list of invocations
        break;
      }
      case 'afterAll': {
        // TODO: add hook invocation to describe and to run's list of invocations
        break;
      }
      case 'beforeEach': {
        // TODO: add hook invocation to test invocation array
        break;
      }
      case 'afterEach': {
        // TODO: add hook invocation to test invocation array
        break;
      }
    }
  }

  private _handleHookSuccess(_event: HookSuccessEvent) {
    // TODO: Implement
  }

  private _handleHookFailure(_event: HookFailureEvent) {
    // TODO: Implement
  }

  private _handleRunDescribeFinish(_event: RunDescribeFinishEvent) {
    // TODO: Implement
  }

  private _handleTestStart(_event: TestStartEvent) {
    // TODO: Implement
  }

  private _handleTestRetry(_event: TestRetryEvent) {
    // TODO: Implement
  }

  private _handleTestFnStart(_event: TestFnStartEvent) {
    // TODO: Implement
  }

  private _handleTestFnFailure(_event: TestFnFailureEvent) {
    // TODO: Implement
  }

  private _handleTestFnSuccess(_event: TestFnSuccessEvent) {
    // TODO: Implement
  }

  private _handleTestSkip(_event: TestSkipEvent) {
    // TODO: Implement
  }

  private _handleTestTodo(_event: TestTodoEvent) {
    // TODO: Implement
  }

  private _handleTestDone(_event: TestDoneEvent) {
    // TODO: Implement
  }

  private _handleSetMetadata(event: SetMetadataEvent) {
    if (this.config.eventQueue.current === event) {
      return;
    }

    const targetId = new ScopedIdentifier(event.testFilePath, event.targetId);
    const metadata = this.config.scopedMetadataRegistry.get(targetId);

    if (event.deepMerge) {
      metadata.merge(event.value);
    } else {
      metadata.assign(event.value);
    }
  }
}
