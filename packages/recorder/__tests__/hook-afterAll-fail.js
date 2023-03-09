afterAll(() => {});

describe('Suite', () => {
  test('Test', () => {});

  afterAll(() => {
    throw new Error('afterAll');
  });
});
