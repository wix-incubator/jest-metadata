import type { Circus } from '@jest/types';

import type { MetadataEventEmitter } from '../metadata';

import { CircusInstanceCache } from './CircusInstanceCache';

export type CircusTestEventHandlerConfig = {
  readonly emitter: MetadataEventEmitter;
};

type CircusSyncEventHandler = (event: any, state: Circus.State) => void;

export class EnvironmentEventHandler {
  private _instanceCache = new CircusInstanceCache();
  private _testFilePath = '';
  private readonly _emitter: MetadataEventEmitter;

  private readonly _circusEventHandlers: Record<Circus.Event['name'], CircusSyncEventHandler> = {
    setup: (_event: Circus.Event & { name: 'setup' }, state: Circus.State) => {
      // Auxiliary event for ensuring that the test environment is Jest Circus, not Jest Jasmine.
      this._emitter.emit({
        type: 'setup',
        testFilePath: this._testFilePath,
      });

      // The root describe block is not emitted by Circus, so we emit it here.
      this._emitter.emit({
        type: 'start_describe_definition',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(state.rootDescribeBlock),
      });
    },

    include_test_location_in_result: () => {
      /* noop */
    },

    start_describe_definition: (
      _event: Circus.Event & { name: 'start_describe_definition' },
      state: Circus.State,
    ) => {
      // Safeguard in case Circus ever starts emitting describe blocks.
      if (state.currentDescribeBlock === state.rootDescribeBlock) {
        return;
      }

      this._emitter.emit({
        type: 'start_describe_definition',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(state.currentDescribeBlock),
      });
    },

    add_hook: (event: Circus.Event & { name: 'add_hook' }) => {
      this._emitter.emit({
        type: 'add_hook',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.asyncError),
        hookType: event.hookType,
      });
    },

    add_test: (event: Circus.Event & { name: 'add_test' }) => {
      this._emitter.emit({
        type: 'add_test',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.asyncError),
      });
    },

    finish_describe_definition: (
      _event: Circus.Event & { name: 'finish_describe_definition' },
      state: Circus.State,
    ) => {
      const block = state.currentDescribeBlock;
      const lastChild = block.children[block.children.length - 1]!;

      this._emitter.emit({
        type: 'finish_describe_definition',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(lastChild),
      });
    },

    hook_start: (event: Circus.Event & { name: 'hook_start' }) => {
      this._emitter.emit({
        type: 'hook_start',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.hook.asyncError),
      });
    },

    hook_success: (event: Circus.Event & { name: 'hook_success' }) => {
      this._emitter.emit({
        type: 'hook_success',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.hook.asyncError),
      });
    },

    hook_failure: (event: Circus.Event & { name: 'hook_failure' }) => {
      this._emitter.emit({
        type: 'hook_failure',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.hook.asyncError),
      });
    },

    test_fn_start: (event: Circus.Event & { name: 'test_fn_start' }) => {
      this._emitter.emit({
        type: 'test_fn_start',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_fn_success: (event: Circus.Event & { name: 'test_fn_success' }) => {
      this._emitter.emit({
        type: 'test_fn_success',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_fn_failure: (event: Circus.Event & { name: 'test_fn_failure' }) => {
      this._emitter.emit({
        type: 'test_fn_failure',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_retry: (event: Circus.Event & { name: 'test_retry' }) => {
      this._emitter.emit({
        type: 'test_retry',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_start: (event: Circus.Event & { name: 'test_start' }) => {
      this._emitter.emit({
        type: 'test_start',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_started: (event: Circus.Event & { name: 'test_started' }) => {
      this._emitter.emit({
        type: 'test_started',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_skip: (event: Circus.Event & { name: 'test_skip' }) => {
      this._emitter.emit({
        type: 'test_skip',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_todo: (event: Circus.Event & { name: 'test_todo' }) => {
      this._emitter.emit({
        type: 'test_todo',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    test_done: (event: Circus.Event & { name: 'test_done' }) => {
      this._emitter.emit({
        type: 'test_done',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.asyncError),
      });
    },

    run_describe_start: (event: Circus.Event & { name: 'run_describe_start' }) => {
      this._emitter.emit({
        type: 'run_describe_start',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(event.describeBlock),
      });
    },

    run_describe_finish: (event: Circus.Event & { name: 'run_describe_finish' }) => {
      this._emitter.emit({
        type: 'run_describe_finish',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(event.describeBlock),
      });
    },

    run_start: (_event: Circus.Event & { name: 'run_start' }, state: Circus.State) => {
      this._emitter.emit({
        type: 'finish_describe_definition',
        testFilePath: this._testFilePath,
        describeId: this._instanceCache.getDescribeId(state.rootDescribeBlock),
      });

      this._emitter.emit({
        type: 'run_start',
        testFilePath: this._testFilePath,
      });
    },

    run_finish: () => {
      this._emitter.emit({
        type: 'run_finish',
        testFilePath: this._testFilePath,
      });
    },

    teardown: () => {
      /* no-op */
    },

    error: () => {
      /* no-op */
    },

    error_handled: () => {
      /* no-op - this is a new Jest 30 event, keeping as no-op for now */
    },
  };

  constructor(config: CircusTestEventHandlerConfig) {
    this._emitter = config.emitter;
  }

  get testFilePath(): string {
    return this._testFilePath;
  }

  /**
   * Since this class is instantiated only once per the whole test session
   * in the global realm (parent or child), we need to reset its instance cache
   * and update the test file path when a new test file is started.
   * @param testFilePath
   */
  handleEnvironmentCreated(testFilePath: string): void {
    this._instanceCache = new CircusInstanceCache();
    this._testFilePath = testFilePath;
  }

  handleTestEvent = (event: Circus.Event, state: Circus.State): void => {
    return this._circusEventHandlers[event.name]?.(event, state);
  };
}
