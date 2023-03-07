import fs from 'fs';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../__fixtures__/events');

describe('Integration', () => {
  it('should not fail', () => {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, 'duplicate-name@29.4.3.json')).toString('utf8'),
    );
    const { rootEventHandler } = jest.requireActual('./circus');
    for (const event of fixture) {
      rootEventHandler.handle(event);
    }
  });
});
