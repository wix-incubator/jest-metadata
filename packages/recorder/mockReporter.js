const fs = require('fs');
const path = require('path');

const { state, events } = require('jest-metadata');
const { JestMetadataReporter } = require('jest-metadata/reporter');

const cwd = process.cwd();

/**
 * @implements {import('@jest/reporters').Reporter}
 */
class MockReporter extends JestMetadataReporter {
  _events = {};

  constructor(globalConfig, reporterConfig) {
    super(globalConfig, reporterConfig);

    events.on('*', (event) => {
      const id = event.testFilePath
        ? path.basename(event.testFilePath, '.js') + '.json'
        : 'aggregatedResult.json';

      this._events[id] = this._events[id] || [];
      this._events[id].push({
        ...event,
        testFilePath: path.relative(cwd, event.testFilePath),
      });
    });
  }

  async onRunStart(results, options) {
    await super.onRunStart(results, options);

    state.set('vendor.runStartedAt', '2023-01-01T00:00:00.000Z');
  }

  async onRunComplete(testContexts, results) {
    await super.onRunComplete(testContexts, results);

    for (const [fileName, events] of Object.entries(this._events)) {
      const contents = JSON.stringify(events, null, 2);
      const fixturePath = path.join(__dirname, '../fixtures', fileName);
      fs.writeFileSync(fixturePath, contents + '\n');
    }
  }
}

module.exports = MockReporter;
