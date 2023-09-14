import JestEnvironmentJsdom from 'jest-environment-jsdom';
import WithMetadata from './environment-decorator';

export const TestEnvironment = WithMetadata(JestEnvironmentJsdom);
export default TestEnvironment;
