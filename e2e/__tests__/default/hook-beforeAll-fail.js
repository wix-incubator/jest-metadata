beforeAll(() => {
  throw new Error('beforeAll');
});

test.skip('Skipped test', () => {});

describe('Suite', () => {
  test('Test', () => {});
});
