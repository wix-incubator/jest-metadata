import type { ProcessRealm } from './ProcessRealm';

export function isServer(): boolean {
  return !getServerId();
}

export function isClient(): boolean | undefined {
  return !isServer();
}

export function registerServerId(id: string): void {
  process.env.JEST_METADATA_SERVER = id;
}

export function injectRealmIntoSandbox(sandbox: any, realm: ProcessRealm): void {
  sandbox.__JEST_METADATA__ = realm;
}

export function getSandboxedRealm(): ProcessRealm | undefined {
  return (global as any).__JEST_METADATA__;
}

export function getServerId(): string | undefined {
  return process.env.JEST_METADATA_SERVER;
}

export function getClientId(): string {
  return process.env.JEST_METADATA_SERVER + '.' + (process.env.JEST_WORKER_ID || '0');
}
