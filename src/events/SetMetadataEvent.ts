import { Data } from '../state';

export type SetMetadataEvent = {
  type: 'set_metadata';
  testFilePath?: string;
  targetId: string; // instance ID
  value: Data;
  deepMerge: boolean;
};
