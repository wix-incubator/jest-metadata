const fs = require('fs').promises;
const path = require('path');
const { version: JEST_VERSION } = require('jest/package.json');

const NodeJestEnvironment = require('jest-environment-node').default;
const { startTestFile, handleTestEvent } = require('jest-extend-report/dist/circus');
const { hijackEventQueue } = require('jest-extend-report/dist/circus/__backdoors__/hijackEventQueue');

class TestEnvironment extends NodeJestEnvironment {
  constructor(config, context) {
    super(config, context);
    this._eventsPath = path.join(
      __dirname,
      'events',
      `${path.basename(context.testPath, '.test.js')}@${JEST_VERSION}.json`
    );

    this._events = [];
    hijackEventQueue((event) => this._events.push(event));

    startTestFile(context.testPath);
  }

  handleTestEvent = handleTestEvent;

  async teardown() {
    await fs.writeFile(this._eventsPath, JSON.stringify(this._events, null, 2));
    await super.teardown();
  }
}

module.exports = TestEnvironment;
