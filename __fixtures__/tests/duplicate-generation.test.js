jest.retryTimes(1);

let attemptIndex = 0;

for (let i = 0; i < 2; i++) {
  test('should be greater than 1', () => {
    expect(++attemptIndex).toBeGreaterThan(1);
  });
}
