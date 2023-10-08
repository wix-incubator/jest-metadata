const fs = require('fs');
const path = require('path');

const { satisfies: semverSatisfies } = require('semver');
const { version: jestVersion } = require('jest/package.json');
const debugUtils = require('jest-metadata/debug');
const { JestMetadataReporter } = require('jest-metadata/reporter');

const PRESET = process.env.PRESET || '';
const cwd = process.cwd();

/**
 * @implements {import('@jest/reporters').Reporter}
 */
class E2eRecorderReporter extends JestMetadataReporter {
  _events = {};
  _single = false;
  _bail = false;

  constructor(globalConfig) {
    super(globalConfig);

    this._single = globalConfig.maxWorkers === 1;
    this._bail = globalConfig.bail > 0;
    this.#subscribeToMetadataEvents();
  }

  #pushEvent = (event) => {
    const testFilePath = event.testFilePath
      ? path.relative(cwd, event.testFilePath)
      : undefined;

    const id = testFilePath
      ? path.basename(testFilePath, '.js') + '.json'
      : 'globalMetadata.json';

    this._events[id] = this._events[id] || [];
    this._events[id].push({ ...event, testFilePath });
  };

  #pushReporterEvent = (type, payload) => {
    if (!PRESET.includes('no-env')) return;
    this.#pushEvent({ type: `reporter:${type}`, ...payload });
  };

  #subscribeToMetadataEvents = () => {
    if (PRESET.includes('no-env')) return;
    debugUtils.events.on('*', this.#pushEvent);
  };

  async onRunStart(results, options) {
    this.#pushReporterEvent('onRunStart');
    return super.onRunStart(results, options);
  }

  onTestFileStart(test) {
    this.#pushReporterEvent('onTestFileStart', { testFilePath: test.path });
    super.onTestFileStart(test);
  }

  onTestCaseResult(test, fullTestCaseResult) {
    const testCaseResult = debugUtils.Shallow.testCaseResult(fullTestCaseResult);
    this.#pushReporterEvent('onTestCaseResult', { testFilePath: test.path, testCaseResult });
    super.onTestCaseResult(test, fullTestCaseResult);
  }

  onTestFileResult(test, fullTestResult, aggregatedResult) {
    const testResult = debugUtils.Shallow.testResult(fullTestResult);
    this.#pushReporterEvent('onTestFileResult', { testFilePath: test.path, testResult });
    super.onTestFileResult(test, fullTestResult, aggregatedResult);
  }

  async onRunComplete(testContexts, fullAggregatedResult) {
    const aggregatedResult = debugUtils.Shallow.aggregatedResult(fullAggregatedResult);
    this.#pushReporterEvent('onRunComplete', { aggregatedResult });
    await super.onRunComplete(testContexts, fullAggregatedResult);

    for (const [fileName, events] of Object.entries(this._events)) {
      const contents = JSON.stringify(events, null, 2);
      const jestFolder = fs.readdirSync('__fixtures__').find(constraint => semverSatisfies(jestVersion, constraint));
      const fixturePath =  path.join('__fixtures__', jestFolder, PRESET, fileName);

      fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
      fs.writeFileSync(fixturePath, contents + '\n');
    }

    if (debugUtils.isEnabled()) {
      await sleep(1000);
      await debugUtils.aggregateLogs();
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = E2eRecorderReporter;
