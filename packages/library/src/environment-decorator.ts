/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line node/no-unpublished-import, @typescript-eslint/no-unused-vars
import type { JestEnvironment } from '@jest/environment';
// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import {
  onHandleTestEvent,
  onTestEnvironmentCreate,
  onTestEnvironmentSetup,
  onTestEnvironmentTeardown,
} from './environment-hooks';
import type { ReadonlyAsyncEmitter } from './types';
import { SemiAsyncEmitter } from './utils';

export interface JestEnvironmentLike {
  setup(): Promise<unknown>;
  handleTestEvent?(event: unknown, state: unknown): void | Promise<void>;
  teardown(): Promise<unknown>;
}

export interface WithTestEventHandler {
  readonly testEvents: ReadonlyAsyncEmitter<ForwardedCircusEvent>;
  handleTestEvent(event: unknown, state: unknown): void | Promise<void>;
}

export type ForwardedCircusEventType =
  | 'start_describe_definition'
  | 'finish_describe_definition'
  | 'add_hook'
  | 'add_test'
  | 'error'
  | 'hook_failure'
  | 'hook_start'
  | 'hook_success'
  | 'include_test_location_in_result'
  | 'run_describe_finish'
  | 'run_describe_start'
  | 'run_finish'
  | 'run_start'
  | 'setup'
  | 'teardown'
  | 'test_done'
  | 'test_fn_failure'
  | 'test_fn_start'
  | 'test_fn_success'
  | 'test_retry'
  | 'test_skip'
  | 'test_start'
  | 'test_started'
  | 'test_todo';

export type ForwardedCircusEvent = {
  type: ForwardedCircusEventType;
  event: any;
  state: any;
};

/**
 * Decorator for a given JestEnvironment subclass that extends
 * {@link JestEnvironment#constructor}, {@link JestEnvironment#global},
 * {@link JestEnvironment#setup}, and {@link JestEnvironment#handleTestEvent}
 * and {@link JestEnvironment#teardown} in a way that is compatible with
 * jest-metadata.
 *
 * You can use this decorator to extend a base JestEnvironment class inside
 * your own environment class in a declarative way. If you prefer to control
 * the integration with {@link module:jest-metadata} yourself, you can use
 * low-level hooks from {@link module:jest-metadata/environment/hooks}.
 * @param JestEnvironmentClass - Jest environment subclass to decorate
 * @returns a decorated Jest environment subclass, e.g. `WithMetadata(JestEnvironmentNode)`
 * @example
 * ```javascript
 * import WithMetadata from 'jest-metadata/environment-decorator';
 *
 * class MyEnvironment extends WithMetadata(JestEnvironmentNode) {
 *   constructor(config, context) {
 *     super(config, context);
 *
 *     this.testEvents
 *       .on('setup', async ({ event, state }) => { ... })
 *       .on('include_test_location_in_result', ({ event, state }) => { ... })
 *       .on('start_describe_definition', ({ event, state }) => { ... })
 *       .on('finish_describe_definition', ({ event, state }) => { ... })
 *       .on('add_hook', ({ event, state }) => { ... })
 *       .on('add_test', ({ event, state }) => { ... })
 *       .on('hook_failure', async ({ event, state }) => { ... })
 *       .on('hook_start', async ({ event, state }) => { ... })
 *       .on('hook_success', async ({ event, state }) => { ... })
 *       .on('run_finish', async ({ event, state }) => { ... })
 *       .on('run_start', async ({ event, state }) => { ... })
 *       .on('run_describe_start', async ({ event, state }) => { ... })
 *       .on('test_start', async ({ event, state }) => { ... })
 *       .on('test_retry', async ({ event, state }) => { ... })
 *       .on('test_skip', async ({ event, state }) => { ... })
 *       .on('test_todo', async ({ event, state }) => { ... })
 *       .on('test_fn_start', async ({ event, state }) => { ... })
 *       .on('test_fn_failure', async ({ event, state }) => { ... })
 *       .on('test_fn_success', async ({ event, state }) => { ... })
 *       .on('test_done', async ({ event, state }) => { ... })
 *       .on('run_describe_finish', async ({ event, state }) => { ... })
 *       .on('teardown', async ({ event, state }) => { ... })
 *       .on('error', ({ event, state }) => { ... });
 *   }
 *
 *   async setup() {
 *     await super.setup();
 *     // ... your custom logic
 *   }
 *
 *   async teardown() {
 *     // ... your custom logic
 *     await super.teardown();
 *   }
 * }
 * ```
 */
export function WithMetadata<E extends JestEnvironmentLike>(
  JestEnvironmentClass: new (...args: any[]) => E,
): new (...args: any[]) => E & WithTestEventHandler {
  const compositeName = `WithMetadata(${JestEnvironmentClass.name})`;

  return {
    // @ts-expect-error TS2415: Class '[`${compositeName}`]' incorrectly extends base class 'E'.
    [`${compositeName}`]: class extends JestEnvironmentClass {
      readonly #testEventEmitter = new SemiAsyncEmitter<ForwardedCircusEvent>('environment', [
        'start_describe_definition',
        'finish_describe_definition',
        'add_hook',
        'add_test',
        'error',
      ]);

      constructor(...args: any[]) {
        super(...args);
        onTestEnvironmentCreate(this, args[0], args[1]);
        this.testEvents.on('*', ({ event, state }) => onHandleTestEvent(event, state));
      }

      protected get testEvents(): ReadonlyAsyncEmitter<ForwardedCircusEvent> {
        return this.#testEventEmitter;
      }

      async setup() {
        await super.setup();
        await onTestEnvironmentSetup();
      }

      handleTestEvent(event: unknown, state: unknown): void | Promise<void> {
        const circusEvent = event as Circus.Event;
        const circusState = state as Circus.State;
        const forwardedEvent: ForwardedCircusEvent = {
          type: circusEvent.name,
          event: circusEvent,
          state: circusState,
        };

        const maybePromise = super.handleTestEvent?.(circusEvent, circusState);

        return typeof maybePromise?.then === 'function'
          ? maybePromise.then(() => this.#testEventEmitter.emit(forwardedEvent))
          : this.#testEventEmitter.emit(forwardedEvent);
      }

      async teardown() {
        await super.teardown();
        await onTestEnvironmentTeardown();
      }
    },
  }[compositeName] as unknown as new (...args: any[]) => E & WithTestEventHandler;
}

/**
 * @inheritDoc
 */
export default WithMetadata;
