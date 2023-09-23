# Metadata targets

* Aggregated result (global metadata)
  * Test file run
* Definitions:
  * `describe` blocks
  * `beforeAll` and `afterAll` hooks
  * `beforeEach` and `afterEach` hooks
  * `it/test` entries
* Invocations:
  * `describe` blocks (when running)
    * `beforeAll` hook invocations
    * `it/test` invocations
      * `beforeEach` hook invocations
      * `it/test` function invocations
      * `afterEach` hook invocations
    * `afterAll` hook invocations

## Example suite

```js
const { metadata, $Set, $Push } = require('jest-metadata');

const $Description = (text) => $Set('vendor.description', text);
const $Maintainer = (name, email) => $Assign('vendor.maintainer', { name, email });
const $Lead = (name, email) => $Merge('vendor.lead', { name, email });
const $Tag = (value) => $Push(['vendor', 'labels'], value);
const $Flaky = () => $Tag('flaky');
const step = (text) => metadata.push('vendor.steps', [{ text, startedAt: now }]);

const actions = require('./actions');

$Maintainer('Jane Smith', 'jane.smith@example.com');
$Lead('Samantha Jones', 'samantha.jones@example.com');
$Description('This is a sample test suite.');
describe('Login flow', () => {
  $Description('Prepare the environment');
  beforeAll(() => {
    step('Open the browser');
    actions.openBrowser();
  });

  $Description('Visit the website');
  beforeEach(() => {
    step('Goto the URL: https://example.com');
    actions.goto('https://example.com');
  });

  $Description('Visit the website');
  afterEach(() => {
    step('Clear cookies');
    actions.clearCookies();
  });

  $Description('Tear down the environment');
  afterAll(() => {
    step('Close the browser');
    actions.closeBrowser();
  });

  $Tag('sanity');
  test('Unhappy scenario', () => {
    step('Enter invalid credentials');
    actions.sleep(100);
    step('Assert that the login failed');
  });

  $Flaky();
  $Tag('sanity');
  test('Happy scenario', () => {
    step('Enter valid credentials');
    actions.sleep(100);
    step('Assert that the login succeeded');
  });
});
```

## Example diagram

![](images/diagram.svg)


