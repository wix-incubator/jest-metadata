export type SetMetadataEvent = {
  type: 'set_metadata';
  targetId: string; // instance ID
  value: object;
  deepMerge: boolean;
};
