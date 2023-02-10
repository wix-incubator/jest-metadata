export class Ref {
  constructor(private readonly value: unknown) {}

  toString() {
    return String(this.value);
  }

  equals(other: Ref) {
    return this.value === other.value;
  }
}
