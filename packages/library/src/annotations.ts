import { realm } from './realms';

const { $Get, $Set, $Push, $Assign, $Merge } = realm.metadataDSL;

export * from './index';
export { $Get, $Set, $Push, $Assign, $Merge };
