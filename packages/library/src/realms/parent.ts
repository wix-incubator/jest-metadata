import type { ParentProcessRealm } from './ParentProcessRealm';
import realm from './realm';

if (realm.type !== 'parent_process') {
  throw new Error('This file should only be imported in the parent process');
}

export default realm as ParentProcessRealm;
