// eslint-disable-next-line node/no-unpublished-import
import type {Circus} from '@jest/types';

export function aStartDescribeDefinitionEvent(): any {
  return {
    name: 'start_describe_definition',
    asyncError: undefined,
    fn: undefined,
    mode: undefined,
    parent: undefined,
    tests: undefined,
    type: undefined,
  };
}

export function aDescribeBlock(): Circus.DescribeBlock {
  return {
    children: [],
    hooks: [],
    mode: 'skip',
    name: 'a describe block',
    tests: [],
  } as any;
}

export function aState(): Circus.State {
  return {
    currentDescribeBlock: aDescribeBlock(),
    hasFocusedTests: false,
    testNamePattern: '',
    testTimeout: 0,
  } as any;
}
