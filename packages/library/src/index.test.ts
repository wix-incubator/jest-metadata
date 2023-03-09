import fixtures from '@jest-metadata/fixtures';

import { rootEventHandler } from './circus';

describe('Integration', () => {
  test.each(Object.values(fixtures))(`should not crash on: %s`, (_name: string, fixture: any[]) => {
    for (const event of fixture) {
      rootEventHandler.handle(event);
    }
  });
});
