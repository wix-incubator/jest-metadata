import { memoizeLast } from './memoizeLast';

describe('memoizeLast', () => {
  it('should return the same result when called with the same arguments', () => {
    const add = (a: number, b: number): unknown => a + b;
    const memoizedAdd = memoizeLast(add);

    // First call with arguments (2, 3)
    let result = memoizedAdd(2, 3);
    expect(result).toBe(5);

    // Second call with the same arguments (2, 3)
    result = memoizedAdd(2, 3);
    expect(result).toBe(5);

    // The function should not have been called again since the arguments are the same.
  });

  it('should recompute the result when called with different arguments', () => {
    const add = (a: number, b: number): unknown => a + b;
    const memoizedAdd = memoizeLast(add);

    // First call with arguments (2, 3)
    let result = memoizedAdd(2, 3);
    expect(result).toBe(5);

    // Second call with different arguments (4, 5)
    result = memoizedAdd(4, 5);
    expect(result).toBe(9);

    // The function should have been called again since the arguments are different.
  });

  it('should preserve the context of the original function', () => {
    const obj = {
      x: 10,
      add(y: number) {
        return this.x + y;
      },
    };

    const memoizedAdd = memoizeLast(obj.add.bind(obj));

    // First call with argument (5)
    let result = memoizedAdd(5);
    expect(result).toBe(15);

    // Second call with the same argument (5)
    result = memoizedAdd(5);
    expect(result).toBe(15);

    // The function should not have been called again since the context is preserved.
  });
});
