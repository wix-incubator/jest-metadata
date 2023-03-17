const { $Set, $Push } = require('jest-metadata/annotations');

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
const $Step = (text) => $Push('vendor.steps', { text, startedAt: now });
const $Label = (value) => $Push(['vendor', 'labels'], value);
const $Flaky = () => $Label('flaky');

$Maintainer('Jane Smith', 'jane.smith@example.com');
$Description('This is a sample test suite.');
describe('Login flow', () => {
  $Description('Prepare the environment');
  beforeAll(() => {
    $Step('Open the browser');
    actions.openBrowser();
  });

  $Description('Visit the website');
  beforeEach(() => {
    $Step('Goto the URL: https://example.com');
    actions.goto('https://example.com');
  });

  $Description('Visit the website');
  afterEach(() => {
    $Step('Clear cookies');
    actions.clearCookies();
  });

  $Description('Tear down the environment');
  afterAll(() => {
    $Step('Close the browser');
    actions.closeBrowser();
  });

  $Label('sanity');
  test('Unhappy scenario', () => {
    $Step('Enter invalid credentials');
    actions.sleep(100);
    $Step('Assert that the login failed');
  });

  $Flaky();
  $Label('sanity');
  test('Happy scenario', () => {
    $Step('Enter valid credentials');
    actions.sleep(100);
    $Step('Assert that the login succeeded');
  });
});
