// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { CircusTestEventHandlerConfig } from './CircusTestEventHandlerConfig';
import { Event } from '../events';

export class CircusTestEventHandler {
  protected testFilePath = '';

  constructor(protected readonly config: CircusTestEventHandlerConfig) {}

  handleTestEvent: Circus.EventHandler = (event, state) => {
    switch (event.name) {
      case 'setup': {
        return this.setup(event, state);
      }
      case 'hook_start': {
        return this.hook_start(event);
      }
      case 'hook_success': {
        return this.hook_success(event);
      }
      case 'hook_failure': {
        return this.hook_failure(event);
      }
      case 'test_fn_start': {
        return this.test_fn_start(event);
      }
      case 'test_fn_success': {
        return this.test_fn_success(event);
      }
      case 'test_fn_failure': {
        return this.test_fn_failure(event);
      }
      case 'test_retry': {
        return this.test_retry(event);
      }
      case 'test_start': {
        return this.test_start(event);
      }
      case 'test_skip': {
        return this.test_skip(event);
      }
      case 'test_todo': {
        return this.test_todo(event);
      }
      case 'test_done': {
        return this.test_done(event);
      }
      case 'run_describe_start': {
        return this.run_describe_start(event);
      }
      case 'run_describe_finish': {
        return this.run_describe_finish(event);
      }
      case 'run_start': {
        return this.run_start(event);
      }
      case 'run_finish': {
        return this.run_finish(event);
      }
      case 'start_describe_definition': {
        return this.start_describe_definition(event, state);
      }
      case 'finish_describe_definition': {
        return this.finish_describe_definition(event, state);
      }
      case 'add_hook': {
        return this.add_hook(event);
      }
      case 'add_test': {
        return this.add_test(event);
      }
    }
  };

  test_environment_created(testFilePath: string) {
    this.testFilePath = testFilePath;
    this.emit({
      type: 'test_environment_created',
      testFilePath,
    });
  }

  setup(_event: Circus.Event & { name: 'setup' }, state: Circus.State) {
    // The root describe block is not emitted by Circus, so we emit it here.
    this.emit({
      type: 'start_describe_definition',
      testFilePath: this.testFilePath,
      describeId: this.config.getDescribeId(state.rootDescribeBlock),
    });
  }

  start_describe_definition(
    _event: Circus.Event & { name: 'start_describe_definition' },
    state: Circus.State,
  ) {
    // Safeguard in case Circus ever starts emitting describe blocks.
    if (state.currentDescribeBlock === state.rootDescribeBlock) {
      return;
    }

    this.emit({
      type: 'start_describe_definition',
      testFilePath: this.testFilePath,
      describeId: this.config.getDescribeId(state.currentDescribeBlock),
    });
  }

  add_hook(event: Circus.Event & { name: 'add_hook' }) {
    this.emit({
      type: 'add_hook',
      testFilePath: this.testFilePath,
      hookId: this.config.getHookId(event.fn),
      hookType: event.hookType,
    });
  }

  add_test(event: Circus.Event & { name: 'add_test' }) {
    this.emit({
      type: 'add_test',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.fn),
    });
  }

  finish_describe_definition(
    _event: Circus.Event & { name: 'finish_describe_definition' },
    state: Circus.State,
  ) {
    this.emit({
      type: 'finish_describe_definition',
      testFilePath: this.testFilePath,
      describeId: this.config.getDescribeId(state.currentDescribeBlock),
    });
  }

  hook_start(event: Circus.Event & { name: 'hook_start' }) {
    this.emit({
      type: 'hook_start',
      testFilePath: this.testFilePath,
      hookId: this.config.getHookId(event.hook.fn),
    });
  }

  hook_success(event: Circus.Event & { name: 'hook_success' }) {
    this.emit({
      type: 'hook_success',
      testFilePath: this.testFilePath,
      hookId: this.config.getHookId(event.hook.fn),
    });
  }

  hook_failure(event: Circus.Event & { name: 'hook_failure' }) {
    this.emit({
      type: 'hook_failure',
      testFilePath: this.testFilePath,
      hookId: this.config.getHookId(event.hook.fn),
    });
  }

  test_fn_start(event: Circus.Event & { name: 'test_fn_start' }) {
    this.emit({
      type: 'test_fn_start',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_fn_success(event: Circus.Event & { name: 'test_fn_success' }) {
    this.emit({
      type: 'test_fn_success',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_fn_failure(event: Circus.Event & { name: 'test_fn_failure' }) {
    this.emit({
      type: 'test_fn_failure',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_retry(event: Circus.Event & { name: 'test_retry' }) {
    this.emit({
      type: 'test_retry',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_start(event: Circus.Event & { name: 'test_start' }) {
    this.emit({
      type: 'test_start',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_skip(event: Circus.Event & { name: 'test_skip' }) {
    this.emit({
      type: 'test_skip',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_todo(event: Circus.Event & { name: 'test_todo' }) {
    this.emit({
      type: 'test_todo',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  test_done(event: Circus.Event & { name: 'test_done' }) {
    this.emit({
      type: 'test_done',
      testFilePath: this.testFilePath,
      testId: this.config.getTestId(event.test.fn),
    });
  }

  run_describe_start(event: Circus.Event & { name: 'run_describe_start' }) {
    this.emit({
      type: 'run_describe_start',
      testFilePath: this.testFilePath,
      describeId: this.config.getDescribeId(event.describeBlock),
    });
  }

  run_describe_finish(event: Circus.Event & { name: 'run_describe_finish' }) {
    this.emit({
      type: 'run_describe_finish',
      testFilePath: this.testFilePath,
      describeId: this.config.getDescribeId(event.describeBlock),
    });
  }

  run_start(_event: Circus.Event & { name: 'run_start' }) {
    this.emit({
      type: 'run_start',
      testFilePath: this.testFilePath,
    });
  }

  run_finish(_event: Circus.Event & { name: 'run_finish' }) {
    this.emit({
      type: 'run_finish',
      testFilePath: this.testFilePath,
    });
  }

  protected emit(event: Event) {
    this.config.eventQueue.enqueue(event);
  }
}
