import { describe, it, expect } from '@jest/globals';
import { set } from './set';

describe('set function', () => {
  it('should set a value for a simple path', () => {
    const obj: any = {};
    set(obj, 'a', 42);
    expect(obj.a).toBe(42);
  });

  it('should set a value for a nested path', () => {
    const obj: any = {};
    set(obj, 'a.b.c', 42);
    expect(obj.a.b.c).toBe(42);
  });

  it('should set a value for a nested path with array syntax', () => {
    const obj: any = {};
    set(obj, ['a', 'b', 'c'], 42);
    expect(obj.a.b.c).toBe(42);
  });

  it('should not set a value for unsafe keys', () => {
    const obj: any = {};
    set(obj, '__proto__.unsafe', 42);
    expect(obj.unsafe).toBeUndefined();
  });

  it('should override existing properties', () => {
    const obj = { a: 1 };
    set(obj, 'a', 42);
    expect(obj.a).toBe(42);
  });

  it.each([[null], [undefined], [42], ['string'], [true]])(
    'should handle non-object targets gracefully: %j',
    (obj: unknown) => {
      expect(() => set(obj, 'a', 42)).not.toThrow();
    },
  );
});
