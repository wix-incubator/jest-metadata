export type RunDescribeFinishEvent = {
  type: 'run_describe_finish';
  testFilePath: string;
  describeId: string;
};
