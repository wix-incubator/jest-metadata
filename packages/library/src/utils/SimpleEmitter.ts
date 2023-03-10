export class SimpleEmitter<T extends { type: string }> {
  private listeners: Map<T['type'], ((event: T) => void)[]> = new Map();

  on(type: T['type'], listener: (event: T) => void): this {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
    return this;
  }

  emit(event: T) {
    const eventType = event.type as T['type'];
    const listeners = this.listeners.get(eventType) || [];

    for (const listener of listeners) {
      listener(event);
    }
  }
}
