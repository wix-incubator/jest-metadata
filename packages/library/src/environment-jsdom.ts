/* eslint-disable @typescript-eslint/no-explicit-any */

import importCwd from 'import-cwd';

import WithMetadata from './environment-decorator';

const JestEnvironmentJsdom: any = importCwd('jest-environment-jsdom');

export const TestEnvironment = WithMetadata(JestEnvironmentJsdom.default ?? JestEnvironmentJsdom);
export default TestEnvironment;
