import importCwd from 'import-cwd';

// eslint-disable-next-line import/no-named-as-default
import WithMetadata from './environment-decorator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JestEnvironmentNode: any = importCwd('jest-environment-node');

export const TestEnvironment = WithMetadata(JestEnvironmentNode.default ?? JestEnvironmentNode);
export default TestEnvironment;
