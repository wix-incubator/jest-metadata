// eslint-disable-next-line node/no-unpublished-import
import type { JestEnvironment, JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

export function onTestEnvironmentCreate(
  environment: JestEnvironment,
  _config: JestEnvironmentConfig,
  context: EnvironmentContext,
): void {
  environment.global.__JEST_METADATA__ = { foo: 'bar' };
  window.postMessage('hoho', context.testPath);
}

export async function onTestEnvironmentSetup(): Promise<void> {
  // TODO: start IPC client
}

export async function onTestEnvironmentTeardown(): Promise<void> {
  // TODO: stop IPC client
}

export function onHandleTestEvent(_event: Circus.Event, _state: Circus.State): void {
  // TODO: call our circus handler
}
