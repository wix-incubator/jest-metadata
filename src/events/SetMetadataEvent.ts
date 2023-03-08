export type SetMetadataEvent = {
  type: 'set_metadata';
  testFilePath?: string;
  targetId: string; // instance ID
  value: Record<string, unknown>;
  deepMerge: boolean;
};
