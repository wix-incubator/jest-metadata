export type TestStartEvent = {
  type: 'test_start';
  testFilePath: string;
  testId: string;
};
