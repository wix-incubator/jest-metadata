import { realm, ParentProcessRealm } from '..';

describe('realms: integration test', () => {
  test('should be a parent realm', () => {
    expect(realm).toBeInstanceOf(ParentProcessRealm);
  });
});
