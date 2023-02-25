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
import { AggregatedResultMetadata, BackupableQuery, Query } from '../state';
import { RootEventHandlerConfig } from './RootEventHandlerConfig';

export class RootEventHandler {
  public readonly current: Query;
  public readonly last: Query;
  protected readonly metadata: AggregatedResultMetadata;

  constructor(protected readonly config: RootEventHandlerConfig) {
    this.metadata = new AggregatedResultMetadata({
      emit: (event) => this.config.emit(event),
      register: (id, metadata) => config.metadataRegistry.register(id, metadata),
    });

    this.last = new Query();
    this.current = new BackupableQuery(this.last);
    this.current.aggregatedResult = this.metadata;
    this.last.aggregatedResult = this.metadata;
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'test_environment_created': {
        return this._handleTestEnvironmentCreated(event);
      }
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
  }

  private _handleTestEnvironmentCreated(event: TestEnvironmentCreatedEvent) {
    this.current.run = this.metadata.registerTestFile(event.testFilePath);
  }

  private _handleAddHook(_event: AddHookEvent) {
    // TODO: Implement
  }

  private _handleAddTest(_event: AddTestEvent) {
    // TODO: Implement
  }

  private _handleFinishDescribeDefinition(_event: FinishDescribeDefinitionEvent) {
    // TODO: Implement
  }

  private _handleHookFailure(_event: HookFailureEvent) {
    // TODO: Implement
  }

  private _handleHookStart(_event: HookStartEvent) {
    // TODO: Implement
  }

  private _handleHookSuccess(_event: HookSuccessEvent) {
    // TODO: Implement
  }

  private _handleRunDescribeFinish(_event: RunDescribeFinishEvent) {
    // TODO: Implement
  }

  private _handleRunDescribeStart(_event: RunDescribeStartEvent) {
    // TODO: Implement
  }

  private _handleSetMetadata(_event: SetMetadataEvent) {
    // TODO: Implement
  }

  private _handleStartDescribeDefinition(_event: StartDescribeDefinitionEvent) {
    // TODO: Implement
  }

  private _handleTestDone(_event: TestDoneEvent) {
    // TODO: Implement
  }

  private _handleTestFnFailure(_event: TestFnFailureEvent) {
    // TODO: Implement
  }

  private _handleTestFnStart(_event: TestFnStartEvent) {
    // TODO: Implement
  }

  private _handleTestFnSuccess(_event: TestFnSuccessEvent) {
    // TODO: Implement
  }

  private _handleTestRetry(_event: TestRetryEvent) {
    // TODO: Implement
  }

  private _handleTestSkip(_event: TestSkipEvent) {
    // TODO: Implement
  }

  private _handleTestStart(_event: TestStartEvent) {
    // TODO: Implement
  }

  private _handleTestTodo(_event: TestTodoEvent) {
    // TODO: Implement
  }
}

