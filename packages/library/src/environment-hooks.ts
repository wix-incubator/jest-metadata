import type { EnvironmentContext, JestEnvironment, JestEnvironmentConfig } from '@jest/environment';
import type { Circus } from '@jest/types';
import { realm, injectRealmIntoSandbox } from './realms';

/**
 * @param jestEnvironment {@link JestEnvironment}
 * @param _jestEnvironmentConfig {@link JestEnvironmentConfig}
 * @param environmentContext {@link EnvironmentContext}
 */
export function onTestEnvironmentCreate(
  jestEnvironment: JestEnvironment,
  _jestEnvironmentConfig: JestEnvironmentConfig,
  environmentContext: EnvironmentContext,
): void {
  injectRealmIntoSandbox(jestEnvironment.global, realm);
  const testFilePath = environmentContext.testPath;
  realm.environmentHandler.handleEnvironmentCreated(testFilePath);
  realm.events.add(realm.setEmitter);

  if (realm.type === 'child_process') {
    realm.coreEmitter.emit({
      type: 'add_test_file',
      testFilePath,
    });
  }
}

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
 * @param circusEvent
 * @param circusState
 */
export const onHandleTestEvent = (
  circusEvent: unknown,
  circusState: unknown,
): void | Promise<void> => {
  const event = circusEvent as Circus.Event;
  const state = circusState as Circus.State;

  realm.environmentHandler.handleTestEvent(event, state);

  switch (event.name) {
    case 'run_start':
    case 'test_start':
    case 'test_done':
    case 'run_finish': {
      return realm.ipc.flush?.();
    }
  }
};
