import { getVersion } from './getVersion';

describe('getVersion', () => {
  it('should return the version', () => {
    // eslint-disable-next-line unicorn/no-unsafe-regex
    expect(getVersion()).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);
  });
});
