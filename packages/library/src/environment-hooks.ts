/* eslint-disable @typescript-eslint/no-explicit-any */
import { realm, injectRealmIntoSandbox } from './realms';

// TODO: how to use JSDoc to link to the types

/**
 * @param jestEnvironment {@link JestEnvironment}
 * @param _jestEnvironmentConfig {@link JestEnvironmentConfig}
 * @param environmentContext {@link EnvironmentContext}
 */
export function onTestEnvironmentCreate(
  jestEnvironment: any,
  _jestEnvironmentConfig: any,
  environmentContext: any,
): void {
  injectRealmIntoSandbox(jestEnvironment.global, realm);
  realm.environmentHandler.handleEnvironmentCreated(environmentContext.testPath);
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
 *
 * @param circusEvent
 * @param circusState
 * @see {@link Circus.Event}
 * @see {@link Circus.State}
 */
export const onHandleTestEvent = async (circusEvent: any, circusState: any): Promise<void> => {
  realm.environmentHandler.handleTestEvent(circusEvent, circusState);
  await realm.ipc.flush();
};
