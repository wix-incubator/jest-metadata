[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

<div align="center">

![](images/logo.svg)

# jest-metadata

Share your custom data across all Jest contexts.

[![npm version](https://badge.fury.io/js/jest-metadata.svg)](https://badge.fury.io/js/jest-metadata)

</div>

`jest-metadata` is a library that allows you to attach user-defined data to any `jest-circus` entity like describe blocks, function definitions, test runs, invocations, and more. Your custom data can be accessed by custom reporters to produce rich and insightful reports leveraging low-level details from [`jest-circus` events](https://github.com/facebook/jest/blob/8433c5cbcbf139d5174bf254996f9f02297a97c5/packages/jest-types/src/Circus.ts#L43) and any additional data you want to use in your reports.

## 🌟 Features

* Attach custom metadata to Jest entities such as describe blocks, function definitions, test runs, and invocations.
* Access metadata from custom reporters to generate insightful reports.
* Integrate seamlessly with Jest Circus events.
* Easy-to-use API for adding and retrieving metadata.

## 📚 Prerequisites

To use `jest-metadata`, you should:

* Have `jest-circus` as Jest test runner (default since `jest@27.x`).
* Use a test environment class that complies with `jest-metadata` lifecycle.
* Create or install a reporter that leverages `jest-metadata`.

## 🚀 Installation

Install `jest-metadata` using npm:

```bash
npm install jest-metadata --save-dev
```

In your Jest config, add the following:

```diff
   "testRunner": "jest-circus/runner",
+  "testEnvironment": "jest-metadata/environment-node",
   "reporters": [
     "default",
+    "./your-custom-reporter.js",
   ],
```

If you need to use `jest-metadata` in a JSDOM environment or another custom test environment, please refer to the [Integrating `jest-metadata` into test environment](jest-environment.md) document.

📖 Usage

### In a Test File

Attach metadata to test entities using annotations:

```js
import { $Set } from 'jest-metadata/annotations';

// Write your own DSL for attaching metadata to test entities
// Try to namespace your metadata to avoid collisions with other libraries
const $Description = (text) => $Set('mycompany.description', text);

$Description('This is a sample test suite.');
describe('Login flow', () => {

  $Description('This is a login test.');
  it('should login', () => {
    // ...
  });
});
```

### In a Custom Reporter

Access metadata in a custom Jest reporter:

```js
import { state, JestMetadataReporter } from 'jest-metadata/reporter';

class CustomReporter extends JestMetadataReporter {
  async onTestCaseResult(test, testCaseResult) {
    await super.onTestCaseResult(test, testCaseResult);

    const metadata = state.getRunMetadata(test.path).lastTestEntry;

    const titles = [testCaseResult.title, ...testCaseResult.ancestorTitles.slice().reverse()];
    const descriptions = [metadata, ...metadata.ancestors()].map((m) => m.get('mycompany.description', ''));

    const n = titles.length;
    for (let i = n - 1; i >= 0; i--) {
      console.log(`${titles[i]}: ${descriptions[i]}`);
    }
    // Output:
    // > Login flow: This is a sample test suite.
    // > should login: This is a login test.
  }
}
```

## 📄 Documentation

For more detailed documentation, tutorials, and examples, see the [`docs` folder].

## 🌐 Contributing

We welcome contributions from the community! To get involved, please follow these steps:

* Check the [GitHub issues] for open tasks or [submit a new issue] if you have a feature request or bug report.
* Fork the repository and create a new branch for your changes.
* Make your changes and submit a pull request.

For more information, see our [Contribution Guidelines].

📃 License

This project is licensed under the [MIT License].

[`docs` folder]: ./
[GitHub issues]: https://github.com/wix-incubator/jest-metadata/issues
[submit a new issue]: https://github.com/wix-incubator/jest-metadata/issues/new
[Contribution Guidelines]: ./CONTRIBUTING.md
[MIT License]: ../LICENSE
