import { iterateSorted } from './iterateSorted';

describe('iterateSorted', () => {
  const ordered = ['a', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
  const getIndex = (x: string) => ordered.indexOf(x);

  it('should iterate over two sorted arrays', () => {
    const a = ['a', 'fox', 'jumps', 'over', 'the', 'dog'];
    const b = ['quick', 'brown', 'lazy'];
    const c = [...iterateSorted(getIndex, a, b)];
    const d = [...iterateSorted(getIndex, b, a)];

    expect(c).toEqual(ordered);
    expect(d).toEqual(ordered);
  });

  it('should iterate once if arrays are the same', () => {
    const a = ['a', 'fox', 'jumps', 'over', 'the', 'dog'];
    const b = a;
    const c = [...iterateSorted(getIndex, a, b)];
    expect(c).toEqual(a);
  });
});
