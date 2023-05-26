import { realm } from './realms';

export const state = realm.aggregatedResultMetadata;
export const events = realm.combinedEmitter;

const { $Get, $Set, $Push, $Assign, $Merge } = realm.metadataDSL;
export { $Get, $Set, $Push, $Assign, $Merge };
