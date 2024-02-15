export type WriteMetadataEvent = {
  type: 'write_metadata';
  testFilePath?: string;
  targetId: string; // instance ID
  path?: string | readonly string[];
  value: unknown;
  operation: 'set' | 'assign' | 'defaults' | 'merge' | 'push' | 'unshift';
};
