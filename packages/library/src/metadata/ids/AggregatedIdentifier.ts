export class AggregatedIdentifier {
  constructor(
    private readonly _testFilePath: string | undefined,
    private readonly _identifier = '',
  ) {}

  get testFilePath(): string | undefined {
    return this._testFilePath;
  }

  get identifier(): string {
    return this._identifier;
  }

  static global(identifier: string): AggregatedIdentifier {
    return new AggregatedIdentifier('', identifier);
  }

  static parse(id: string): AggregatedIdentifier {
    const [testFilePath, identifier] = id.split(':');
    return new AggregatedIdentifier(testFilePath, identifier);
  }

  static normalize(id: string | AggregatedIdentifier): AggregatedIdentifier {
    return typeof id === 'string' ? AggregatedIdentifier.parse(id) : id;
  }

  toString() {
    return `${this._testFilePath || ''}:${this._identifier}`;
  }

  equals(other: AggregatedIdentifier) {
    return this._testFilePath === other._testFilePath && this._identifier === other._identifier;
  }

  nest(subIdentifier: string) {
    return new AggregatedIdentifier(this._testFilePath, `${this._identifier}.${subIdentifier}`);
  }
}
