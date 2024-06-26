const { metadata, $Assign, $Defaults, $Push, $Set, $Merge, $Unshift  } = require('jest-metadata');

let now = 1672524000000;

const sleep = (ms) => now += ms;

const actions = {
  sleep,
  openBrowser: () => sleep(1000),
  closeBrowser: () => sleep(500),
  goto: (_url) => sleep(100),
  clearCookies: () => sleep(50),
}

const $Description = (text) => $Set('vendor.description', text);
const $Maintainer = (name, email) => $Assign('vendor.maintainer', { name, email });
const $Author = (name, email) => $Defaults('vendor.author', { name, email });
const $Lead = (name, email) => $Merge('vendor.lead', { name, email });
const $Tag = (value) => $Push(['vendor', 'labels'], value);
const $Flaky = () => $Unshift(['vendor', 'labels'], 'flaky');

const step = (text) => metadata.push('vendor.steps', [{ text, startedAt: now }]);

// Should be attached to ROOT_DESCRIBE_BLOCK
metadata.set('vendor.filename', 'hook-nesting.js');

$Maintainer('Jane Smith', 'jane.smith@example.com');
$Lead('Samantha Jones', 'samantha.jones@example.com');
$Author('John Doe', 'john.doe@example.com');
$Author('Impostor', 'impostor@example.fake');
describe('Login flow', () => {
  // ↑ Should be attached to `describe` block
  metadata.set('vendor.description', 'This is a sample test suite.');

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

  $Tag('sanity');
  $Flaky();
  test('Happy scenario', () => {
    step('Enter valid credentials');
    actions.sleep(100);
    step('Assert that the login succeeded');
  });
});
