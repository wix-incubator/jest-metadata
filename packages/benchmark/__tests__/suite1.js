const { generateTests } = require('../utils');

describe('Passing suite', () => {
  test.each(generateTests())('%i + %i should be %i', (a, b, c) => {
    expect(a + b).toBe(c);
  });
});
