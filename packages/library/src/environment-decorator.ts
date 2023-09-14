import type { JestEnvironment } from '@jest/environment';
import type { Circus } from '@jest/types';

import {
  onHandleTestEvent,
  onTestEnvironmentCreate,
  onTestEnvironmentSetup,
  onTestEnvironmentTeardown,
} from './environment-hooks';
import type { ReadonlyAsyncEmitter } from './types';
import { SemiAsyncEmitter } from './utils';

export interface WithTestEventHandler {
  readonly testEvents: ReadonlyAsyncEmitter<ForwardedCircusEvent>;
  handleTestEvent(event: unknown, state: unknown): void | Promise<void>;
}

export type ForwardedCircusEvent = {
  type: Circus.Event['name'];
  event: Circus.Event;
  state: Circus.State;
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
 * low-level hooks from {@link module:jest-metadata/environment-hooks}.
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
export function WithMetadata<E extends JestEnvironment>(
  JestEnvironmentClass: new (...args: any[]) => E,
): new (...args: any[]) => E & WithTestEventHandler {
  const compositeName = `WithMetadata(${JestEnvironmentClass.name})`;
  const emitterCallbacks: ((emitter: ReadonlyAsyncEmitter<ForwardedCircusEvent>) => void)[] = [];

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

        const handler = ({ event, state }: ForwardedCircusEvent) => onHandleTestEvent(event, state);

        this.testEvents
          .on('setup', handler, -1)
          .on('include_test_location_in_result', handler, -1)
          .on('start_describe_definition', handler, -1)
          .on('finish_describe_definition', handler, Number.MAX_SAFE_INTEGER)
          .on('add_hook', handler, -1)
          .on('add_test', handler, -1)
          .on('run_start', handler, -1)
          .on('run_describe_start', handler, -1)
          .on('hook_failure', handler, Number.MAX_SAFE_INTEGER)
          .on('hook_start', handler, -1)
          .on('hook_success', handler, Number.MAX_SAFE_INTEGER)
          .on('test_start', handler, -1)
          .on('test_started', handler, -1)
          .on('test_retry', handler, -1)
          .on('test_skip', handler, -1)
          .on('test_todo', handler, -1)
          .on('test_fn_start', handler, -1)
          .on('test_fn_failure', handler, Number.MAX_SAFE_INTEGER)
          .on('test_fn_success', handler, Number.MAX_SAFE_INTEGER)
          .on('test_done', handler, Number.MAX_SAFE_INTEGER)
          .on('run_describe_finish', handler, Number.MAX_SAFE_INTEGER)
          .on('run_finish', handler, Number.MAX_SAFE_INTEGER)
          .on('teardown', handler, Number.MAX_SAFE_INTEGER)
          .on('error', handler, -1);

        for (const callback of emitterCallbacks) {
          callback(this.#testEventEmitter);
        }
      }

      protected get testEvents(): ReadonlyAsyncEmitter<ForwardedCircusEvent> {
        return this.#testEventEmitter;
      }

      static subscribe(callback: (emitter: ReadonlyAsyncEmitter<ForwardedCircusEvent>) => void) {
        callback((JestEnvironmentClass as any).prototype.testEvents);
        return this;
      }

      async setup() {
        await super.setup();
        await onTestEnvironmentSetup();
      }

      // @ts-expect-error TS2415: The base class has an arrow function, but this can be a method
      handleTestEvent(event: Circus.Event, state: Circus.State): void | Promise<void> {
        const forwardedEvent: ForwardedCircusEvent = {
          type: event.name,
          event: event,
          state: state,
        };

        const maybePromise = (super.handleTestEvent as JestEnvironment['handleTestEvent'])?.(
          event as any,
          state,
        );

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
