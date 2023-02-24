// eslint-disable-next-line node/no-unpublished-import
import { Circus } from '@jest/types';
import { CircusTestEventHandler } from './CircusTestEventHandler';
import { InstanceCache } from '../services';
import { Event } from '../events';
import { AggregatedResultMetadata, CurrentQuery } from '../state';

const instanceCache = new InstanceCache();

let emitter = {
  emit: (event: Event) => {
    console.log('Emitting:', event);
  },
};

const state = new AggregatedResultMetadata({
  id: '0',
  emit: (event) => emitter.emit(event),
});

export function setEmitter(emitterNew: typeof emitter) {
  emitter = emitterNew;
}

export const current = new CurrentQuery(state);

const handler = new CircusTestEventHandler({
  getInstanceId: instanceCache.getInstanceId,
  emit: (event) => emitter.emit(event),
});

export function startTestFile(testFilePath: string): void {
  handler.test_environment_created(testFilePath);
}

export const handleTestEvent: Circus.EventHandler = (event, state) => {
  switch (event.name) {
    case 'hook_start': {
      return handler.hook_start(event);
    }
    case 'hook_success': {
      return handler.hook_success(event);
    }
    case 'hook_failure': {
      return handler.hook_failure(event);
    }
    case 'test_fn_start': {
      return handler.test_fn_start(event);
    }
    case 'test_fn_success': {
      return handler.test_fn_success(event);
    }
    case 'test_fn_failure': {
      return handler.test_fn_failure(event);
    }
    case 'test_retry': {
      return handler.test_retry(event);
    }
    case 'test_start': {
      return handler.test_start(event);
    }
    case 'test_skip': {
      return handler.test_skip(event);
    }
    case 'test_todo': {
      return handler.test_todo(event);
    }
    case 'test_done': {
      return handler.test_done(event);
    }
    case 'run_describe_start': {
      return handler.run_describe_start(event);
    }
    case 'run_describe_finish': {
      return handler.run_describe_finish(event);
    }
    case 'start_describe_definition': {
      return handler.start_describe_definition(event, state);
    }
    case 'finish_describe_definition': {
      return handler.finish_describe_definition(event, state);
    }
    case 'add_hook': {
      return handler.add_hook(event);
    }
    case 'add_test': {
      return handler.add_test(event);
    }
  }
};

export const flush = (): Promise<void> => {
  return Promise.resolve();
};
