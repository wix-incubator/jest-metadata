const fs = require('fs').promises;
const path = require('path');

const NodeJestEnvironment = require('jest-environment-node').default;
const { startTestFile, handleTestEvent, flush } = require('jest-metadata/dist/circus');
const { hijackEventQueue } = require('jest-metadata/dist/__backdoors__/hijackEventQueue');

class TestEnvironment extends NodeJestEnvironment {
  constructor(config, context) {
    super(config, context);
    this._eventsPath = path.join(
      __dirname,
      '../fixtures',
      path.basename(context.testPath, '.js') + '.json',
    );

    this._events = [];
    hijackEventQueue((event) => {
      if (event.testFilePath) {
        event.testFilePath = path.relative(__dirname, event.testFilePath);
      }

      this._events.push(event);
    });

    startTestFile(context.testPath);
  }

  handleTestEvent = (event, state) => {
    // A good place for a breakpoint
    handleTestEvent(event, state);
  };

  async teardown() {
    await flush();
    await fs.writeFile(this._eventsPath, JSON.stringify(this._events, null, 2));
    await super.teardown();
  }
}

module.exports = TestEnvironment;
