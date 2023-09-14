import path from 'path';
import type { TestEnvironment as JsdomTestEnvironment } from 'jest-environment-jsdom';

export function requireJestEnvironmentNode() {
  return require('jest-environment-node');
}

export function requireJestEnvironmentJsDom() {
  return requireViaChain('jest-environment-jsdom') as typeof JsdomTestEnvironment;
}

function requireViaChain(targetModuleName: string, chain?: string[]) {
  let cwd = process.cwd();
  if (chain) {
    for (const module of chain) {
      cwd = path.dirname(require.resolve(module + '/package.json', { paths: [cwd] }));
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const theModule = requireViaPath(targetModuleName, cwd);
  return theModule;
}

function requireViaPath(modulePath: string, viaPath: string) {
  return require(require.resolve(modulePath, { paths: [viaPath] }));
}
