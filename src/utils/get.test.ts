import { describe, it, expect } from '@jest/globals';
import { get } from './get';

describe('get function', () => {
  it('retrieves a simple property', () => {
    expect(get({ a: 42 }, 'a')).toBe(42);
  });

  it('retrieves a nested property', () => {
    expect(get({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('retrieves a nested property using array syntax', () => {
    expect(get({ a: { b: { c: 42 } } }, ['a', 'b', 'c'])).toBe(42);
  });

  it('returns undefined for nonexistent properties', () => {
    expect(get({}, 'a')).toBeUndefined();
  });

  it('retrieves a property that is explicitly set to null', () => {
    expect(get({ a: null }, 'a')).toBeNull();
  });

  it('returns undefined for an incomplete path', () => {
    expect(get({ a: 42 }, 'a.b')).toBeUndefined();
  });

  it('returns undefined for a nonexistent nested property', () => {
    expect(get({ a: { b: 42 } }, 'a.b.c')).toBeUndefined();
  });

  it('returns undefined when object is a primitive', () => {
    expect(get(42, 'a')).toBeUndefined();
  });

  it('returns undefined when object is null', () => {
    expect(get(null, 'a')).toBeUndefined();
  });

  it('returns undefined when object is undefined', () => {
    expect(get(undefined, 'a')).toBeUndefined();
  });

  it('returns the default value if provided and property is not found', () => {
    expect(get({}, 'a', 'default')).toBe('default');
  });

  it('infers the return type from the default value', () => {
    const result: number | undefined = get({}, 'a', 42);
    expect(result).toBe(42);
  });
});
