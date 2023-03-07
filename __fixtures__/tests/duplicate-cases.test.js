describe.each([
  [1, 2],
  [2, 2],
])('Suite', (a, c) => {
  test.each([
    [1],
    [0],
  ])('Test', (b) => {
    expect(a + b).toBe(c);
  });
});
