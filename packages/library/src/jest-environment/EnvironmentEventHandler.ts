// eslint-disable-next-line node/no-unpublished-import
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
        hookId: this._instanceCache.getHookId(event.fn),
        hookType: event.hookType,
      });
    },

    add_test: (event: Circus.Event & { name: 'add_test' }) => {
      this._emitter.emit({
        type: 'add_test',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.fn),
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
        hookId: this._instanceCache.getHookId(event.hook.fn),
      });
    },

    hook_success: (event: Circus.Event & { name: 'hook_success' }) => {
      this._emitter.emit({
        type: 'hook_success',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.hook.fn),
      });
    },

    hook_failure: (event: Circus.Event & { name: 'hook_failure' }) => {
      this._emitter.emit({
        type: 'hook_failure',
        testFilePath: this._testFilePath,
        hookId: this._instanceCache.getHookId(event.hook.fn),
      });
    },

    test_fn_start: (event: Circus.Event & { name: 'test_fn_start' }) => {
      this._emitter.emit({
        type: 'test_fn_start',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_fn_success: (event: Circus.Event & { name: 'test_fn_success' }) => {
      this._emitter.emit({
        type: 'test_fn_success',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_fn_failure: (event: Circus.Event & { name: 'test_fn_failure' }) => {
      this._emitter.emit({
        type: 'test_fn_failure',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_retry: (event: Circus.Event & { name: 'test_retry' }) => {
      this._emitter.emit({
        type: 'test_retry',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_start: (event: Circus.Event & { name: 'test_start' }) => {
      this._emitter.emit({
        type: 'test_start',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_skip: (event: Circus.Event & { name: 'test_skip' }) => {
      this._emitter.emit({
        type: 'test_skip',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_todo: (event: Circus.Event & { name: 'test_todo' }) => {
      this._emitter.emit({
        type: 'test_todo',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
      });
    },

    test_done: (event: Circus.Event & { name: 'test_done' }) => {
      this._emitter.emit({
        type: 'test_done',
        testFilePath: this._testFilePath,
        testId: this._instanceCache.getTestId(event.test.fn),
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
  };

  constructor(config: CircusTestEventHandlerConfig) {
    this._emitter = config.emitter;
  }

  get testFilePath(): string {
    return this._testFilePath;
  }

  handleEnvironmentCreated(testFilePath: string) {
    this._instanceCache = new CircusInstanceCache();
    this._testFilePath = testFilePath;
    this._emitter.emit({
      type: 'add_test_file',
      testFilePath,
    });
  }

  handleTestEvent: Circus.EventHandler = (event, state) => {
    return this._circusEventHandlers[event.name]?.(event, state);
  };
}