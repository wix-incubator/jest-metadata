import { ChildProcessRealm } from './ChildProcessRealm';
import { getSandboxedRealm, isClient } from './detect';
import { ParentProcessRealm } from './ParentProcessRealm';
import type { ProcessRealm } from './ProcessRealm';

function createRealm(): ProcessRealm {
  return isClient() ? new ChildProcessRealm() : new ParentProcessRealm();
}

export default getSandboxedRealm() ?? createRealm();
