# Integrating `jest-metadata` into test envirornment

## Quick start

If you're running tests in Node.js environment, add the following line to your Jest config:

```diff
{
+  "testEnvironment": "jest-metadata/environment-node",
}
```

If you need to use `jest-metadata` in a JSDOM environment, you need change your test environment to:

```diff
{
+  "testEnvironment": "jest-metadata/environment-jsdom",
}
```

If you already have a custom test environment, you can extend it via composition:

```diff
+ import { WithMetadata } from 'jest-metadata/environment-decorator';

- class MyCustomEnvironment extends NodeEnvironment {
+ class MyCustomEnvironment extends WithMetadata(NodeEnvironment) {
```

## Manual integration

If your use case is not covered by the above, you can rewrite your test environment
into a listener of `jest-environment-emit` events. Here is an example of how to do it:

```js title="jest.config.js"
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-emit',
  testEnvironmentOptions: {
    listeners: [
      'jest-metadata/environment-listener',
      ['your-project/listener', { /* options */ }],
    ],
  },
};
```

where `your-project/listener` file contains the following code:

```js title="your-project/listeners.js"
import * as jee from 'jest-environment-emit';

const listener: jee.EnvironmentListenerFn = (context, yourOptions) => {
  context.testEvents
    .on('test_environment_setup', ({ env }: jee.TestEnvironmentSetupEvent) => {
      // ...
    })
    .on('test_start', ({ event, state }: jee.TestEnvironmentCircusEvent) => {
      // ...
    })
    .on('test_done', ({ event, state }: jee.TestEnvironmentCircusEvent) => {
      // ...
    })
    .on('test_environment_teardown', ({ env }: jee.TestEnvironmentTeardownEvent) => {
      // ...
    });
};

export default listener;
```

## Lifecycle of `jest-metadata` test environment

Here is a brief description of each lifecycle method:

* `test_environment_setup`:
  * injects `__JEST_METADATA__` context into `this.global` object to eliminate sandboxing issues;
  * initializes `jest-metadata` IPC client if Jest is running in a multi-worker mode to enable communication with the main process where the reporters reside;
* all `jest-circus` events coming to `handleTestEvent` – building a metadata tree, parallel to `jest-circus` State tree, and for sending test events to the main process.
* `test_environment_teardown` – responsible for shutting down the IPC client and for sending the final test event to the main process.
