const { generateTests } = require('../../utils/benchmarkUtils');

describe('Failing suite', () => {
  test.each(generateTests())('%i + %i should be %i', (a, b, c) => {
    expect(a + b).not.toBe(c);
  });
});
