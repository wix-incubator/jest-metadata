import { JestMetadataError } from '../errors';

import {
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventEmitterCallback,
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
  MetadataEventType,
} from './events';

import {
  AggregatedResultMetadata,
  Data,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  TestEntryMetadata,
} from './containers';

import { AggregatedMetadataRegistry, AggregatedIdentifier } from './misc';

import * as internal from './symbols';

export type MetadataEventHandlerConfig = {
  readonly emitter: MetadataEventEmitter;
  readonly aggregatedMetadataRegistry: AggregatedMetadataRegistry;
};

type MetadataEventHandlerCallback<K extends MetadataEventType> = <
  E extends MetadataEvent & { type: K },
>(
  event: E,
) => void;

type MetadataEventHandlerMap = {
  readonly [K in MetadataEventType]: MetadataEventHandlerCallback<K>;
};

export class MetadataEventHandler {
  protected readonly metadata: AggregatedResultMetadata;

  private readonly _handlers: MetadataEventHandlerMap = {
    test_environment_created: (event: TestEnvironmentCreatedEvent) => {
      this.metadata.registerTestFile(event.testFilePath);
    },

    start_describe_definition: (event: StartDescribeDefinitionEvent) => {
      const run = this.metadata.getRunMetadata(event.testFilePath);
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const currentDescribeBlock = run.current.describeBlock;
      (currentDescribeBlock ?? run)[internal.addDescribeBlock](describeId);
    },

    add_hook: (event: AddHookEvent) => {
      const run = this.metadata.getRunMetadata(event.testFilePath);
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const currentDescribeBlock = run.current.describeBlock;
      if (!currentDescribeBlock) {
        throw new JestMetadataError('No current describe block');
      }
      currentDescribeBlock[internal.addHookDefinition](hookId, event.hookType);
    },

    add_test: (event: AddTestEvent) => {
      const run = this.metadata.getRunMetadata(event.testFilePath);
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const currentDescribeBlock = run.current.describeBlock;
      if (!currentDescribeBlock) {
        throw new JestMetadataError('No current describe block');
      }

      currentDescribeBlock[internal.addTestEntry](testId);
    },

    finish_describe_definition: (event: FinishDescribeDefinitionEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      this.config.aggregatedMetadataRegistry
        .get(describeId)
        [internal.as](DescribeBlockMetadata)
        [internal.finish]();
    },

    run_start: (event: RunStartEvent) => {
      const run = this.metadata.getRunMetadata(event.testFilePath);
      run[internal.start]();
    },

    run_finish: (event: RunFinishEvent) => {
      const run = this.metadata.getRunMetadata(event.testFilePath);
      run[internal.finish]();
    },

    run_describe_start: (event: RunDescribeStartEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const describe = this.config.aggregatedMetadataRegistry
        .get(describeId)
        [internal.as](DescribeBlockMetadata);

      describe[internal.start]();
    },

    hook_start: (event: HookStartEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this.config.aggregatedMetadataRegistry
        .get(hookId)
        [internal.as](HookDefinitionMetadata);

      hookDef[internal.start]();
    },

    hook_success: (event: HookSuccessEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this.config.aggregatedMetadataRegistry
        .get(hookId)
        [internal.as](HookDefinitionMetadata);

      hookDef[internal.finish]();
    },

    hook_failure: (event: HookFailureEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this.config.aggregatedMetadataRegistry
        .get(hookId)
        [internal.as](HookDefinitionMetadata);

      hookDef[internal.finish]();
    },

    run_describe_finish: (event: RunDescribeFinishEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const describe = this.config.aggregatedMetadataRegistry
        .get(describeId)
        [internal.as](DescribeBlockMetadata);

      describe[internal.finish]();
    },

    test_start: (event: TestStartEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);

      test[internal.start]();
    },

    test_retry: (event: TestRetryEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);

      test[internal.start]();
    },

    test_fn_start: (event: TestFnStartEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot start test function without an invocation');
      }

      lastInvocation[internal.start]();
    },

    test_fn_failure: (event: TestFnFailureEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot finish test function without an invocation');
      }

      lastInvocation[internal.finish]();
    },

    test_fn_success: (event: TestFnSuccessEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot finish test function without an invocation');
      }

      lastInvocation[internal.finish]();
    },

    test_skip: (event: TestSkipEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);

      test[internal.finish]();
    },

    test_todo: (event: TestTodoEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);

      test[internal.finish]();
    },

    test_done: (event: TestDoneEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this.config.aggregatedMetadataRegistry
        .get(testId)
        [internal.as](TestEntryMetadata);

      test[internal.finish]();
    },

    set_metadata: (event: SetMetadataEvent) => {
      const targetId = new AggregatedIdentifier(event.testFilePath, event.targetId);
      const metadata = this.config.aggregatedMetadataRegistry.get(targetId);

      switch (event.operation) {
        case 'set': {
          if (!event.path) throw new JestMetadataError('Path is required for set operation');
          metadata.set(event.path, event.value);
          break;
        }
        case 'assign': {
          metadata.assign(event.path, event.value as Data);
          break;
        }
        case 'merge': {
          metadata.merge(event.path, event.value as Data);
          break;
        }
      }
    },
  };

  constructor(protected readonly config: MetadataEventHandlerConfig) {
    this.metadata = new AggregatedResultMetadata({
      emitter: config.emitter,
      aggregatedMetadataRegistry: config.aggregatedMetadataRegistry,
    });
  }

  handle: MetadataEventEmitterCallback = (event: MetadataEvent): void => {
    const handler = this._handlers[event.type] as MetadataEventEmitterCallback;
    handler(event);
  };
}
