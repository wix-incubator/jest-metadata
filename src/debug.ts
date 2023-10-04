import { ParentProcessRealm, realm } from './realms';

export { aggregateLogs } from './utils';

export function isEnabled() {
  return !!process.env.JEST_METADATA_DEBUG;
}

export function isFallback() {
  return realm.type === 'parent_process'
    ? (realm as ParentProcessRealm).fallbackAPI.enabled
    : undefined;
}

export const events = realm.events;
