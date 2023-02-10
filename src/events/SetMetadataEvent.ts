export type SetMetadataEvent = {
  type: 'set_metadata';
  target: string; // instance ID
  value: object;
  deepMerge: boolean;
};
