import { realm } from './realms';
import { combineEmitters } from './utils';

export const state = realm.aggregatedResultMetadata;
export const events = combineEmitters(realm.rootEmitter, realm.setEmitter);
