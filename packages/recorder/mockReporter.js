const fs = require('fs');
const path = require('path');

const { satisfies: semverSatisfies } = require('semver');
const { version: jestVersion } = require('jest/package.json');
const { state } = require('jest-metadata');
const debugUtils = require('jest-metadata/debug');
const { JestMetadataReporter } = require('jest-metadata/reporter');

const cwd = process.cwd();

/**
 * @implements {import('@jest/reporters').Reporter}
 */
class MockReporter extends JestMetadataReporter {
  _events = {};
  _single = false;

  constructor(globalConfig, reporterConfig) {
    super(globalConfig, reporterConfig);

    this._single = globalConfig.maxWorkers === 1;

    const onEvent = (event) => {
      const id = event.testFilePath
        ? path.basename(event.testFilePath, '.js') + '.json'
        : 'globalMetadata.json';

      this._events[id] = this._events[id] || [];
      this._events[id].push({
        ...event,
        testFilePath: path.relative(cwd, event.testFilePath),
      });
    };

    debugUtils.events.on('*', onEvent);
  }

  async onRunComplete(testContexts, results) {
    await super.onRunComplete(testContexts, results);

    for (const [fileName, events] of Object.entries(this._events)) {
      const contents = JSON.stringify(events, null, 2);
      const fixturesProject = path.join(__dirname, '../fixtures');
      const jestFolder = fs.readdirSync(fixturesProject).find(constraint => semverSatisfies(jestVersion, constraint));
      const subDir = (debugUtils.isFallback() ? 'no-' : '') + 'env-worker-' + (this._single ? '1' : 'N');
      const fixturePath =  path.join(fixturesProject, jestFolder, subDir, fileName);

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

module.exports = MockReporter;
