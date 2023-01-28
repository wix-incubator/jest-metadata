import { startTestFile, handleTestEvent, current } from './index';
import { aStartDescribeDefinitionEvent, aState} from "./__fixtures__";

describe('jest-extend-report/circus', () => {
  describe('current', () => {
    describe('when no test file is running', () => {
      test('context should be undefined', () => expect(current.context).toBeUndefined());
      test('describeBlock should be undefined', () => expect(current.describeBlock).toBeUndefined());
      test('execution should be undefined', () => expect(current.execution).toBeUndefined());
      test('hook should be undefined', () => expect(current.hook).toBeUndefined());
      test('run should be undefined', () => expect(current.run).toBeUndefined());
      test('testEntry should be undefined', () => expect(current.testEntry).toBeUndefined());
      test('testFn should be undefined', () => expect(current.testFn).toBeUndefined());
      test('testInvocation should be undefined', () => expect(current.testInvocation).toBeUndefined());
    });

    describe('when a test file is running', () => {
      beforeEach(() => startTestFile('test-file'));

      test('context should be a run context', () => expect(current.context).toBe(current.run));
      test('run should be defined', () => expect(current.run).toBeDefined());
      test('describeBlock should be undefined', () => expect(current.describeBlock).toBeUndefined());
      test('execution should be undefined', () => expect(current.execution).toBeUndefined());
      test('hook should be undefined', () => expect(current.hook).toBeUndefined());
      test('testEntry should be undefined', () => expect(current.testEntry).toBeUndefined());
      test('testFn should be undefined', () => expect(current.testFn).toBeUndefined());
      test('testInvocation should be undefined', () => expect(current.testInvocation).toBeUndefined());

      describe('when a describe block is added', () => {
        beforeEach(() => handleTestEvent(aStartDescribeDefinitionEvent(), aState()));

        test('context should be a describe context', () => expect(current.context).toBe(current.describeBlock));
        test('run should be defined', () => expect(current.run).toBeDefined());
        test('describeBlock should be defined', () => expect(current.describeBlock).toBeDefined());
        test('execution should be undefined', () => expect(current.execution).toBeUndefined());
        test('hook should be undefined', () => expect(current.hook).toBeUndefined());
        test('testEntry should be undefined', () => expect(current.testEntry).toBeUndefined());
        test('testFn should be undefined', () => expect(current.testFn).toBeUndefined());
        test('testInvocation should be undefined', () => expect(current.testInvocation).toBeUndefined());
      });
    });
  });
});
