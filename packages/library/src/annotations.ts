import { MetadataDSL } from './metadata';
import { state, events } from './index';

const { $Get, $Set, $Push, $Assign, $Merge } = new MetadataDSL(events, () => state.currentMetadata);

export { $Get, $Set, $Push, $Assign, $Merge };
export * from './index';
