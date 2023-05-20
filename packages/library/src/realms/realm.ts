/* eslint-disable @typescript-eslint/no-var-requires,node/no-missing-require */
// TODO: think about ESM support via dynamic import
import { getSandboxedRealm, isClient } from './detect';
import type { ProcessRealm } from './ProcessRealm';

function createRealm(): ProcessRealm {
  if (isClient()) {
    const { ChildProcessRealm } = require('./ChildProcessRealm');
    return new ChildProcessRealm();
  } else {
    const { ParentProcessRealm } = require('./ParentProcessRealm');
    return new ParentProcessRealm();
  }
}

export default getSandboxedRealm() ?? createRealm();
