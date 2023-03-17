export type SetMetadataEvent = {
  type: 'set_metadata';
  testFilePath?: string;
  targetId: string; // instance ID
  path?: string | string[];
  value: unknown;
  operation: 'set' | 'assign' | 'merge' | 'push';
};
