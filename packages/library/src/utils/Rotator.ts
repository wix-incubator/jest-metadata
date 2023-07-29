export class Rotator<T> {
  #items: T[] = [];
  #offset = 0;

  get size() {
    return this.items.length;
  }

  get offset() {
    return this.#offset;
  }

  get items(): readonly T[] {
    return [...this.#items.slice(this.offset), ...this.#items.slice(0, this.offset)];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    let i = this.size;
    while (i--) {
      const item = this.next()!;
      if (predicate(item)) {
        return item;
      }
    }

    return;
  }

  reset(): this {
    this.#offset = 0;
    return this;
  }

  add(...items: T[]): this {
    this.#items.push(...items);
    return this;
  }

  next(): T | undefined {
    const item = this.#items[this.offset];
    this.#offset = (this.offset + 1) % this.items.length;
    return item;
  }
}
