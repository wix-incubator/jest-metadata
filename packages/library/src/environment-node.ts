import importCwd from 'import-cwd';

import WithMetadata from './environment-decorator';

const JestEnvironmentNode: any = importCwd('jest-environment-node');

export const TestEnvironment = WithMetadata(JestEnvironmentNode.default ?? JestEnvironmentNode);
export default TestEnvironment;
