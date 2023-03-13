const fs = require('fs');
const path = require('path');

const realm = require('jest-metadata/dist/__backdoors__/realm').default;

/**
 * @implements {import('@jest/reporters').Reporter}
 */
class MockReporter {
  constructor() {
    this._events = {};

    realm.rootEmitter.on('*', (event) => {
      const id = event.testFilePath
        ? path.basename(event.testFilePath, '.js') + '.json'
        : 'aggregatedResult.json';

      this._events[id] = this._events[id] || [];
      this._events[id].push(event);
    });
  }

  onRunComplete() {
    for (const [fileName, events] of Object.entries(this._events)) {
      const contents = JSON.stringify(events, null, 2);
      const fixturePath = path.join(__dirname, '../fixtures', fileName);
      fs.writeFileSync(fixturePath, contents + '\n');
    }
  }
}

module.exports = MockReporter;
