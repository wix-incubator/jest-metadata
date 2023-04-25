/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line node/no-unpublished-import, @typescript-eslint/no-unused-vars
import type { JestEnvironment } from '@jest/environment';
// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import {
  onHandleTestEvent,
  onHandleTestEventSync,
  onTestEnvironmentCreate,
  onTestEnvironmentSetup,
  onTestEnvironmentTeardown,
} from './environment-hooks';

type Constructor<T> = new (...args: any[]) => T;

interface JestEnvironmentLike {
  setup(): Promise<unknown>;
  handleTestEvent?(event: any, state: any): Promise<unknown>;
  teardown(): Promise<unknown>;
}

/**
 * Decorator for a given JestEnvironment subclass that extends
 * {@link JestEnvironment#constructor}, {@link JestEnvironment#global},
 * {@link JestEnvironment#setup}, and {@link JestEnvironment#handleTestEvent}
 * and {@link JestEnvironment#teardown} in a way that is compatible with
 * {@link jest-metadata}.
 *
 * You can use this decorator to extend a base JestEnvironment class inside
 * your own environment class in a declarative way. If you prefer to control
 * the integration with {@link module:jest-metadata} yourself, you can use
 * low-level hooks from {@link module:jest-metadata/environment/hooks}.
 *
 * @example
 * import WithMetadata from 'jest-metadata/environment-decorator';
 *
 * class MyEnvironment extends WithMetadata(JestEnvironmentNode) {
 *   constructor(config, context) {
 *     super(config, context);
 *   }
 *
 *   async setup() {
 *     await super.setup();
 *     // ... your custom logic
 *   }
 *
 *   async handleTestEvent(event, state) {
 *     await super.handleTestEvent(event, state);
 *     // ... your custom logic
 *   }
 *
 *   async teardown() {
 *     // ... your custom logic
 *     await super.teardown();
 *   }
 * }
 * @param JestEnvironmentClass - Jest environment subclass to decorate
 * @returns a decorated Jest environment subclass, e.g. `WithMetadata(JestEnvironmentNode)`
 */
export function WithMetadata<E extends Constructor<JestEnvironmentLike>>(
  JestEnvironmentClass: E,
): E {
  const compositeName = `WithMetadata(${JestEnvironmentClass.name})`;

  return {
    [`${compositeName}`]: class extends JestEnvironmentClass {
      constructor(...args: any[]) {
        super(...args);
        onTestEnvironmentCreate(this, args[0], args[1]);
      }

      async setup() {
        await super.setup();
        await onTestEnvironmentSetup();
      }

      // @ts-expect-error TS2425: Class 'WithMetadata(JestEnvironmentNode)' incorrectly extends
      handleTestEvent(event: unknown, state: unknown): void | Promise<void> {
        const circusEvent = event as Circus.Event;
        const circusState = state as Circus.State;

        switch (circusEvent.name) {
          case 'error':
          case 'start_describe_definition':
          case 'finish_describe_definition':
          case 'add_hook':
          case 'add_test': {
            super.handleTestEvent?.(circusEvent, circusState);
            onHandleTestEventSync(circusEvent, circusState);
            break;
          }
          default: {
            const maybePromise = super.handleTestEvent?.(circusEvent, circusState);
            return typeof maybePromise?.then === 'function'
              ? maybePromise.then(() =>
                  onHandleTestEvent(event as Circus.Event, state as Circus.State),
                )
              : onHandleTestEvent(event as Circus.Event, state as Circus.State);
          }
        }
      }

      async teardown() {
        await super.teardown();
        await onTestEnvironmentTeardown();
      }
    },
  }[compositeName] as E;
}

/**
 * @inheritDoc
 */
export default WithMetadata;
