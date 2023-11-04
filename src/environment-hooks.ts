import { inspect } from 'util';
import type { EnvironmentContext, JestEnvironment, JestEnvironmentConfig } from '@jest/environment';
import type { Circus } from '@jest/types';
import { JestMetadataError } from './errors';
import { injectRealmIntoSandbox, realm, detectDuplicateRealms } from './realms';
import { logger, jestUtils, SemiAsyncEmitter } from './utils';

const log = logger.child({ cat: 'environment', tid: 'environment' });
const emitterMap: WeakMap<object, SemiAsyncEmitter<TestEnvironmentEvent>> = new WeakMap();
const configMap: WeakMap<object, JestEnvironmentConfig> = new WeakMap();

export function onTestEnvironmentCreate(
  jestEnvironment: JestEnvironment,
  jestEnvironmentConfig: JestEnvironmentConfig,
  environmentContext: EnvironmentContext,
): void {
  detectDuplicateRealms(true);
  injectRealmIntoSandbox(jestEnvironment.global, realm);
  const testFilePath = environmentContext.testPath;
  realm.environmentHandler.handleEnvironmentCreated(testFilePath);
  realm.events.add(realm.setEmitter);

  if (!realm.globalMetadata.hasTestFileMetadata(testFilePath)) {
    realm.coreEmitter.emit({
      type: 'add_test_file',
      testFilePath,
    });

    if (realm.type === 'parent_process') {
      const { globalConfig } = jestEnvironmentConfig;
      const first = <T>(r: T[]) => r[0];
      const hint = globalConfig
        ? `  "reporters": ${inspect(globalConfig.reporters?.map(first))}\n`
        : ''; // Jest 27 fallback

      const message =
        `Cannot use a metadata test environment without a metadata server.\n` +
        `Please check that at least one of the reporters in your Jest config inherits from "jest-metadata/reporter".\n` +
        hint;

      if (
        globalConfig &&
        (jestUtils.isSingleWorker(globalConfig) || jestUtils.isInsideIDE(globalConfig))
      ) {
        log.warn(message);
      } else {
        log.debug(message);
        throw new JestMetadataError(message);
      }
    }
  }

  const testEventHandler = ({ event, state }: ForwardedCircusEvent) => {
    realm.environmentHandler.handleTestEvent(event, state);
  };

  const flushHandler = () => realm.ipc.flush();

  const emitter = new SemiAsyncEmitter<TestEnvironmentEvent>('environment', [
    'start_describe_definition',
    'finish_describe_definition',
    'add_hook',
    'add_test',
    'error',
  ])
    .on('test_environment_setup', startIpc, -1)
    .on('test_environment_teardown', stopIpc, Number.MAX_SAFE_INTEGER)
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
  configMap.set(jestEnvironment, jestEnvironmentConfig);
}

export type TestEnvironmentEvent =
  | {
      type: 'test_environment_setup' | 'test_environment_teardown';
    }
  | ForwardedCircusEvent;

type ForwardedCircusEvent<E extends Circus.Event = Circus.Event> = {
  type: E['name'];
  event: E;
  state: Circus.State;
};

export async function onTestEnvironmentSetup(env: JestEnvironment): Promise<void> {
  await initReporters(env);
  await getEmitter(env).emit({ type: 'test_environment_setup' });
}

export async function onTestEnvironmentTeardown(env: JestEnvironment): Promise<void> {
  await getEmitter(env).emit({ type: 'test_environment_teardown' });
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

/**
 * Get the environment event emitter by the environment reference.
 */
export const getEmitter = (env: JestEnvironment) => {
  const emitter = emitterMap.get(env);
  if (!emitter) {
    throw new JestMetadataError(
      'Emitter is not found. Most likely, you are using a non-valid environment reference.',
    );
  }

  return emitter;
};

/**
 * Get the environment configuration by the environment reference.
 */
export const getConfig = (env: JestEnvironment) => {
  const config = configMap.get(env);
  if (!config) {
    throw new JestMetadataError(
      'Environment config is not found. Most likely, you are using a non-valid environment reference.',
    );
  }

  return config;
};

async function initReporters(env: JestEnvironment) {
  const reporterModules = (getConfig(env)?.globalConfig?.reporters ?? []).map((r) => r[0]);
  const reporterExports = await Promise.all(
    reporterModules.map((m) => {
      try {
        return import(m);
      } catch (error: unknown) {
        // TODO: log this to trace
        console.warn(`[jest-metadata] Failed to import reporter module "${m}"`, error);
        return;
      }
    }),
  );

  for (const reporterExport of reporterExports) {
    const ReporterClass = reporterExport?.default ?? reporterExport;
    ReporterClass?.onTestEnvironmentCreate?.(env);
  }
}

async function startIpc() {
  if (realm.type === 'child_process') {
    await realm.ipc.start();
  }
}

async function stopIpc() {
  detectDuplicateRealms(false);

  if (realm.type === 'child_process') {
    await realm.ipc.stop();
  }
}
