export type TestRetryEvent = {
  type: 'test_retry';
  testFilePath: string;
  testId: string;
};
