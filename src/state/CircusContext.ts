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
