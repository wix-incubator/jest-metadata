export type TestDoneEvent = {
  type: 'test_done';
  testFilePath: string;
  testId: string;
};
