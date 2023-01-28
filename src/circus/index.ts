// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';
import { CircusContext } from './CircusContext';
import { CurrentQuery } from './types';

const circusContext = new CircusContext();

export function startTestFile(_testFilePath: string): void {
  circusContext.foo();
}

export const handleTestEvent: Circus.EventHandler = (event, _state) => {
  switch (event.name) {
    case 'hook_start': {
      break;
    }
    case 'hook_success': {
      break;
    }
    case 'hook_failure': {
      break;
    }
    case 'test_fn_start': {
      break;
    }
    case 'test_fn_success': {
      break;
    }
    case 'test_fn_failure': {
      break;
    }
    case 'test_retry': {
      break;
    }
    case 'test_start': {
      break;
    }
    case 'test_skip': {
      break;
    }
    case 'test_todo': {
      break;
    }
    case 'test_done': {
      break;
    }
    case 'run_describe_start': {
      break;
    }
    case 'run_describe_finish': {
      break;
    }
    case 'include_test_location_in_result':
    case 'start_describe_definition':
    case 'finish_describe_definition':
    case 'add_hook':
    case 'add_test':
    case 'error':
    case 'setup':
    case 'run_start':
    case 'run_finish':
    case 'teardown': {
      break;
    }
  }
};

export const current: CurrentQuery = {
  context: undefined,
  describeBlock: undefined,
  execution: undefined,
  hook: undefined,
  run: undefined,
  testEntry: undefined,
  testFn: undefined,
  testInvocation: undefined,
};

export const flush = (): Promise<void> => {
  return Promise.resolve();
};
