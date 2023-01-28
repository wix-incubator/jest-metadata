export default class MockInstanceCache<Key extends object, Value> {
  private readonly cache: Record<string, Value> = {};

  static mark(key: object, id: string) {
    (key as any)['__id'] = id;
  }

  get(key: Key, create: () => Value): Value {
    const id = key ? (key as any)['__id'] : undefined;
    if (!id) {
      return create();
    }

    if (!this.cache[id]) {
      this.cache[id] = create();
    }

    return this.cache[id];
  }
}
