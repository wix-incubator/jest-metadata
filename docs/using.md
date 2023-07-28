## Usage

Think about using a namespace for your metadata, so that it doesn't clash with other metadata.
For example, if you're adding data for `your-custom-reporter`, you can use `your-custom-reporter` as a namespace:

```javascript
import { metadata, $Assign, $Merge, $Set } from 'jest-metadata/annotate';

$Set('your-custom-reporter.maintainer', 'Jane Doe <jane.doe@example.com>');
describe('Login flow', () => {
  $Assign('your-custom-reporter', { tags: ['sanity', 'flaky'] });
  test('should pass CAPTCHA', () => {
    // open page
    metadata.merge('your-custom-reporter', { artifacts: { 'Before login': '/path/to/screenshot-before.png' } });
    // pass captcha
    metadata.merge('your-custom-reporter', { artifacts: { 'After login': '/path/to/screenshot-after.png' } });
  });
});
```

Of course, this looks too low-level, so you can create your own domain-specific helpers:

```javascript
import { metadata, $Assign, $Merge, $Push, $Set } from 'jest-metadata/annotate';

const scope = 'your-custom-reporter';

export const $Maintainer = (name) => $Set([scope, 'maintainer'], name);
export const $Tag = (name) => $Push([scope, 'tags'], name);
export const $Flaky = () => $Tag('flaky');
export const reportArtifact = (name, filePath) => metadata.merge([scope], { artifacts: { [name]: filePath } });
```

And then your test will look like this:

```javascript
$Maintainer('Jane Doe <jane.doe@example.com>');
describe('Login flow', () => {
  $Tag('sanity');
  $Flaky();
  test('should pass CAPTCHA', () => {
    // open page
    reportArtifact('Before login', '/path/to/screenshot-before.png');
    // pass captcha
    reportArtifact('After login', '/path/to/screenshot-before.png');
  });
});
```

From your reporter, you can access the metadata using `jest-metadata/reporter` module:

```javascript
import { query } from 'jest-metadata/reporter';

export default class YourCustomReporter {
  html = '<!DOCTYPE html><html><head><title>Test results</title></head><body>';

  onTestCaseResult(test, testCaseResult) {
    const metadata = query.test(test).lastTestEntry.lastInvocation;
    const artifacts = metadata.fn.get('Artifacts');
    this.html += `
      <h3>${testCaseResult.fullName}</h3>
      <p>Maintainer: ${[metadata, ...metadata.ancestors()].map(m => m.get('your-custom-reporter.maintainer')).find(x => x)}</p>
      <p>Tags: ${metadata.get('your-custom-reporter.tags')?.join(', ')}</p>
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
