import { ChildProcessRealm } from './ChildProcessRealm';
import { ParentProcessRealm } from './ParentProcessRealm';
import type { ProcessRealm } from './ProcessRealm';
import { getSandboxedRealm, isClient } from './detect';

function createRealm(): ProcessRealm {
  return isClient() ? new ChildProcessRealm() : new ParentProcessRealm();
}

export default getSandboxedRealm() ?? createRealm();
