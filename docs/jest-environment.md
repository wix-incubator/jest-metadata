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

If your use case is not covered by the above, you can call `jest-metadata` lifecycle methods manually:

```diff
+ import * as jmHooks from 'jest-metadata/environment-hooks';

class MyCustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
+   jmHooks.onTestEnvironmentCreate(this, config, context);
  }

  async setup() {
    await super.setup();
+   await jmHooks.onTestEnvironmentSetup(this);
  }

  async teardown() {
+   await jmHooks.onTestEnvironmentTeardown(this);
    await super.teardown();
  }

  async handleTestEvent(event, state) {
+   await jmHooks.onTestEnvironmentHandleTestEvent(this, event, state);
    // ...
  }
```

Here is a brief description of each lifecycle method:

* `onTestEnvironmentCreate` - called when the test environment is created. This is the first lifecycle method to be called. It injects `__JEST_METADATA__` context into `this.global` object to eliminate sandboxing issues.
* `onTestEnvironmentSetup` - called when the test environment is set up. This is the second lifecycle method to be called. It initializes `jest-metadata` IPC client if Jest is running in a multi-worker mode to enable communication with the main process where the reporters reside.
* `onTestEnvironmentHandleTestEvent` - called when the test environment receives a test event from `jest-circus`. This method is called many times during the test run. It is responsible for building a metadata tree, parallel to `jest-circus` State tree, and for sending test events to the main process.
* `onTestEnvironmentTeardown` - called when the test environment is torn down. This is the last lifecycle method to be called. It is responsible for shutting down the IPC client and for sending the final test event to the main process.