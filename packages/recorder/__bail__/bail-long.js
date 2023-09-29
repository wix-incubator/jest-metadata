it('should succeed immediately', () => {
  expect(true).toBe(true);
});

it('should succeed in 5 seconds', (done) => {
  setTimeout(done, 5000);
}, 6000);
