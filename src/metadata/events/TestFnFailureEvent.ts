export type TestFnFailureEvent = {
  type: 'test_fn_failure';
  testFilePath: string;
  testId: string;
};
