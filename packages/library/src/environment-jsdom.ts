import importCwd from 'import-cwd';

// eslint-disable-next-line import/no-named-as-default
import WithMetadata from './environment-decorator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JestEnvironmentJsdom: any = importCwd('jest-environment-jsdom');

export const TestEnvironment = WithMetadata(JestEnvironmentJsdom.default ?? JestEnvironmentJsdom);
export default TestEnvironment;
