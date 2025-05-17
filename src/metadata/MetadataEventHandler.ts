import { JestMetadataError } from '../errors';

import type {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  TestEntryMetadata,
} from './containers';

import type {
  MetadataEvent,
  SetupEvent,
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
  WriteMetadataEvent,
  StartDescribeDefinitionEvent,
  TestDoneEvent,
  AddTestFileEvent,
  TestFnFailureEvent,
  TestFnStartEvent,
  TestFnSuccessEvent,
  TestRetryEvent,
  TestSkipEvent,
  TestStartEvent,
  TestStartedEvent,
  TestTodoEvent,
  MetadataEventType,
} from './events';

import { AggregatedIdentifier } from './ids';
import type { FileMetadataRegistry } from './registry';
import * as internal from './symbols';

export type MetadataEventHandlerConfig = {
  readonly globalMetadata: GlobalMetadata;
  readonly metadataRegistry: FileMetadataRegistry<AggregatedIdentifier>;
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
  private readonly _metadata: GlobalMetadata;
  private readonly _metadataRegistry: FileMetadataRegistry<AggregatedIdentifier>;
  private readonly _handlers: MetadataEventHandlerMap = {
    setup: (_event: SetupEvent) => {
      /* no-op */
    },

    add_test_file: (event: AddTestFileEvent) => {
      this._metadata.registerTestFile(event.testFilePath);
    },

    start_describe_definition: (event: StartDescribeDefinitionEvent) => {
      const file = this._metadata.getTestFileMetadata(event.testFilePath);
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const currentDescribeBlock = file.current.describeBlock;
      (currentDescribeBlock ?? file)[internal.addDescribeBlock](describeId);
    },

    add_hook: (event: AddHookEvent) => {
      const file = this._metadata.getTestFileMetadata(event.testFilePath);
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const currentDescribeBlock = file.current.describeBlock;
      if (!currentDescribeBlock) {
        throw new JestMetadataError('No current describe block');
      }
      currentDescribeBlock[internal.addHookDefinition](hookId, event.hookType);
    },

    add_test: (event: AddTestEvent) => {
      const file = this._metadata.getTestFileMetadata(event.testFilePath);
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const currentDescribeBlock = file.current.describeBlock;
      if (!currentDescribeBlock) {
        throw new JestMetadataError('No current describe block');
      }

      currentDescribeBlock[internal.addTestEntry](testId);
    },

    finish_describe_definition: (event: FinishDescribeDefinitionEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      (this._metadataRegistry.get(describeId) as DescribeBlockMetadata)[internal.finish]();
      // TODO: [internal.as](DescribeBlockMetadata)
    },

    run_start: (event: RunStartEvent) => {
      const file = this._metadata.getTestFileMetadata(event.testFilePath);
      file[internal.start]();
    },

    run_finish: (event: RunFinishEvent) => {
      const file = this._metadata.getTestFileMetadata(event.testFilePath);
      file[internal.finish]();
    },

    run_describe_start: (event: RunDescribeStartEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const describe = this._metadataRegistry.get(describeId) as DescribeBlockMetadata;
      // TODO: [internal.as](DescribeBlockMetadata);

      describe[internal.start]();
    },

    hook_start: (event: HookStartEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this._metadataRegistry.get(hookId) as HookDefinitionMetadata;
      // TODO: [internal.as](HookDefinitionMetadata);

      hookDef[internal.start]();
    },

    hook_success: (event: HookSuccessEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this._metadataRegistry.get(hookId) as HookDefinitionMetadata;
      // TODO: [internal.as](HookDefinitionMetadata);

      hookDef[internal.finish]();
    },

    hook_failure: (event: HookFailureEvent) => {
      const hookId = new AggregatedIdentifier(event.testFilePath, event.hookId);
      const hookDef = this._metadataRegistry.get(hookId) as HookDefinitionMetadata;
      // TODO: [internal.as](HookDefinitionMetadata);

      hookDef[internal.finish]();
    },

    run_describe_finish: (event: RunDescribeFinishEvent) => {
      const describeId = new AggregatedIdentifier(event.testFilePath, event.describeId);
      const describe = this._metadataRegistry.get(describeId) as DescribeBlockMetadata;
      // TODO: [internal.as](DescribeBlockMetadata);

      describe[internal.finish]();
    },

    test_start: (event: TestStartEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);

      test[internal.start]();
    },

    test_started: (_event: TestStartedEvent) => {
      // no-op at the moment
    },

    test_retry: (_event: TestRetryEvent) => {
      // Nothing to do, because Jest Circus will emit a `test_start` event anyway right after this
    },

    test_fn_start: (event: TestFnStartEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot start test function without an invocation');
      }

      lastInvocation[internal.start]();
    },

    test_fn_failure: (event: TestFnFailureEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot finish test function without an invocation');
      }

      lastInvocation[internal.finish]();
    },

    test_fn_success: (event: TestFnSuccessEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);
      const lastInvocation = test.lastInvocation;
      if (!lastInvocation) {
        throw new JestMetadataError('Cannot finish test function without an invocation');
      }

      lastInvocation[internal.finish]();
    },

    test_skip: (event: TestSkipEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);

      test[internal.finish](true);
    },

    test_todo: (event: TestTodoEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);

      test[internal.finish]();
    },

    test_done: (event: TestDoneEvent) => {
      const testId = new AggregatedIdentifier(event.testFilePath, event.testId);
      const test = this._metadataRegistry.get(testId) as TestEntryMetadata;
      // TODO: [internal.as](TestEntryMetadata);

      test[internal.finish]();
    },

    write_metadata: (event: WriteMetadataEvent) => {
      const targetId = new AggregatedIdentifier(event.testFilePath, event.targetId);
      const metadata = this._metadataRegistry.get(targetId);

      metadata[event.operation](event.path!, event.value as any);
    },
  };

  constructor(protected readonly config: MetadataEventHandlerConfig) {
    this._metadata = config.globalMetadata;
    this._metadataRegistry = config.metadataRegistry;
  }

  handle = (event: MetadataEvent): void => {
    const handler = this._handlers[event.type] as (event: MetadataEvent) => void;
    handler(event);
  };

  backToDescribe = (testFilePath: string): void => {
    const file = this._metadata.getTestFileMetadata(testFilePath);
    const currentDescribeBlock = file.current.describeBlock;
    if (!currentDescribeBlock) {
      throw new JestMetadataError('No current describe block');
    }

    file[internal.currentMetadata] = currentDescribeBlock;
  };
}
