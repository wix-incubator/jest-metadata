export class InstanceCache {
  private readonly cache = new WeakMap<any, string>();
  private counter = 0;

  getInstanceId = (obj: any): string => {
    if (!this.cache.has(obj)) {
      this.cache.set(obj, `${this.counter++}`);
    }

    return this.cache.get(obj)!;
  };
}
