export default class InstanceCache<Key extends object, Value> {
  private readonly cache = new WeakMap<Key, Value>();

  get(key: Key, create: () => Value): Value {
    if (!this.cache.has(key)) {
      const value = create();
      this.cache.set(key, value);
      return value;
    }

    return this.cache.get(key)!;
  }
}
