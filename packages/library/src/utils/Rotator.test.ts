import { Rotator } from './Rotator';

describe('Rotator', () => {
  let rotator: Rotator<number>;

  beforeEach(() => {
    rotator = new Rotator();
  });

  describe('when created', () => {
    it('should have size 0', () => {
      expect(rotator.size).toBe(0);
    });

    it('should have offset 0', () => {
      expect(rotator.offset).toBe(0);
    });

    it('should have empty items', () => {
      expect(rotator.items).toEqual([]);
    });

    it('should return undefined when next is called', () => {
      expect(rotator.next()).toBeUndefined();
    });

    it('should return empty array when items is called', () => {
      expect(rotator.items).toEqual([]);
    });
  });

  it('should work as a rotating queue', () => {
    rotator.add(1, 2, 3);
    expect(rotator.items).toEqual([1, 2, 3]);
    expect(rotator.next()).toBe(1);
    expect(rotator.next()).toBe(2);
    expect(rotator.items).toEqual([3, 1, 2]);

    rotator.add(4);
    expect(rotator.items).toEqual([3, 4, 1, 2]);
    expect(rotator.offset).toBe(2);

    rotator.reset();
    expect(rotator.offset).toBe(0);
    expect(rotator.items).toEqual([1, 2, 3, 4]);
  });

  it('should find an item by predicate', () => {
    rotator.add(1, 2, 3);
    rotator.next();
    expect(rotator.find((item) => item % 2 === 1)).toBe(3);
    expect(rotator.next()).toBe(1);
  });

  it('should make a full rotation if it cannot find an item', () => {
    rotator.add(1, 2, 3);
    rotator.next();
    expect(rotator.find((item) => item === 4)).toBeUndefined();
    expect(rotator.next()).toBe(2);
  });
});
