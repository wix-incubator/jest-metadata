import { inspect } from 'util';
import type { EnvironmentContext, JestEnvironment, JestEnvironmentConfig } from '@jest/environment';
import type { Circus } from '@jest/types';
import { JestMetadataError } from './errors';
import { realm, injectRealmIntoSandbox } from './realms';
import { SemiAsyncEmitter } from './utils';

const emitterMap: WeakMap<object, SemiAsyncEmitter<ForwardedCircusEvent>> = new WeakMap();

export function onTestEnvironmentCreate(
  jestEnvironment: JestEnvironment,
  jestEnvironmentConfig: JestEnvironmentConfig,
  environmentContext: EnvironmentContext,
): void {
  injectRealmIntoSandbox(jestEnvironment.global, realm);
  const testFilePath = environmentContext.testPath;
  realm.environmentHandler.handleEnvironmentCreated(testFilePath);
  realm.events.add(realm.setEmitter);

  if (!realm.globalMetadata.hasTestFileMetadata(testFilePath)) {
    if (realm.type === 'child_process') {
      realm.coreEmitter.emit({
        type: 'add_test_file',
        testFilePath,
      });
    } else {
      const { globalConfig } = jestEnvironmentConfig;
      const first = <T>(r: T[]) => r[0];
      const hint = globalConfig?.reporters
        ? `  "reporters": ${inspect(globalConfig.reporters.map(first))}\n`
        : ''; // Jest 27 fallback

      throw new JestMetadataError(
        `Cannot use a metadata test environment without a metadata server.\n` +
          `Please check that at least one of the reporters in your Jest config inherits from "jest-metadata/reporter".\n` +
          hint,
      );
    }
  }

  const testEventHandler = ({ event, state }: ForwardedCircusEvent) => {
    realm.environmentHandler.handleTestEvent(event, state);
  };

  const flushHandler = () => realm.ipc.flush();

  const emitter = new SemiAsyncEmitter<ForwardedCircusEvent>('environment', [
    'start_describe_definition',
    'finish_describe_definition',
    'add_hook',
    'add_test',
    'error',
  ])
    .on('setup', testEventHandler, -1)
    .on('include_test_location_in_result', testEventHandler, -1)
    .on('start_describe_definition', testEventHandler, -1)
    .on('finish_describe_definition', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('add_hook', testEventHandler, -1)
    .on('add_test', testEventHandler, -1)
    .on('run_start', testEventHandler, -1)
    .on('run_start', flushHandler, Number.MAX_SAFE_INTEGER)
    .on('run_describe_start', testEventHandler, -1)
    .on('hook_failure', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('hook_start', testEventHandler, -1)
    .on('hook_success', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('test_start', testEventHandler, -1)
    .on('test_start', flushHandler, Number.MAX_SAFE_INTEGER)
    .on('test_started', testEventHandler, -1)
    .on('test_retry', testEventHandler, -1)
    .on('test_skip', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('test_todo', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('test_fn_start', testEventHandler, -1)
    .on('test_fn_failure', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('test_fn_success', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('test_done', testEventHandler, Number.MAX_SAFE_INTEGER - 1)
    .on('test_done', flushHandler, Number.MAX_SAFE_INTEGER)
    .on('run_describe_finish', testEventHandler, Number.MAX_SAFE_INTEGER)
    .on('run_finish', testEventHandler, Number.MAX_SAFE_INTEGER - 1)
    .on('run_finish', flushHandler, Number.MAX_SAFE_INTEGER)
    .on('teardown', testEventHandler, Number.MAX_SAFE_INTEGER);

  emitterMap.set(jestEnvironment, emitter);
}

export type ForwardedCircusEvent<E extends Circus.Event = Circus.Event> = {
  type: E['name'];
  event: E;
  state: Circus.State;
};

export async function onTestEnvironmentSetup(): Promise<void> {
  if (realm.type === 'child_process') {
    await realm.ipc.start();
  }
}

export async function onTestEnvironmentTeardown(): Promise<void> {
  if (realm.type === 'child_process') {
    await realm.ipc.stop();
  }
}

/**
 * Pass Jest Circus event and state to the handler.
 * After recalculating the state, this method synchronizes with the metadata server.
 */
export const onHandleTestEvent = (
  env: JestEnvironment,
  event: Circus.Event,
  state: Circus.State,
): void | Promise<void> => getEmitter(env).emit({ type: event.name, event, state });

export const getEmitter = (env: JestEnvironment) => {
  const emitter = emitterMap.get(env);
  if (!emitter) {
    throw new JestMetadataError(
      'Emitter is not found. Most likely, you are using a non-valid environment reference.',
    );
  }

  return emitter;
};
