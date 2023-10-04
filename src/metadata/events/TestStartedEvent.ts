export type TestStartedEvent = {
  type: 'test_started';
  testFilePath: string;
  testId: string;
};
