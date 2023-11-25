import { inspect } from 'util';
import type { EnvironmentListenerFn, TestEnvironmentCircusEvent } from 'jest-environment-emit';
import { JestMetadataError } from './errors';
import { detectDuplicateRealms, injectRealmIntoSandbox, realm } from './realms';
import { jestUtils, logger } from './utils';

const log = logger.child({ cat: 'environment', tid: 'environment' });

const listener: EnvironmentListenerFn = (context) => {
  const jestEnvironment = context.env;
  const jestEnvironmentConfig = context.config;
  const environmentContext = context.context;

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

  const testEventHandler = ({ event, state }: TestEnvironmentCircusEvent) => {
    realm.environmentHandler.handleTestEvent(event, state);
  };

  const flushHandler = () => realm.ipc.flush();

  context.testEvents
    .on(
      'test_environment_setup',
      async function () {
        if (realm.type === 'child_process') {
          await realm.ipc.start();
        }
      },
      -1,
    )
    .on(
      'test_environment_teardown',
      async function () {
        detectDuplicateRealms(false);

        if (realm.type === 'child_process') {
          await realm.ipc.stop();
        }
      },
      Number.MAX_SAFE_INTEGER,
    )
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
};

export default listener;
