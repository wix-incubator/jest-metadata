const { metadata, $Set, $Push } = require('jest-metadata');

let now = +(new Date(2023, 0, 1, 0, 0, 0, 0));

const sleep = (ms) => now += ms;

const actions = {
  sleep,
  openBrowser: () => sleep(1000),
  closeBrowser: () => sleep(500),
  goto: (_url) => sleep(100),
  clearCookies: () => sleep(50),
}

const $Description = (text) => $Set('vendor.description', text);
const $Maintainer = (name, email) => $Set('vendor.maintainer', { name, email });
const $Tag = (value) => $Push(['vendor', 'labels'], value);
const $Flaky = () => $Tag('flaky');

const step = (text) => metadata.push('vendor.steps', [{ text, startedAt: now }]);

$Maintainer('Jane Smith', 'jane.smith@example.com');
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
