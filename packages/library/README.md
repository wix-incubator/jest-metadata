# jest-metadata

Extend Jest runner and reporter state with custom metadata.

Only **jest-circus** runner (the default one) is currently supported.

## Installation

Install the package:

```bash
npm install jest-metadata --save-dev
```

In your Jest config, add the following:

```diff
   "testRunner": "jest-circus/runner",
+  "testEnvironment": "<rootDir>/test-environment.js",
   "reporters": [
+    "jest-metadata/server",
     "default",
   ],
```

Create a custom test environment, e.g. in `test-environment.js` where you'll use `jest-metadata/environment` module like this:

```javascript
import * as jm from 'jest-metadata/client';

export default class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    jm.init(this, config, context);
  }

  handleTestEvent(event, state) {
    jm.handleTestEvent(event, state);
    // ...
  }
}
```

## Usage

Think about using a namespace for your metadata, so that it doesn't clash with other metadata.
For example, if you're adding data for `your-custom-reporter`, you can use `your-custom-reporter` as a namespace:

```javascript
import { namespaced } from 'jest-metadata/annotate';

const { $Set, $Assign, $Merge } = namespaced('your-custom-reporter');

$Set('Maintainer', 'Jane Doe <jane.doe@example.com>');
describe('Login flow', () => {
  $Assign({ Tags: ['sanity', 'flaky'] });
  test('should pass CAPTCHA', () => {
    // open page
    $Merge({ Artifacts: { 'Before login': '/path/to/screenshot-before.png' } });
    // pass captcha
    $Merge({ Artifacts: { 'After login': '/path/to/screenshot-after.png' } });
  });
});
```

Of course, this looks too low-level, so you can create your own domain-specific helpers:

```javascript
import { namespaced } from 'jest-metadata/annotate';

const { $Get, $Set, $Assign, $Merge } = namespaced('your-custom-reporter');

export const $Maintainer = (name) => $Set('Maintainer', name);
export const $Tag = (name) => $Assign({ Tags: [...$Get('Tags', []), 'name'] });
export const $Flaky = () => $Tag('flaky');
export const $ReportArtifact = (name, filePath) => $Merge({ Artifacts: { [name]: filePath } });
```

And then your test will look like this:

```javascript
$Maintainer('Jane Doe <jane.doe@example.com>');
describe('Login flow', () => {
  $Tag('sanity');
  $Flaky();
  test('should pass CAPTCHA', () => {
    // open page
    $ReportArtifact('Before login', '/path/to/screenshot-before.png');
    // pass captcha
    $ReportArtifact('After login', '/path/to/screenshot-before.png');
  });
});
```

From your reporter, you can access the metadata using `jest-metadata/reporter` module:

```javascript
import { namespaced } from 'jest-metadata/report';

const query = namespaced('your-custom-reporter');

export default class YourCustomReporter {
  html = '<!DOCTYPE html><html><head><title>Test results</title></head><body>';

  onTestCaseResult(test, testCaseResult) {
    const metadata = query.testCaseResult(test, testCaseResult);
    const artifacts = metadata.lastInvocation.fn.get('Artifacts');
    this.html += `
      <h3>${testCaseResult.fullName}</h3>
      <p>Maintainer: ${[metadata, ...metadata.ancestors()].map(m => m.get('Maintainer')).find(x => x)}</p>
      <p>Tags: ${metadata.get('Tags')?.join(', ')}</p>
    `;

    for (const [name, path] of Object.entries(artifacts)) {
      this.html += `
        <figure>
          <img src="${path}" alt="${name}" />
          <figcaption>${name}</figcaption>
        </figure>
      `;
    }
  }

  onRunComplete(contexts, { testResults }) {
      this.html += '</body></html>';
  }
}
```
