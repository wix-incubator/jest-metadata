import JestEnvironmentNode from 'jest-environment-node';
import { WithMetadata } from './environment-decorator';

export { ForwardedCircusEvent } from './environment-hooks';
export const TestEnvironment = WithMetadata(JestEnvironmentNode);
export default TestEnvironment;
