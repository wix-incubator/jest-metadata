import { isServer, isClient } from './detect';
import { ChildProcessRealm } from './ChildProcessRealm';

export default new ChildProcessRealm(isServer() === isClient());
