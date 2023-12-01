import { ParentProcessRealm, realm } from './realms';

export { Shallow } from './jest-reporter';

export function isFallback() {
  return realm.type === 'parent_process'
    ? (realm as ParentProcessRealm).fallbackAPI.enabled
    : undefined;
}

export const events = realm.events;
