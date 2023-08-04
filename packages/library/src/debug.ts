import { realm } from './realms';

export { aggregateLogs } from './utils';

export function isEnabled() {
  return !!process.env.JEST_METADATA_DEBUG;
}

export function isFallback() {
  return realm.fallbackAPI.enabled;
}

export const setEmitter = realm.setEmitter;
