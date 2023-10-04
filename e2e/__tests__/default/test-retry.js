jest.retryTimes(1);

let counter = 1;
beforeAll(() => {});
test('should pass on the second time', () => {
  expect(counter++).toBe(2);
});
afterAll(() => {});
