[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

<div align="center">

<img src="https://github.com/wix-incubator/jest-metadata/assets/1962469/09c460b4-054f-42bc-ab2f-26d83dc925d7" width=256 height=256 />

# jest-metadata

🦸‍♂️ Superhero power for your Jest reporters! 🦸‍♀️

[![npm version](https://badge.fury.io/js/jest-metadata.svg?rnd=42)](https://badge.fury.io/js/jest-metadata)

</div>

`jest-metadata` is a library that allows you to attach user-defined data to any `jest-circus` entity like describe blocks, function definitions, test runs, invocations, and more. Custom reporters can access your custom data to produce rich and insightful reports leveraging low-level details from [`jest-circus` events](https://github.com/facebook/jest/blob/8433c5cbcbf139d5174bf254996f9f02297a97c5/packages/jest-types/src/Circus.ts#L43) and any additional data you want to use in your reports.

## 🌟 Features

* Attach custom metadata to Jest entities such as describe blocks, function definitions, test runs, and invocations.
* Access your metadata from your reporters to generate insightful reports.
* Graceful degradation for default test environments (`node`, `jsdom`) and `jest-jasmine2` test runner.
* Custom test environment support via a decorator class.

## 📚 Guidelines

This library is primarily intended for the authors of custom Jest reporters.
Direct usage of `jest-metadata` in test files is not recommended.

To use `jest-metadata`, you should:

* Declare `jest` as a peer dependency (or direct one) in your package.
* Provide your reporter as a class that inherits from `jest-metadata/reporter`.
* Provide your test environment as a decorator class that can inherit from any `WithMetadata(*)` class.
* Think about using a namespace for your metadata, so it doesn't clash with other metadata.

The best live example of how to use `jest-metadata` at the moment is [jest-allure2-reporter].

## 🚀 Quick Start

To get your hands dirty, you can try out `jest-metadata` directly in your project.

Install `jest-metadata` using npm:

```bash
npm install jest-metadata --save-dev
```

In your Jest config, add the following:

```diff
+  "testEnvironment": "jest-metadata/environment-node",
+  "reporters": [
+    "default",
+    "./your-custom-reporter.js",
+  ],
```

If you need to use `jest-metadata` in a JSDOM environment or another custom test environment,
please refer to the [Integrating `jest-metadata` into test environment][jest-environment] guide.

## 📖 Usage

### In a Test File

Attach metadata to test entities using annotations:

```js
import { metadata, $Set } from 'jest-metadata';

// Write your own DSL for attaching metadata to test entities
// Try to namespace your metadata to avoid collisions with other libraries
const $Description = (text) => $Set('mycompany.description', text);

$Description('This is a sample test suite.');
describe('Login flow', () => {

  $Description('This is a login test.');
  it('should login', () => {
    // ...
    metadata.push('mycompany.attachements', [
      { name: 'screenshot', type: 'image/png', filePath: '/path/to/screenshot.png' },
    ]);
    // ...
  });
});
```

### In a Custom Reporter

Access metadata in a custom Jest reporter:

```js
import { state } from 'jest-metadata';
import { JestMetadataReporter } from 'jest-metadata/reporter';

class CustomReporter extends JestMetadataReporter {
  async onTestCaseResult(test, testCaseResult) {
    await super.onTestCaseResult(test, testCaseResult);

    const metadata = state.getTestFileMetadata(test.path).lastTestEntry;

    const titles = [testCaseResult.title, ...testCaseResult.ancestorTitles.slice().reverse()];
    const descriptions = [metadata, ...metadata.ancestors()].map((m) => m.get('mycompany.description', '')).find(x => x);
    const attachments = [metadata, ...metadata.ancestors()].flatMap((m) => m.get('mycompany.attachements', []));

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

For more detailed documentation and examples, see the [`docs` folder].

## 🌐 Contributing

We welcome contributions from the community! To get involved, please follow these steps:

* Check the [GitHub issues] for open tasks or [submit a new issue] if you have a feature request or bug report.
* Fork the repository and create a new branch for your changes.
* Make your changes and submit a pull request.

For more information, see our [Contribution Guidelines].

## 📃 License

This project is licensed under the [MIT License].

[`docs` folder]: ./docs
[GitHub issues]: https://github.com/wix-incubator/jest-metadata/issues
[submit a new issue]: https://github.com/wix-incubator/jest-metadata/issues/new/choose
[Contribution Guidelines]: ./CONTRIBUTING.md
[MIT License]: ./LICENSE
[jest-environment]: ./docs/jest-environment.md
[jest-allure2-reporter]: https://github.com/wix-incubator/jest-allure2-reporter
