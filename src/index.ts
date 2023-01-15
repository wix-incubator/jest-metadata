// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';

import { Storage } from './Storage';

const storage = new Storage();

export function startTestFile(testFileName: string) {
  storage.openTestFile(testFileName);
}

export function handleTestEvent(event: Circus.Event) {
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
}

export function currentContext() {}
