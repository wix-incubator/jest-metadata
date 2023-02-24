// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { CircusTestEventHandlerConfig } from './CircusTestEventHandlerConfig';

export class CircusTestEventHandler {
  protected readonly emit = this.config.emit.bind(this.config);
  protected testFilePath = '';

  constructor(protected readonly config: CircusTestEventHandlerConfig) {}

  test_environment_created(testFilePath: string) {
    this.testFilePath = testFilePath;
    this.emit({
      type: 'test_environment_created',
      testFilePath,
    });
  }

  start_describe_definition(
    _event: Circus.Event & { name: 'start_describe_definition' },
    state: Circus.State,
  ) {
    this.emit({
      type: 'start_describe_definition',
      testFilePath: this.testFilePath,
      describeId: this.config.getInstanceId(state.currentDescribeBlock),
    });
  }

  add_hook(event: Circus.Event & { name: 'add_hook' }) {
    this.emit({
      type: 'add_hook',
      testFilePath: this.testFilePath,
      hookType: event.hookType,
      hookId: this.config.getInstanceId(event.fn),
    });
  }

  add_test(event: Circus.Event & { name: 'add_test' }) {
    this.emit({
      type: 'add_test',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.fn),
    });
  }

  finish_describe_definition(
    _event: Circus.Event & { name: 'finish_describe_definition' },
    state: Circus.State,
  ) {
    this.emit({
      type: 'finish_describe_definition',
      testFilePath: this.testFilePath,
      describeId: this.config.getInstanceId(state.currentDescribeBlock),
    });
  }

  hook_start(event: Circus.Event & { name: 'hook_start' }) {
    this.emit({
      type: 'hook_start',
      testFilePath: this.testFilePath,
      hookId: this.config.getInstanceId(event.hook.fn),
    });
  }

  hook_success(event: Circus.Event & { name: 'hook_success' }) {
    this.emit({
      type: 'hook_success',
      testFilePath: this.testFilePath,
      hookId: this.config.getInstanceId(event.hook.fn),
    });
  }

  hook_failure(event: Circus.Event & { name: 'hook_failure' }) {
    this.emit({
      type: 'hook_failure',
      testFilePath: this.testFilePath,
      hookId: this.config.getInstanceId(event.hook.fn),
    });
  }

  test_fn_start(event: Circus.Event & { name: 'test_fn_start' }) {
    this.emit({
      type: 'test_fn_start',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_fn_success(event: Circus.Event & { name: 'test_fn_success' }) {
    this.emit({
      type: 'test_fn_success',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_fn_failure(event: Circus.Event & { name: 'test_fn_failure' }) {
    this.emit({
      type: 'test_fn_failure',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_retry(event: Circus.Event & { name: 'test_retry' }) {
    this.emit({
      type: 'test_retry',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_start(event: Circus.Event & { name: 'test_start' }) {
    this.emit({
      type: 'test_start',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_skip(event: Circus.Event & { name: 'test_skip' }) {
    this.emit({
      type: 'test_skip',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_todo(event: Circus.Event & { name: 'test_todo' }) {
    this.emit({
      type: 'test_todo',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  test_done(event: Circus.Event & { name: 'test_done' }) {
    this.emit({
      type: 'test_done',
      testFilePath: this.testFilePath,
      testId: this.config.getInstanceId(event.test.fn),
    });
  }

  run_describe_start(event: Circus.Event & { name: 'run_describe_start' }) {
    this.emit({
      type: 'run_describe_start',
      testFilePath: this.testFilePath,
      describeId: this.config.getInstanceId(event.describeBlock),
    });
  }

  run_describe_finish(event: Circus.Event & { name: 'run_describe_finish' }) {
    this.emit({
      type: 'run_describe_finish',
      testFilePath: this.testFilePath,
      describeId: this.config.getInstanceId(event.describeBlock),
    });
  }
}
