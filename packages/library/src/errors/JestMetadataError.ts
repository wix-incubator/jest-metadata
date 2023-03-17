export class JestMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JestMetadataError';
  }
}
