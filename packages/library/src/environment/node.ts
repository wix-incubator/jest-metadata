import importCwd from 'import-cwd';

import Metadata from './hoc';

const JestEnvironmentNode: any = importCwd('jest-environment-node');

export default Metadata(JestEnvironmentNode);
