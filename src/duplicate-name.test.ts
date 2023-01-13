jest.retryTimes(1);

let attemptIndex = 0;
describe('Suite', () => {
  beforeAll(() => process.stdout.write('Suite > beforeAll\n'));

  describe('Nested suite', () => {
    beforeAll(() => process.stdout.write('Suite > Nested suite 1 > beforeAll\n'));

    it('Test', () => {
      expect(attemptIndex++).toBe(1);
    });

    it('Test', () => {
      expect(attemptIndex).toBe(1);
    });
  });

  it.skip('Ignore it', () => {
    /*...*/
  });

  it.todo('Ignore it');

  describe('Nested suite', () => {
    beforeAll(() => process.stdout.write('Suite > Nested suite 2 > beforeAll\n'));

    it('Test', () => {
      expect(attemptIndex).toBe(2);
    });

    it('Test', () => {
      expect(attemptIndex).toBe(2);
    });
  });
});
