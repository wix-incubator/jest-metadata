/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../utils';
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

/**
 * Workaround for the fallback mode, when Jest uses jest-environment-node.
 * Jest blindly copies `globalThis` into the sandbox, so it is not enough to
 * simply check that __JEST_METADATA_SANDBOX__ is not truthy.
 *
 * This is especially bad in Jest's single worker mode, because
 * reporter's globalThis === testEnvironment's globalThis == sandbox.
 *
 * This hook is enabled after the copying happens, and disabled at later stages
 * when all potentially conflicting packages are loaded. It is not easy to
 * grasp, but it works.
 */
export function detectDuplicateRealms(enabled: boolean): void {
  const globalAny = globalThis as any;
  globalAny.__JEST_METADATA_SANDBOX__ = enabled ? false : undefined;
}

export function getSandboxedRealm(): ProcessRealm | undefined {
  const globalAny = globalThis as any;
  const realm = globalAny.__JEST_METADATA__ as ProcessRealm | undefined;
  if (realm && globalAny.__JEST_METADATA_SANDBOX__ === false) {
    logger.warn(
      'Detected duplicate jest-metadata package in the same process. This may lead to unexpected behavior.',
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
