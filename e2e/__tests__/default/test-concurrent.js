const { metadata } = require('jest-metadata');

test.concurrent.each([
  [100],
  [200],
  [300],
  [400],
  [500],
])('sleeps for %i ms', async (ms) => {
  const start = Date.now();
  await new Promise((resolve) => setTimeout(resolve, ms + 1))
  const end = Date.now();
  expect(end - start).toBeGreaterThanOrEqual(ms);
  metadata.set('test.slept', ms);
});
