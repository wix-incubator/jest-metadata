import { hello } from './index';

describe('jest-extend-report', () => {
  it('should be importable', () => {
    expect(hello).toBe('world');
  });
});
