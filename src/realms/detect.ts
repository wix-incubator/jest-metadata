/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ProcessRealm } from './ProcessRealm';

const _initialServerId = getServerId();

export function isServer(): boolean {
  return !_initialServerId;
}

export function isClient(): boolean {
  return !!_initialServerId;
}

export function registerServerId(id: string): void {
  process.env.JEST_METADATA_SERVER = id;
}

export function isJestWorker(): boolean {
  return 'JEST_WORKER_ID' in process.env;
}

export function injectRealmIntoSandbox(sandbox: any, realm: ProcessRealm): ProcessRealm {
  sandbox.__JEST_METADATA__ = realm;
  if (sandbox !== globalThis) {
    sandbox.__JEST_METADATA_SANDBOX__ = true;
  }

  return realm;
}

export function getSandboxedRealm(): ProcessRealm | undefined {
  const globalAny = globalThis as any;
  const realm = globalAny.__JEST_METADATA__;
  if (realm && !globalAny.__JEST_METADATA_SANDBOX__) {
    console.warn(
      '[jest-metadata] Detected duplicate jest-metadata package in the same process. This may lead to unexpected behavior.',
    );
  }

  return realm;
}

export function getServerId(): string | undefined {
  return process.env.JEST_METADATA_SERVER;
}

export function getClientId(): string {
  return process.env.JEST_METADATA_SERVER + '.' + (process.env.JEST_WORKER_ID || '0');
}
