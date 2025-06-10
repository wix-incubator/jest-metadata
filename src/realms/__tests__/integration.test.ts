import { describe, test, expect } from '@jest/globals';
import { realm } from '../index';

describe('realms: integration test', () => {
  test('should be a parent realm', () => {
    expect(Object.getPrototypeOf(realm).constructor.name).toBe('ParentProcessRealm');
  });
});
