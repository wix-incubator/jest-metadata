import JestEnvironmentJsdom from 'jest-environment-jsdom';
import { WithMetadata } from './environment-decorator';

export { ForwardedCircusEvent } from './environment-hooks';
export const TestEnvironment = WithMetadata(JestEnvironmentJsdom);
export default TestEnvironment;