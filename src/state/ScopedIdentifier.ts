export class ScopedIdentifier {
  constructor(private readonly _testFilePath = '', private readonly _identifier = '') {}

  get testFilePath(): string {
    return this._testFilePath;
  }

  get identifier(): string {
    return this._identifier;
  }

  static global(identifier: string): ScopedIdentifier {
    return new ScopedIdentifier('', identifier);
  }

  static parse(id: string): ScopedIdentifier {
    const [testFilePath, identifier] = id.split(':');
    return new ScopedIdentifier(testFilePath, identifier);
  }

  static normalize(id: string | ScopedIdentifier): ScopedIdentifier {
    return typeof id === 'string' ? ScopedIdentifier.parse(id) : id;
  }

  toString() {
    return `${this._testFilePath || ''}:${this._identifier}`;
  }

  equals(other: ScopedIdentifier) {
    return this._testFilePath === other._testFilePath && this._identifier === other._identifier;
  }

  derive(identifier: string) {
    return new ScopedIdentifier(this._testFilePath, identifier);
  }

  nest(subIdentifier: string) {
    return new ScopedIdentifier(this._testFilePath, `${this._identifier}:${subIdentifier}`);
  }
}
