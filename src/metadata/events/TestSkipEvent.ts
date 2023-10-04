export type TestSkipEvent = {
  type: 'test_skip';
  testFilePath: string;
  testId: string;
};
