import { describe, it, expect } from '@jest/globals';
import { isPrimitive } from './isPrimitive';

describe('isPrimitive function', () => {
  it('returns true for numbers', () => {
    expect(isPrimitive(42)).toBe(true);
  });

  it('returns true for strings', () => {
    expect(isPrimitive('Hello')).toBe(true);
  });

  it('returns true for booleans', () => {
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
  });

  it('returns true for null', () => {
    expect(isPrimitive(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isPrimitive(void 0)).toBe(true);
  });

  it('returns false for objects', () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive({ key: 'value' })).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive([1, 2, 3])).toBe(false);
  });

  it('returns false for functions', () => {
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(function () {})).toBe(false);
  });
});
