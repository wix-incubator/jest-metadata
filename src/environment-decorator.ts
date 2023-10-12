import type { JestEnvironment } from '@jest/environment';
import type { Circus } from '@jest/types';

import {
  ForwardedCircusEvent,
  getEmitter,
  onHandleTestEvent,
  onTestEnvironmentCreate,
  onTestEnvironmentSetup,
  onTestEnvironmentTeardown,
} from './environment-hooks';
import type { ReadonlyAsyncEmitter } from './types';

export { ForwardedCircusEvent } from './environment-hooks';

export type WithEmitter<E extends JestEnvironment = JestEnvironment> = E & {
  readonly testEvents: ReadonlyAsyncEmitter<ForwardedCircusEvent>;
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
): new (...args: any[]) => WithEmitter<E> {
  const compositeName = `WithMetadata(${JestEnvironmentClass.name})`;

  return {
    // @ts-expect-error TS2415: Class '[`${compositeName}`]' incorrectly extends base class 'E'.
    [`${compositeName}`]: class extends JestEnvironmentClass {
      constructor(...args: any[]) {
        super(...args);
        onTestEnvironmentCreate(this, args[0], args[1]);
      }

      protected get testEvents(): ReadonlyAsyncEmitter<ForwardedCircusEvent> {
        return getEmitter(this);
      }

      async setup() {
        await super.setup();
        await onTestEnvironmentSetup(this);
      }

      // @ts-expect-error TS2415: The base class has an arrow function, but this can be a method
      handleTestEvent(event: Circus.Event, state: Circus.State): void | Promise<void> {
        const maybePromise = (super.handleTestEvent as JestEnvironment['handleTestEvent'])?.(
          event as any,
          state,
        );

        return typeof maybePromise?.then === 'function'
          ? maybePromise.then(() => onHandleTestEvent(this, event, state))
          : onHandleTestEvent(this, event, state);
      }

      async teardown() {
        await super.teardown();
        await onTestEnvironmentTeardown(this);
      }
    },
  }[compositeName] as unknown as new (...args: any[]) => WithEmitter<E>;
}

/**
 * @inheritDoc
 */
export default WithMetadata;
