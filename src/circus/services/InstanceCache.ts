export default class InstanceCache<Key extends object, Value> {
  private readonly cache = new WeakMap<Key, Value>();

  get(key: Key): Value | undefined;
  get(key: Key, create: () => Value): Value;
  get(key: Key, create?: () => Value): Value | undefined {
    if (!this.cache.has(key) && create) {
      const value = create();
      this.cache.set(key, value);
      return value;
    }

    return this.cache.get(key);
  }
}
