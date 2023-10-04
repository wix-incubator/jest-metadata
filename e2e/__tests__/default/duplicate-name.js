const { metadata } = require('jest-metadata');

jest.retryTimes(1);

let attemptIndex = 0;
describe('Suite', () => {
  beforeAll(() => metadata.set('note', 'Suite'));

  describe('Nested suite', () => {
    beforeAll(() => metadata.set('note', 'Nested suite 1 > beforeAll'));
    afterAll(() => metadata.set('note', 'Nested suite 1 > afterAll'));

    it('Test', () => {
      metadata.set('note', 'Nested suite 1 > Test 1')
      expect(++attemptIndex).toBe(1);
    });

    it('Test', () => {
      metadata.set('note', 'Nested suite 1 > Test 2')
      expect(++attemptIndex).toBe(3);
    });
  });

  it.skip('Ignore it', () => {
    /*...*/
  });

  it.todo('Ignore it');

  describe('Nested suite', () => {
    beforeAll(() => metadata.set('note', 'Nested suite 2 > beforeAll'));
    afterAll(() => metadata.set('note', 'Nested suite 2 > afterAll'));

    it('Test', () => {
      metadata.set('note', 'Nested suite 2 > Test 1')
      expect(attemptIndex--).toBe(2);
    });

    it('Test', () => {
      metadata.set('note', 'Nested suite 2 > Test 2')
      expect(attemptIndex).toBe(2);
    });
  });
});
