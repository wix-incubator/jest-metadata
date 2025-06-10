import { describe, it, expect } from '@jest/globals';
import { memoizeArg1 } from './memoizeArg1';

describe('memoizeArg1', () => {
  it('should return the same function when called with the same first argument', () => {
    let counter = -1;
    const incrementalAdd = () => {
      counter++;
      return (a: number, b: number) => a + b + counter;
    };

    const add = memoizeArg1(incrementalAdd);
    expect(add(2, 3)).toBe(5); // counter=0
    expect(add(2, 4)).toBe(6); // counter=0
    expect(add(3, 2)).toBe(6); // counter=1
    expect(add(3, 4)).toBe(8); // counter=1
    expect(add(4, 2)).toBe(8); // counter=2
  });
});