// // eslint-disable-next-line node/no-unpublished-import
// import { Circus } from '@jest/types';
//
// import { InstanceCache } from '../services';
//
// let counter = 0;
//
// export class CircusContext {
//
//   private _aggregatedResultMetadata?: AggregatedResultMetadata;
//   private _currentMetadata?: Metadata;
//   private _describeBlockMetadata?: DescribeBlockMetadata;
//   private _hookMetadata?: HookDefinitionMetadata | HookInvocationMetadata;
//   private _runMetadata?: RunMetadata;
//   private _testEntryMetadata?: TestEntryMetadata;
//   private _testFnMetadata?: HookInvocationMetadata | HookDefinitionMetadata;
//   private _testInvocationMetadata?: TestInvocationMetadata;
//
//   private readonly _cachedDescribeBlocks = new InstanceCache<
//     Circus.DescribeBlock,
//     DescribeBlockMetadata
//   >();
//   private readonly _cachedHooks = new InstanceCache<object /* fn */, HookDefinitionMetadata>();
//   private readonly _cachedTestEntries = new InstanceCache<object /* fn */, TestEntryMetadata>();
//
//   private readonly _contextAPI: ContextAPI = {
//     flush: async () => {
//       /* ... */
//     },
//     createRef(_instance: object): Ref {
//       return new Ref(++counter);
//     },
//     emit(_event) {
//       // TODO: emit event
//     },
//   };
//
//   new_environment(testFilePath: string) {
//     this._aggregatedResultMetadata = new AggregatedResultMetadata(this._contextAPI);
//     this._runMetadata = this._aggregatedResultMetadata.testResults[testFilePath] = new RunMetadata(
//       this._contextAPI,
//     );
//   }
//   start_describe_definition(
//     _event: Circus.Event & { name: 'start_describe_definition' },
//     state: Circus.State,
//   ) {
//     const currentDescribeBlock = state.currentDescribeBlock;
//     const currentDescribeBlockMetadata = this._cachedDescribeBlocks.get(
//       currentDescribeBlock,
//       () => new DescribeBlockMetadata(this._contextAPI),
//     );
//     currentDescribeBlockMetadata.parent = this._describeBlockMetadata;
//     this._describeBlockMetadata = currentDescribeBlockMetadata;
//   }
//
//   add_hook(event: Circus.Event & { name: 'add_hook' }) {
//     const describeBlockMetadata = this._describeBlockMetadata;
//
//     if (describeBlockMetadata) {
//       this._hookMetadata = this._cachedHooks.get(
//         event.fn,
//         () => new HookDefinitionMetadata(this._contextAPI, describeBlockMetadata),
//       );
//       describeBlockMetadata.hookDefinitions.push(this._hookMetadata);
//     }
//   }
//
//   add_test(event: Circus.Event & { name: 'add_test' }, _state: Circus.State) {
//     const describeBlockMetadata = this._describeBlockMetadata;
//
//     if (describeBlockMetadata) {
//       this._testEntryMetadata = this._cachedTestEntries.get(
//         event.fn,
//         () => new TestEntryMetadata(this._contextAPI, this._describeBlockMetadata!),
//       );
//     }
//   }
//
//   finish_describe_definition(_event: Circus.Event & { name: 'finish_describe_definition' }) {
//     this._describeBlockMetadata = undefined;
//   }
//
//   hook_start(_event: Circus.Event & { name: 'hook_start' }) {
//     // this._hookMetadata = new Metadata(this._contextAPI);
//   }
//
//   hook_success(_event: Circus.Event & { name: 'hook_success' }) {
//     this._hookMetadata = undefined;
//   }
//
//   hook_failure(_event: Circus.Event & { name: 'hook_failure' }) {
//     this._hookMetadata = undefined;
//   }
//
//   test_fn_start(_event: Circus.Event & { name: 'test_fn_start' }) {
//     // this._testFnMetadata = new Metadata(this._contextAPI);
//   }
//
//   test_fn_success(_event: Circus.Event & { name: 'test_fn_success' }) {
//     this._testFnMetadata = undefined;
//   }
//
//   test_fn_failure(_event: Circus.Event & { name: 'test_fn_failure' }) {
//     this._testFnMetadata = undefined;
//   }
//
//   test_retry(_event: Circus.Event & { name: 'test_retry' }) {
//     // this._testInvocationMetadata = new TestInvocationMetadata(this._contextAPI);
//   }
//
//   test_start(_event: Circus.Event & { name: 'test_start' }) {
//     // this._testEntryMetadata = this._cachedTestEntries.get(
//     //   event.test,
//     //   () => new TestEntryMetadata(this._contextAPI),
//     // );
//     // this._testInvocationMetadata = new TestInvocationMetadata(this._contextAPI);
//   }
//
//   test_skip(_event: Circus.Event & { name: 'test_skip' }) {
//     this._testEntryMetadata = undefined;
//     this._testInvocationMetadata = undefined;
//   }
//
//   test_todo(_event: Circus.Event & { name: 'test_todo' }) {
//     this._testEntryMetadata = undefined;
//     this._testInvocationMetadata = undefined;
//   }
//
//   test_done(_event: Circus.Event & { name: 'test_done' }) {
//     this._testEntryMetadata = undefined;
//     this._testInvocationMetadata = undefined;
//   }
//
//   run_describe_start(event: Circus.Event & { name: 'run_describe_start' }) {
//     this._describeBlockMetadata = this._cachedDescribeBlocks.get(
//       event.describeBlock,
//       () => new DescribeBlockMetadata(this._contextAPI),
//     );
//   }
//
//   run_describe_finish(_event: Circus.Event & { name: 'run_describe_finish' }) {
//     this._describeBlockMetadata = undefined;
//   }
// }
