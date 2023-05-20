// eslint-disable-next-line node/no-unpublished-import, @typescript-eslint/no-unused-vars
import type { EnvironmentContext, JestEnvironment } from '@jest/environment';
// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';
import { realm, injectRealmIntoSandbox } from './realms';

/**
 * @param jestEnvironment {@link JestEnvironment}
 * @param _jestEnvironmentConfig {@link JestEnvironmentConfig}
 * @param environmentContext {@link EnvironmentContext}
 */
export function onTestEnvironmentCreate(
  jestEnvironment: unknown,
  _jestEnvironmentConfig: unknown,
  environmentContext: unknown,
): void {
  injectRealmIntoSandbox((jestEnvironment as JestEnvironment).global, realm);
  realm.environmentHandler.handleEnvironmentCreated(
    (environmentContext as EnvironmentContext).testPath,
  );
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
 * This method does not synchronize with the metadata server.
 * @param circusEvent
 * @param circusState
 * @see {@link Circus.Event}
 * @see {@link Circus.State}
 */
export const onHandleTestEventSync = (circusEvent: unknown, circusState: unknown): void => {
  realm.environmentHandler.handleTestEvent(
    circusEvent as Circus.Event,
    circusState as Circus.State,
  );
};

/**
 * Pass Jest Circus event and state to the handler.
 * After recalculating the state, this method synchronizes with the metadata server.
 * @param circusEvent
 * @param circusState
 * @see {@link Circus.Event}
 * @see {@link Circus.State}
 */
export const onHandleTestEvent = async (
  circusEvent: unknown,
  circusState: unknown,
): Promise<void> => {
  onHandleTestEventSync(circusEvent, circusState);
  await realm.ipc.flush?.();
};
